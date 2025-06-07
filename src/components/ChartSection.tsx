
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartSectionProps {
  selectedRegion: string;
  compact?: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({ selectedRegion, compact = false }) => {
  // Sample rainfall data - in a real app, this would come from your API
  const rainfallData = [
    { month: 'Jan', rainfall: 15 },
    { month: 'Feb', rainfall: 25 },
    { month: 'Mar', rainfall: 40 },
    { month: 'Apr', rainfall: 55 },
    { month: 'May', rainfall: 120 },
    { month: 'Jun', rainfall: 250 },
    { month: 'Jul', rainfall: 180 },
    { month: 'Aug', rainfall: 160 },
    { month: 'Sep', rainfall: 140 },
    { month: 'Oct', rainfall: 80 },
    { month: 'Nov', rainfall: 30 },
    { month: 'Dec', rainfall: 20 }
  ];

  if (compact) {
    return (
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rainfallData.slice(-6)}>
            <Bar dataKey="rainfall" fill="#3B82F6" />
            <Tooltip 
              labelStyle={{ fontSize: '12px' }}
              contentStyle={{ fontSize: '12px' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Historical Rainfall Data</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rainfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rainfall" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Average monthly rainfall (mm) for {selectedRegion}
      </p>
    </div>
  );
};

export default ChartSection;
