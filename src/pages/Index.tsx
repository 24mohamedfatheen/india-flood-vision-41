
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RegionSelector from '../components/RegionSelector';
import Map from '../components/Map';
import FloodStats from '../components/FloodStats';
import ChartSection from '../components/ChartSection';
import EnhancedPredictionCard from '../components/EnhancedPredictionCard';
import HistoricalFloodData from '../components/HistoricalFloodData';
import { getFloodDataForRegion, fetchImdData, floodData } from '../data/floodData';
import { useReservoirFloodData } from '../hooks/useReservoirFloodData';
import { useToast } from '../hooks/use-toast';
import { Clock, RefreshCw, AlertTriangle, LogIn, LogOut, Database, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  
  // Use the reservoir flood data hook
  const { 
    isLoading: reservoirLoading, 
    error: reservoirError, 
    updateFloodDataWithReservoirs,
    lastUpdated: reservoirLastUpdated,
    reservoirCount
  } = useReservoirFloodData();

  // Get current region's flood data
  const floodDataForRegion = getFloodDataForRegion(selectedRegion);
  const enhancedFloodData = floodDataForRegion ? 
    updateFloodDataWithReservoirs([floodDataForRegion])[0] : null;

  // Data fetching function
  const loadFloodData = useCallback(async (forceRefresh = false) => {
    const currentState = forceRefresh ? 'updating' : dataFreshness;
    setDataFreshness(currentState);
    
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      await fetchImdData(forceRefresh);
      
      const updatedFloodData = updateFloodDataWithReservoirs(floodData);
      setCurrentFloodData(updatedFloodData);
      
      const now = new Date();
      setLastUpdateTime(now);
      setNextUpdateTime(new Date(now.getTime() + 12 * 60 * 60 * 1000));
      setDataFreshness('fresh');
      
      if (forceRefresh) {
        toast({
          title: "🔄 Data Refreshed Successfully",
          description: `Enhanced flood analysis with ${reservoirCount} live reservoir conditions updated`,
          duration: 4000,
        });
      } else {
        toast({
          title: "📊 Data Loaded",
          description: `Comprehensive flood data with live reservoir monitoring active`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: forceRefresh ? "❌ Refresh Failed" : "⚠️ Loading Error",
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
  
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    console.log('🔄 Manual refresh initiated');
    await loadFloodData(true);
  };
  
  // Auto-refresh setup
  useEffect(() => {
    const updateInterval = setInterval(() => {
      loadFloodData(true);
    }, 12 * 60 * 60 * 1000);
    
    return () => clearInterval(updateInterval);
  }, [loadFloodData]);

  // Data freshness check
  useEffect(() => {
    const checkFreshness = () => {
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      
      if (lastUpdateTime < twelveHoursAgo) {
        setDataFreshness('stale');
      }
    };
    
    checkFreshness();
    const freshnessInterval = setInterval(checkFreshness, 60000);
    
    return () => clearInterval(freshnessInterval);
  }, [lastUpdateTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Header Section */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <Header />
          <div className="flex items-center gap-3">
            <CursorAiIndicator />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">Welcome, {user?.username}</p>
                  {user?.userType === 'admin' && (
                    <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                      Administrator
                    </Badge>
                  )}
                </div>
                {user?.userType === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/admin')}
                    className="bg-red-50 border-red-200 hover:bg-red-100"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Command Center
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-gray-600"
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
              >
                <LogIn className="h-3 w-3 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
        
        {/* Region Selector */}
        <div className="mb-6">
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
          />
        </div>
        
        {/* Status Bar */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              dataFreshness === 'stale' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                {dataFreshness === 'stale' ? 'Data Outdated' : 'Live Data'}: {lastUpdateTime.toLocaleString()}
              </span>
            </div>
            
            {reservoirCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Database className="h-3 w-3" />
                <span className="font-medium">{reservoirCount} Reservoirs Monitored</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={dataFreshness === 'updating' || isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${(dataFreshness === 'updating' || isRefreshing) ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {/* Alert Messages */}
        {dataFreshness === 'stale' && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Data Freshness Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Flood data hasn't been updated in over 12 hours. Information may not reflect current conditions.
                </p>
              </div>
            </div>
          </div>
        )}

        {reservoirError && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800">Live Data Limitation</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Live reservoir monitoring is temporarily unavailable. Using historical flood patterns.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Loading Comprehensive Flood Analysis</h3>
                <p className="text-sm text-gray-600">Analyzing weather patterns, river levels, and satellite data...</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    AI Forecasting
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Live Monitoring
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Risk Analysis
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Map 
                selectedRegion={selectedRegion} 
                className="w-full"
                aspectRatio={16/9}
              />
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <FloodStats floodData={enhancedFloodData} />
                <ChartSection selectedRegion={selectedRegion} />
                <EnhancedPredictionCard floodData={enhancedFloodData} />
              </div>
              
              {/* Right Column - Info Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  {/* Live Status Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      System Status
                    </h3>
                    
                    {reservoirCount > 0 && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-800">Live Monitoring Active</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Real-time analysis of {reservoirCount} reservoir systems
                        </p>
                        {reservoirLastUpdated && (
                          <p className="text-xs text-green-600 mt-1">
                            Last sync: {reservoirLastUpdated.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Risk Level Legend */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-gray-700">Risk Level Guide</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low Risk (0-30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium Risk (30-50%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>High Risk (50-70%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Severe Risk (70%+)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Historical Data Toggle */}
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => setShowHistoricalData(!showHistoricalData)}
                className="bg-white hover:bg-gray-50"
              >
                {showHistoricalData ? "Hide" : "Show"} Historical Flood Data (2015-2025)
              </Button>
            </div>
            
            {/* Historical Data Section */}
            {showHistoricalData && (
              <div className="bg-white rounded-lg shadow-sm">
                <HistoricalFloodData />
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-800">Official Data Sources</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'Weather Services', url: 'https://mausam.imd.gov.in/', color: 'bg-blue-100 text-blue-800' },
                { name: 'Water Resources', url: 'https://cwc.gov.in/', color: 'bg-cyan-100 text-cyan-800' },
                { name: 'Disaster Management', url: 'https://ndma.gov.in/', color: 'bg-red-100 text-red-800' },
                { name: 'Cursor AI Technology', url: 'https://cursor.ai/', color: 'bg-purple-100 text-purple-800' }
              ].map((source) => (
                <a 
                  key={source.name}
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`px-3 py-1 rounded-full text-xs font-medium hover:shadow-sm transition-shadow ${source.color}`}
                >
                  {source.name}
                </a>
              ))}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Advanced flood prediction powered by AI technology and real-time monitoring</p>
              <p>Last updated: {lastUpdateTime.toLocaleString()} • Next update: {nextUpdateTime.toLocaleString()}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
