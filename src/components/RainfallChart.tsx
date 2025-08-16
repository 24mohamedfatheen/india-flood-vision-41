import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CloudRain, Calendar } from 'lucide-react';

interface RainfallData {
  id: string;
  location: string;
  state: string;
  district: string;
  year: number;
  month: number;
  total_rainfall_mm: number;
  avg_daily_rainfall_mm: number;
  max_daily_rainfall_mm: number;
  rainy_days_count: number;
}

interface ChartData {
  month: string;
  rainfall: number;
  avgDaily: number;
  maxDaily: number;
}

interface RainfallChartProps {
  selectedRegion: string;
}

const RainfallChart: React.FC<RainfallChartProps> = ({ selectedRegion }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [rainfallData, setRainfallData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = ['2020', '2021', '2022', '2023', '2024', '2025'];

  useEffect(() => {
    fetchRainfallData();
  }, [selectedRegion, selectedYear]);

  const fetchRainfallData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_rainfall_data')
        .select('*')
        .eq('location', selectedRegion)
        .eq('year', parseInt(selectedYear))
        .order('month', { ascending: true });

      if (error) {
        console.error('Error fetching rainfall data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch rainfall data.",
          variant: "destructive",
        });
        return;
      }

      // Transform data for chart
      const chartData: ChartData[] = monthNames.map((monthName, index) => {
        const monthNum = index + 1;
        const monthData = data?.find((item: RainfallData) => item.month === monthNum);
        
        return {
          month: monthName,
          rainfall: monthData?.total_rainfall_mm || 0,
          avgDaily: monthData?.avg_daily_rainfall_mm || 0,
          maxDaily: monthData?.max_daily_rainfall_mm || 0,
        };
      });

      setRainfallData(chartData);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching rainfall data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label} ${selectedYear}`}</p>
          <p className="text-blue-600">
            {`Total Rainfall: ${payload[0]?.value?.toFixed(1)} mm`}
          </p>
          <p className="text-green-600">
            {`Avg Daily: ${payload[1]?.value?.toFixed(1)} mm`}
          </p>
          <p className="text-orange-600">
            {`Max Daily: ${payload[2]?.value?.toFixed(1)} mm`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CloudRain className="h-5 w-5 text-blue-600" />
            <CardTitle>Monthly Rainfall Patterns</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Rainfall data for {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} in {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={rainfallData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rainfall" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                name="Total Monthly Rainfall"
              />
              <Line 
                type="monotone" 
                dataKey="avgDaily" 
                stroke="#16a34a" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                name="Average Daily Rainfall"
              />
              <Line 
                type="monotone" 
                dataKey="maxDaily" 
                stroke="#ea580c" 
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                name="Maximum Daily Rainfall"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {!isLoading && rainfallData.every(item => item.rainfall === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No rainfall data available for {selectedRegion} in {selectedYear}</p>
            <p className="text-sm mt-2">Try selecting a different year or region</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RainfallChart;