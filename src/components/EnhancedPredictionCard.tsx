
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCursorAiForecast } from '@/hooks/useCursorAiForecast';
import { regions } from '@/data/floodData';
import FloodForecastCard from './FloodForecastCard';
import FloodForecastChart from './FloodForecastChart';
import { Loader, TrendingUp, Calendar, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';

interface EnhancedPredictionCardProps {
  floodData?: any;
}

const EnhancedPredictionCard: React.FC<EnhancedPredictionCardProps> = ({ floodData }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const region = floodData?.region || 'mumbai';
  const regionInfo = regions.find(r => r.label.toLowerCase() === region.toLowerCase());
  
  const { data, analysis, isLoading, error, refetch } = useCursorAiForecast({
    region,
    state: regionInfo?.state,
    days: 10,
    coordinates: regionInfo?.coordinates as [number, number],
    enabled: true,
    useHistoricalData: true
  });

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    await refetch();
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Forecast Error
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load flood forecast. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              10-Day Flood Probability Forecast
            </CardTitle>
            <CardDescription>
              AI-powered flood risk prediction for {regionInfo?.label || region}
              {regionInfo?.state && `, ${regionInfo.state}`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Generating AI flood forecast...
              </p>
              <p className="text-xs text-muted-foreground">
                Analyzing weather patterns, river levels, and historical data
              </p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Summary Section */}
            {data.summary && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-sm mb-3 text-gray-800">Forecast Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Average Risk:</span>
                    <p className="font-medium">{data.summary.averageRisk}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Risk Day:</span>
                    <p className="font-medium">{data.summary.peakRiskDay}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend:</span>
                    <p className="font-medium">{data.summary.trend}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sustained Risk:</span>
                    <p className="font-medium">{data.summary.sustainedHighRisk}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for different views */}
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Chart View
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Daily Cards
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                <div className="space-y-4">
                  <FloodForecastChart 
                    forecasts={data.forecasts} 
                    showRainfall={true}
                  />
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 justify-center text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-red-500"></div>
                      <span>Flood Probability</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-blue-500 border-dashed border-t"></div>
                      <span>Expected Rainfall</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cards" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.forecasts.map((forecast, index) => (
                    <FloodForecastCard 
                      key={`${forecast.date}-${refreshKey}`}
                      forecast={forecast} 
                      isToday={index === 0}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="data" className="mt-4">
                <div className="space-y-4">
                  {/* Model Information */}
                  {data.modelInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Model Information</h4>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span>{data.modelInfo.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span>{data.modelInfo.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span>{data.modelInfo.source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>{new Date(data.modelInfo.lastUpdated || '').toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Sources */}
                  {data.dataSourceInfo && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Data Sources</h4>
                      <div className="text-xs space-y-2">
                        {data.dataSourceInfo.weather && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={data.dataSourceInfo.weather.dataFetched ? 'bg-green-100' : 'bg-yellow-100'}
                              >
                                {data.dataSourceInfo.weather.dataFetched ? 'Live' : 'Simulated'}
                              </Badge>
                              <span className="font-medium">Weather Data</span>
                            </div>
                            <p className="text-muted-foreground">{data.dataSourceInfo.weather.source}</p>
                          </div>
                        )}
                        {data.dataSourceInfo.rivers && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={data.dataSourceInfo.rivers.dataFetched ? 'bg-green-100' : 'bg-yellow-100'}
                              >
                                {data.dataSourceInfo.rivers.dataFetched ? 'Live' : 'Simulated'}
                              </Badge>
                              <span className="font-medium">River Data</span>
                            </div>
                            <p className="text-muted-foreground">{data.dataSourceInfo.rivers.source}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No forecast data available for this region.
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Generate Forecast
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPredictionCard;
