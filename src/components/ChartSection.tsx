
// src/components/ChartSection.tsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getHistoricalRainfallData, fetchImdData, FloodData } from '../data/floodData'; // Import fetchImdData and FloodData
import { Button } from './ui/button'; // Assuming Button is used
import { format, isValid, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import AiFloodForecast from './AiFloodForecast';

interface ChartSectionProps {
  selectedRegion: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ selectedRegion }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [historicalData, setHistoricalData] = useState<any[]>([]); // State to hold processed historical data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch data when component mounts or selectedRegion changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // This will now attempt live fetch and fallback to static
        await fetchImdData(true); // Force refresh to ensure data is updated
        // getHistoricalRainfallData now directly retrieves from the global floodData
        const processedData = getHistoricalRainfallData(selectedRegion, selectedYear); // Pass selectedYear
        setHistoricalData(processedData);
      } catch (err) {
        console.error("Failed to load historical data:", err);
        setError("Failed to load historical data. Please try again later.");
        // If fetchImdData fails, it already handles fallback to static internally.
        // So, we can just call getHistoricalRainfallData again to get the fallback data.
        setHistoricalData(getHistoricalRainfallData(selectedRegion, selectedYear)); // Pass selectedYear
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedRegion, selectedYear]); // Re-run when selectedRegion or selectedYear changes

  // Re-process rainfall data when historicalData or selectedYear changes
  const processedRainfallData = React.useMemo(() => {
    // Ensure historicalData is available
    if (!historicalData || historicalData.length === 0) {
      return []; // Return empty array if no data
    }

    // The historicalData from getHistoricalRainfallData should already be in the correct format
    // { month: string, rainfall: number }[], so no further processing needed here for chart.
    return historicalData;
  }, [historicalData]); // Only depends on historicalData now

  // Generate available years for selection (going back 10 years)
  const availableYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    // Include 2020, 2021, 2022 from static data, and current year
    const years = new Set<number>();
    years.add(currentYear);
    years.add(2020);
    years.add(2021);
    years.add(2022);
    // Add a few years around current year for flexibility
    for (let i = 1; i <= 3; i++) {
      years.add(currentYear - i);
      years.add(currentYear + i); // For future predictions if any
    }
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, []);

  // Safe date formatter function to prevent errors
  const safeDateFormat = (dateValue: string | number | Date, formatStr: string) => {
    let date: Date;

    if (typeof dateValue === 'string') {
      try {
        date = parseISO(dateValue);
      } catch (e) {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return 'Invalid date';
    }

    if (!isValid(date)) {
      return 'Invalid date';
    }

    try {
      return format(date, formatStr);
    } catch (e) {
      return 'Format error';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="flood-card">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div>
            <h2 className="section-title">Historical Rainfall Data</h2>
            <p className="text-sm text-muted-foreground">
              {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} rainfall data for {selectedYear}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value: string) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading historical data...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">{error}</div>
          ) : processedRainfallData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">No historical rainfall data available for this region.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedRainfallData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(tick) => tick}
                />
                <YAxis domain={[0, 'dataMax + 50']} />
                <Tooltip
                  formatter={(value) => [`${value} mm`, 'Rainfall']}
                  labelFormatter={(label) => `${label}, ${selectedYear}`}
                />
                <Legend />
                <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI-powered forecast component */}
      <AiFloodForecast selectedRegion={selectedRegion} />
    </div>
  );
};

export default ChartSection;
