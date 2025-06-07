
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ForecastDay } from '@/services/floodForecastService';

interface FloodForecastChartProps {
  forecasts: ForecastDay[];
  showRainfall?: boolean;
}

const FloodForecastChart: React.FC<FloodForecastChartProps> = ({ 
  forecasts, 
  showRainfall = false 
}) => {
  const chartData = forecasts.map(forecast => ({
    date: new Date(forecast.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    probability: forecast.probability,
    rainfall: forecast.expectedRainfall || 0,
    riskColor: forecast.riskColor
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Flood Probability: {payload[0].value}%
          </p>
          {showRainfall && payload[1] && (
            <p className="text-sm" style={{ color: payload[1].color }}>
              Expected Rainfall: {payload[1].value}mm
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (showRainfall) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="probability"
            orientation="left"
            className="text-xs"
            tick={{ fontSize: 12 }}
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="rainfall"
            orientation="right"
            className="text-xs"
            tick={{ fontSize: 12 }}
            label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            yAxisId="probability"
            type="monotone" 
            dataKey="probability" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="rainfall"
            type="monotone" 
            dataKey="rainfall" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fontSize: 12 }}
          label={{ value: 'Flood Probability (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="probability" 
          stroke="#ef4444" 
          strokeWidth={2}
          fill="url(#probabilityGradient)"
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default FloodForecastChart;
