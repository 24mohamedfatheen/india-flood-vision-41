
import React from 'react';
import { CloudRain, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface FloodData {
  region: string;
  state: string;
  coordinates: [number, number];
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  affectedArea: number;
  populationAffected: number;
  lastUpdated: string;
  predictedFlood?: {
    date: string;
    probabilityPercentage: number;
    expectedRainfall: number;
    timeframe: string;
  };
}

interface PredictionCardProps {
  floodData: FloodData | null;
  compact?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ floodData, compact = false }) => {
  if (!floodData?.predictedFlood) {
    return (
      <div className={`bg-white rounded-lg border p-${compact ? '3' : '6'} shadow-sm`}>
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {compact ? 'No forecast data' : 'No forecast data available for this region'}
          </p>
        </div>
      </div>
    );
  }

  const prediction = floodData.predictedFlood;
  
  const getProbabilityColor = (percentage: number) => {
    if (percentage >= 75) return 'text-red-600 bg-red-50';
    if (percentage >= 50) return 'text-orange-500 bg-orange-50';
    if (percentage >= 25) return 'text-amber-500 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className={`p-2 rounded-lg ${getProbabilityColor(prediction.probabilityPercentage)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Flood Risk</span>
            <span className="text-xs font-bold">{prediction.probabilityPercentage}%</span>
          </div>
        </div>
        
        <div className="text-xs space-y-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
            <span>{new Date(prediction.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <CloudRain className="h-3 w-3 mr-1 text-gray-400" />
            <span>{prediction.expectedRainfall}mm</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">10-Day Flood Forecast</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(prediction.probabilityPercentage)}`}>
          {prediction.probabilityPercentage}% Risk
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
          <Calendar className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Expected Date</p>
            <p className="text-lg font-semibold text-blue-900">
              {new Date(prediction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
          <CloudRain className="h-6 w-6 text-indigo-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Expected Rainfall</p>
            <p className="text-lg font-semibold text-indigo-900">{prediction.expectedRainfall} mm</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Timeframe</p>
            <p className="text-lg font-semibold text-purple-900">{prediction.timeframe}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Forecast Summary:</strong> Based on current weather patterns and reservoir levels, 
          there is a {prediction.probabilityPercentage}% probability of flooding in {floodData.region} 
          around {new Date(prediction.date).toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
