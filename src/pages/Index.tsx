
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RegionSelector from '../components/RegionSelector';
import Map from '../components/Map';
import FloodStats from '../components/FloodStats';
import ChartSection from '../components/ChartSection';
import PredictionCard from '../components/PredictionCard';
import HistoricalFloodData from '../components/HistoricalFloodData';
import { getFloodDataForRegion, fetchImdData, floodData } from '../data/floodData';
import { useReservoirFloodData } from '../hooks/useReservoirFloodData';
import { useToast } from '../hooks/use-toast';
import { Clock, RefreshCw, AlertTriangle, LogIn, LogOut, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import CursorAiIndicator from '../components/CursorAiIndicator';

const Index = () => {
  const [selectedRegion, setSelectedRegion] = useState('mumbai');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [nextUpdateTime, setNextUpdateTime] = useState<Date>(new Date(Date.now() + 12 * 60 * 60 * 1000));
  const [dataFreshness, setDataFreshness] = useState<'fresh' | 'stale' | 'updating'>('updating');
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentFloodData, setCurrentFloodData] = useState(floodData);
  
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use the new reservoir flood data hook
  const { 
    isLoading: reservoirLoading, 
    error: reservoirError, 
    updateFloodDataWithReservoirs,
    lastUpdated: reservoirLastUpdated,
    reservoirCount
  } = useReservoirFloodData();

  // Get current region's flood data (now enhanced with live reservoir data)
  const floodDataForRegion = getFloodDataForRegion(selectedRegion);
  const enhancedFloodData = floodDataForRegion ? 
    updateFloodDataWithReservoirs([floodDataForRegion])[0] : null;

  // Improved data fetching function with consistency handling
  const loadFloodData = useCallback(async (forceRefresh = false) => {
    const currentState = forceRefresh ? 'updating' : dataFreshness;
    setDataFreshness(currentState);
    
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      await fetchImdData(forceRefresh);
      
      // Update flood data with reservoir information
      const updatedFloodData = updateFloodDataWithReservoirs(floodData);
      setCurrentFloodData(updatedFloodData);
      
      const now = new Date();
      setLastUpdateTime(now);
      setNextUpdateTime(new Date(now.getTime() + 12 * 60 * 60 * 1000));
      setDataFreshness('fresh');
      
      if (forceRefresh) {
        toast({
          title: "Data refreshed",
          description: `Latest flood data with ${reservoirCount} reservoir conditions updated at ${now.toLocaleString()}`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Data Loaded",
          description: `Flood data with live reservoir conditions loaded at ${now.toLocaleString()}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: forceRefresh ? "Refresh Failed" : "Error Loading Data",
        description: "Could not fetch the latest flood and reservoir data",
        variant: "destructive",
        duration: 5000,
      });
      setDataFreshness('stale');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, dataFreshness, updateFloodDataWithReservoirs, reservoirCount]);
  
  // Initial data fetch
  useEffect(() => {
    loadFloodData(false);
  }, [loadFloodData]);

  // Update flood data when reservoir data changes
  useEffect(() => {
    if (!reservoirLoading) {
      const updatedFloodData = updateFloodDataWithReservoirs(floodData);
      setCurrentFloodData(updatedFloodData);
    }
  }, [reservoirLoading, updateFloodDataWithReservoirs]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };
  
  // Improved manual refresh handler
  const handleManualRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple concurrent refreshes
    
    console.log('Manual refresh triggered');
    await loadFloodData(true);
  };
  
  // Set up data refresh every 12 hours
  useEffect(() => {
    const updateInterval = setInterval(() => {
      loadFloodData(true);
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
    
    // For demo purposes, add a shorter interval to simulate updates
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: adding demo interval');
      const demoInterval = setTimeout(() => {
        loadFloodData(true);
      }, 60000); // 1 minute for demo
      
      return () => {
        clearInterval(updateInterval);
        clearTimeout(demoInterval);
      };
    }
    
    return () => clearInterval(updateInterval);
  }, [loadFloodData]);

  // Check if data is stale (over 12 hours old)
  useEffect(() => {
    const checkFreshness = () => {
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      
      if (lastUpdateTime < twelveHoursAgo) {
        setDataFreshness('stale');
      }
    };
    
    // Check freshness initially
    checkFreshness();
    
    // Set up interval to check freshness every minute
    const freshnessInterval = setInterval(checkFreshness, 60000); // 1 minute
    
    return () => clearInterval(freshnessInterval);
  }, [lastUpdateTime]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Header />
          <div className="flex items-center gap-2">
            <CursorAiIndicator />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.username}
                  {user?.userType === 'admin' && (
                    <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">Admin</span>
                  )}
                </span>
                {user?.userType === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/admin')}
                    className="text-xs h-7"
                  >
                    Admin Panel
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-xs h-7"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="text-xs h-7"
              >
                <LogIn className="h-3 w-3 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
        
        {/* Region Selector first */}
        <RegionSelector 
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
        />
        
        {/* Map now placed between region selector and timestamps/refresh controls */}
        <div className="mb-6">
          <Map 
            selectedRegion={selectedRegion} 
            className="w-full"
            aspectRatio={16/9}
          />
        </div>
        
        <div className="mb-6 flex items-center justify-between flex-wrap">
          <div className="flex items-center mt-3 sm:mt-0 space-x-2">
            <div className={`timestamp-badge ${dataFreshness === 'stale' ? 'bg-yellow-50 text-yellow-700' : ''}`}>
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastUpdateTime.toLocaleString()}
            </div>
            {reservoirCount > 0 && (
              <div className="timestamp-badge bg-blue-50 text-blue-700">
                <Database className="h-3 w-3 mr-1" />
                Live: {reservoirCount} reservoirs
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={dataFreshness === 'updating' || isRefreshing}
              className="text-xs h-7"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${(dataFreshness === 'updating' || isRefreshing) ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
        
        {dataFreshness === 'stale' && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-yellow-800">Data may not be current</h3>
                <p className="text-sm text-yellow-700">
                  The flood data has not been updated in over 12 hours. The information displayed may not reflect the current situation.
                </p>
              </div>
            </div>
          </div>
        )}

        {reservoirError && (
          <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-orange-800">Live reservoir data unavailable</h3>
                <p className="text-sm text-orange-700">
                  Using historical flood data. Live reservoir conditions could not be loaded.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading flood data...</p>
            <p className="text-sm text-muted-foreground mt-2">Analyzing live reservoir conditions and weather data</p>
          </div>
        ) : (
          <>
            {/* Updated layout: content sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Left side content */}
                <FloodStats floodData={enhancedFloodData} />
                <ChartSection selectedRegion={selectedRegion} />
                <PredictionCard floodData={enhancedFloodData} />
              </div>
              
              {/* Right side content - additional info, no map here anymore */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-2">Flood Risk Information</h2>
                  
                  {reservoirCount > 0 && (
                    <div className="mb-4 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700 font-medium">
                        ✓ Live Data Active
                      </p>
                      <p className="text-xs text-blue-600">
                        Analyzing {reservoirCount} reservoir conditions in real-time
                      </p>
                      {reservoirLastUpdated && (
                        <p className="text-xs text-blue-500 mt-1">
                          Last sync: {reservoirLastUpdated.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Risk Levels</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                        <span>Low Risk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                        <span>Medium Risk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
                        <span>High Risk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                        <span>Severe Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Toggle button for historical flood data section */}
            <div className="mb-4">
              <Button 
                variant="outline"
                onClick={() => setShowHistoricalData(!showHistoricalData)}
                className="w-full"
              >
                {showHistoricalData ? "Hide Historical Data" : "Show Historical Flood Data (2015-2025)"}
              </Button>
            </div>
            
            {/* Historical Flood Data Section */}
            {showHistoricalData && <HistoricalFloodData />}
          </>
        )}
        
        <div className="text-center text-sm rounded-lg bg-white p-4 shadow-sm mb-6">
          <h3 className="font-medium mb-2">Official Data Sources</h3>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            <a href="https://mausam.imd.gov.in/" target="_blank" rel="noopener noreferrer" className="data-source-badge bg-blue-100">
              Weather Services
            </a>
            <a href="https://cwc.gov.in/" target="_blank" rel="noopener noreferrer" className="data-source-badge">
              Water Resources
            </a>
            <a href="https://ndma.gov.in/" target="_blank" rel="noopener noreferrer" className="data-source-badge">
              Disaster Management
            </a>
            <a href="https://chennaimetrowater.tn.gov.in/" target="_blank" rel="noopener noreferrer" className="data-source-badge">
              Chennai Water Supply
            </a>
            <a href="https://cursor.ai/" target="_blank" rel="noopener noreferrer" className="data-source-badge bg-indigo-100">
              Cursor AI
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            All flood predictions and warnings are based on official meteorological and hydrological data, enhanced with Cursor AI technology. Updates occur every 12 hours.
          </p>
        </div>
        
        <footer className="text-center text-sm text-muted-foreground py-4 border-t mt-6">
          <p>India Flood Vision Dashboard - Data last updated: {lastUpdateTime.toLocaleString()}</p>
          <p className="text-xs mt-1">Next scheduled update: {nextUpdateTime.toLocaleString()}</p>
          <p className="text-xs mt-1">Powered by Cursor AI technology</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
