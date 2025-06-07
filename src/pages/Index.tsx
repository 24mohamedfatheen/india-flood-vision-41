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
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
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

  const handleStateDistrictChange = (state: string, district: string) => {
    setSelectedState(state);
    setSelectedDistrict(district);
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
      <div className="container mx-auto px-4 py-4">
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
        
        {/* Compact Region Selector */}
        <div className="mb-4">
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            onStateDistrictChange={handleStateDistrictChange}
          />
        </div>
        
        {/* Improved Layout - Map and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Map takes main space */}
          <div className="lg:col-span-3">
            <Map 
              selectedRegion={selectedRegion} 
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              className="w-full"
              aspectRatio={21/9}
            />
          </div>
          
          {/* Status Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 h-full">
              <h3 className="font-semibold mb-3">Data Status</h3>
              
              <div className="space-y-2 mb-4">
                <div className={`text-xs p-2 rounded ${dataFreshness === 'stale' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                  <Clock className="h-3 w-3 inline mr-1" />
                  Updated: {lastUpdateTime.toLocaleTimeString()}
                </div>
                
                {reservoirCount > 0 && (
                  <div className="text-xs p-2 rounded bg-blue-50 text-blue-700">
                    <Database className="h-3 w-3 inline mr-1" />
                    {reservoirCount} Reservoirs
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={dataFreshness === 'updating' || isRefreshing}
                className="w-full text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${(dataFreshness === 'updating' || isRefreshing) ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Alert Messages */}
        {dataFreshness === 'stale' && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800 text-sm">Data may not be current</h4>
                <p className="text-xs text-yellow-700">The flood data has not been updated recently.</p>
              </div>
            </div>
          </div>
        )}

        {reservoirError && (
          <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-orange-800 text-sm">Live reservoir data unavailable</h4>
                <p className="text-xs text-orange-700">Using historical flood data.</p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-medium">Loading flood data...</p>
            <p className="text-sm text-muted-foreground mt-1">Analyzing reservoir conditions</p>
          </div>
        ) : (
          <>
            {/* Compact Information Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-2">Location Information</h3>
                <FloodStats floodData={enhancedFloodData} compact={true} />
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-2">Current Conditions</h3>
                {enhancedFloodData ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className={`font-semibold ${
                        enhancedFloodData.riskLevel === 'severe' ? 'text-red-600' :
                        enhancedFloodData.riskLevel === 'high' ? 'text-orange-500' :
                        enhancedFloodData.riskLevel === 'medium' ? 'text-amber-500' :
                        'text-green-600'
                      }`}>
                        {enhancedFloodData.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Affected Area:</span>
                      <span>{enhancedFloodData.affectedArea} km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Population:</span>
                      <span>{enhancedFloodData.populationAffected.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No data available</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-2">Historical Rainfall</h3>
                <ChartSection selectedRegion={selectedRegion} compact={true} />
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-2">10-Day Forecast</h3>
                <PredictionCard floodData={enhancedFloodData} compact={true} />
              </div>
            </div>
            
            {/* Toggle Historical Data */}
            <div className="mb-4">
              <Button 
                variant="outline"
                onClick={() => setShowHistoricalData(!showHistoricalData)}
                className="w-full"
              >
                {showHistoricalData ? "Hide Historical Data" : "Show Historical Flood Data (2015-2025)"}
              </Button>
            </div>
            
            {showHistoricalData && <HistoricalFloodData />}
          </>
        )}
        
        {/* Compact Footer */}
        <div className="text-center text-xs bg-white p-3 rounded-lg shadow-sm mb-4">
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <a href="https://mausam.imd.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Weather Services
            </a>
            <span>•</span>
            <a href="https://cwc.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Water Resources
            </a>
            <span>•</span>
            <a href="https://cursor.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Cursor AI
            </a>
          </div>
          <p className="text-muted-foreground">
            Last updated: {lastUpdateTime.toLocaleString()} • Next update: {nextUpdateTime.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
