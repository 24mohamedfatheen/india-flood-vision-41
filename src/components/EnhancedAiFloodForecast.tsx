
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useEnhancedFloodForecast } from '../hooks/useEnhancedFloodForecast';
import { Button } from './ui/button';
import { AlertCircle, AlertTriangle, CloudRain, RefreshCw, Droplet, Database } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface EnhancedAiFloodForecastProps {
  selectedRegion: string;
  selectedState?: string;
  selectedDistrict?: string;
}

const EnhancedAiFloodForecast: React.FC<EnhancedAiFloodForecastProps> = ({ 
  selectedRegion, 
  selectedState, 
  selectedDistrict 
}) => {
  const { data, isLoading, error, refetch } = useEnhancedFloodForecast({
    region: selectedRegion,
    state: selectedState,
    district: selectedDistrict
  });

  // Format chart data
  const chartData = React.useMemo(() => {
    if (!data?.forecasts) return [];
    
    return data.forecasts.map(item => ({
      ...item,
      formattedDate: format(parseISO(item.date), 'MMM dd')
    }));
  }, [data]);

  // Get risk color
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            10-Day Flood Probability Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium">Loading enhanced forecast...</p>
            <p className="text-xs text-muted-foreground mt-1">Analyzing reservoir data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              10-Day Flood Probability Forecast
            </CardTitle>
            <Button size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-medium text-red-800 mb-2">Forecast Unavailable</h3>
            <p className="text-sm text-red-600">
              Enhanced forecast data is currently unavailable for this region.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRisk = data.forecasts[0]?.riskLevel || 'low';
  const avgProbability = data.forecasts.reduce((sum, f) => sum + f.probability, 0) / data.forecasts.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-600" />
              10-Day Enhanced Flood Forecast
              <Badge className={`${getRiskColor(currentRisk)} text-white text-xs`}>
                {currentRisk.toUpperCase()}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedDistrict || selectedState || selectedRegion} • 
              Model: {data.modelInfo.version} • 
              Accuracy: {data.modelInfo.accuracy}%
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Reservoir Data Summary */}
        {data.reservoirData.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Live Reservoir Data ({data.reservoirData.length} reservoirs)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {data.reservoirData.slice(0, 4).map((reservoir, idx) => (
                <div key={idx} className="bg-white p-2 rounded">
                  <div className="font-medium truncate">{reservoir.reservoirName}</div>
                  <div className="text-blue-600">{reservoir.percentageFull.toFixed(1)}% full</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forecast Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <ReferenceLine y={75} stroke="red" strokeDasharray="3 3" label="Severe Risk" />
              <ReferenceLine y={50} stroke="orange" strokeDasharray="3 3" label="High Risk" />
              <ReferenceLine y={25} stroke="yellow" strokeDasharray="3 3" label="Medium Risk" />
              <Line
                type="monotone"
                dataKey="probability"
                name="Flood Probability"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                name="Confidence"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{avgProbability.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Avg Probability</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{data.forecasts[0]?.expectedRainfall.toFixed(0)}mm</div>
            <div className="text-xs text-gray-600">Expected Rainfall</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{data.forecasts[0]?.confidence}%</div>
            <div className="text-xs text-gray-600">Confidence</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{data.reservoirData.length}</div>
            <div className="text-xs text-gray-600">Reservoirs Monitored</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Enhanced forecast using real-time reservoir data from {data.reservoirData.length} monitoring stations.
          Last updated: {format(parseISO(data.timestamp), 'MMM dd, yyyy, h:mm a')}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAiFloodForecast;
