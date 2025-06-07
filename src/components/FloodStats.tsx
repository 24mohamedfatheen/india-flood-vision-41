
import React from 'react';
import { AlertTriangle, Droplets, Users, MapPin } from 'lucide-react';

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

interface FloodStatsProps {
  floodData: FloodData | null;
  compact?: boolean;
}

const FloodStats: React.FC<FloodStatsProps> = ({ floodData, compact = false }) => {
  if (!floodData) {
    return (
      <div className={`bg-white rounded-lg border p-${compact ? '3' : '6'} shadow-sm`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No flood data available for this region</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'medium': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className={`p-2 rounded-lg ${getRiskColor(floodData.riskLevel)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Risk Level</span>
            <span className="text-xs font-bold uppercase">{floodData.riskLevel}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
            <span>{floodData.affectedArea} km²</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-gray-400" />
            <span>{(floodData.populationAffected / 1000).toFixed(0)}k</span>
          </div>
        </div>
        
        {floodData.predictedFlood && (
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Flood Risk:</span>
              <span className="font-medium">{floodData.predictedFlood.probabilityPercentage}%</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Current Flood Statistics</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(floodData.riskLevel)}`}>
          {floodData.riskLevel.toUpperCase()} RISK
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
          <Droplets className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Affected Area</p>
            <p className="text-lg font-semibold text-blue-900">{floodData.affectedArea} km²</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
          <Users className="h-6 w-6 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Population at Risk</p>
            <p className="text-lg font-semibold text-orange-900">{floodData.populationAffected.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-green-50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-semibold text-green-900">
              {new Date(floodData.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      {floodData.predictedFlood && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">Flood Prediction</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-yellow-700">Probability: </span>
              <span className="font-semibold">{floodData.predictedFlood.probabilityPercentage}%</span>
            </div>
            <div>
              <span className="text-yellow-700">Expected Date: </span>
              <span className="font-semibold">{new Date(floodData.predictedFlood.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodStats;
