
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForecastDay } from '@/services/floodForecastService';
import { Calendar, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';

interface FloodForecastCardProps {
  forecast: ForecastDay;
  isToday?: boolean;
}

const FloodForecastCard: React.FC<FloodForecastCardProps> = ({ forecast, isToday = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Droplets className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {formatDate(forecast.date)}
            {isToday && <Badge variant="outline" className="ml-2 text-xs">Today</Badge>}
          </CardTitle>
          {getRiskIcon(forecast.riskLevel)}
        </div>
        <CardDescription className="text-xs">
          Confidence: {forecast.confidence}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: forecast.riskColor }}>
            {forecast.probability}%
          </span>
          <Badge 
            variant="outline" 
            style={{ 
              backgroundColor: `${forecast.riskColor}20`,
              borderColor: forecast.riskColor,
              color: forecast.riskColor
            }}
          >
            {forecast.riskLevel.toUpperCase()}
          </Badge>
        </div>
        
        {forecast.expectedRainfall && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expected rainfall:</span>
            <span className="font-medium">{forecast.expectedRainfall}mm</span>
          </div>
        )}
        
        {forecast.riverLevelChange && forecast.riverLevelChange > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">River level change:</span>
            <span className="font-medium">+{forecast.riverLevelChange}m</span>
          </div>
        )}
        
        {forecast.factors && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Rainfall factor:</span>
                <span>{forecast.factors.rainfall}%</span>
              </div>
              {forecast.factors.riverLevel && (
                <div className="flex justify-between">
                  <span>River factor:</span>
                  <span>{forecast.factors.riverLevel}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ground saturation:</span>
                <span>{forecast.factors.groundSaturation}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloodForecastCard;
