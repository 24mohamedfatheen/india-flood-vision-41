import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CloudRain, Calendar } from 'lucide-react';

interface ReservoirData {
  id: number;
  reservoir_name: string;
  state: string;
  district: string;
  year: number;
  month: string;
  current_level_mcm: number;
  capacity_mcm: number;
  percentage_full: number;
  inflow_cusecs: number;
  outflow_cusecs: number;
}

interface ChartData {
  month: string;
  reservoirLevel: number;
  inflow: number;
  outflow: number;
}

interface ReservoirChartProps {
  selectedRegion: string;
}

const RainfallChart: React.FC<ReservoirChartProps> = ({ selectedRegion }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [reservoirData, setReservoirData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = ['2020', '2021', '2022', '2023', '2024', '2025'];

  // Map regions to their states for filtering reservoir data
  const getStateForRegion = (region: string): string => {
    const regionStateMap: Record<string, string> = {
      'mumbai': 'Maharashtra',
      'delhi': 'Delhi',
      'kolkata': 'West Bengal',
      'chennai': 'Tamil Nadu',
      'bangalore': 'Karnataka',
      'hyderabad': 'Telangana',
      'ahmedabad': 'Gujarat',
      'pune': 'Maharashtra',
      'surat': 'Gujarat',
      'jaipur': 'Rajasthan',
      'lucknow': 'Uttar Pradesh',
      'kanpur': 'Uttar Pradesh',
      'nagpur': 'Maharashtra',
      'patna': 'Bihar',
      'indore': 'Madhya Pradesh',
      'kochi': 'Kerala',
      'guwahati': 'Assam'
    };
    return regionStateMap[region.toLowerCase()] || '';
  };

  useEffect(() => {
    fetchReservoirData();
  }, [selectedRegion, selectedYear]);

  const fetchReservoirData = async () => {
    setIsLoading(true);
    try {
      // Get reservoir names relevant to the region
      const getReservoirNamesForRegion = (region: string): string[] => {
        const regionReservoirMap: Record<string, string[]> = {
          'mumbai': ['Tansa', 'Vihar', 'Tulsi', 'Vaitarna', 'Bhatsa'],
          'delhi': ['Yamuna', 'Bhakra'],
          'kolkata': ['Damodar', 'Farakka'],
          'chennai': ['Poondi', 'Cholavaram', 'Redhills', 'Chembarambakkam'],
          'bangalore': ['Cauvery', 'Kabini', 'Krishna Raja'],
          'hyderabad': ['Nagarjuna', 'Srisailam'],
          'ahmedabad': ['Sardar Sarovar', 'Ukai'],
          'pune': ['Khadakwasla', 'Panshet', 'Warasgaon'],
          'surat': ['Ukai', 'Kadana'],
          'jaipur': ['Bisalpur', 'Mahi Bajaj'],
          'lucknow': ['Rihand', 'Obra'],
          'kanpur': ['Rihand', 'Mata Tila'],
          'nagpur': ['Gosikhurd', 'Totladoh'],
          'patna': ['Sone', 'Kosi'],
          'indore': ['Omkareshwar', 'Bargi'],
          'kochi': ['Idukki', 'Mullaperiyar'],
          'guwahati': ['Kopili', 'Umiam']
        };
        return regionReservoirMap[region.toLowerCase()] || [];
      };

      const relevantReservoirNames = getReservoirNamesForRegion(selectedRegion);
      
      // Fetch data and filter by reservoir names and year
      const { data, error } = await supabase
        .from('indian_reservoir_levels')
        .select('*')
        .eq('year', parseInt(selectedYear))
        .order('month', { ascending: true });

      if (error) {
        console.error('Error fetching reservoir data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reservoir data.",
          variant: "destructive",
        });
        return;
      }

      // Filter data by reservoir names relevant to the region
      const filteredData = data?.filter((item: any) => 
        relevantReservoirNames.some(name => 
          item.reservoir_name?.toLowerCase().includes(name.toLowerCase())
        )
      ) || [];

      // Transform data for chart - aggregate by month
      const chartData: ChartData[] = monthNames.map((monthName, index) => {
        const monthNum = (index + 1).toString();
        const monthData = filteredData.filter((item: any) => {
          return item.month === monthNum || item.month === monthName.toLowerCase();
        });
        
        // Calculate averages for the month with actual data
        const validLevelData = monthData.filter(item => item.level != null && item.full_reservoir_level != null);
        const validInflowData = monthData.filter(item => item.inflow_cusecs != null);
        const validOutflowData = monthData.filter(item => item.outflow_cusecs != null);
        
        const avgLevel = validLevelData.length > 0 ? 
          validLevelData.reduce((sum, item) => {
            const percentage = (item.level / item.full_reservoir_level) * 100;
            return sum + (percentage || 0);
          }, 0) / validLevelData.length : 0;
          
        const avgInflow = validInflowData.length > 0 ? 
          validInflowData.reduce((sum, item) => sum + (item.inflow_cusecs || 0), 0) / validInflowData.length : 0;
          
        const avgOutflow = validOutflowData.length > 0 ? 
          validOutflowData.reduce((sum, item) => sum + (item.outflow_cusecs || 0), 0) / validOutflowData.length : 0;
        
        return {
          month: monthName,
          reservoirLevel: avgLevel,
          inflow: avgInflow,
          outflow: avgOutflow,
        };
      });

      setReservoirData(chartData);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching reservoir data.",
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
            {`Reservoir Level: ${payload[0]?.value?.toFixed(1)}%`}
          </p>
          <p className="text-green-600">
            {`Inflow: ${payload[1]?.value?.toFixed(0)} cusecs`}
          </p>
          <p className="text-orange-600">
            {`Outflow: ${payload[2]?.value?.toFixed(0)} cusecs`}
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
            <CardTitle>Monthly Reservoir Patterns</CardTitle>
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
            <LineChart data={reservoirData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                label={{ value: 'Reservoir Level (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="reservoirLevel" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                name="Reservoir Level (%)"
              />
              <Line 
                type="monotone" 
                dataKey="inflow" 
                stroke="#16a34a" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                name="Inflow (cusecs)"
              />
              <Line 
                type="monotone" 
                dataKey="outflow" 
                stroke="#ea580c" 
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                name="Outflow (cusecs)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {!isLoading && reservoirData.every(item => item.reservoirLevel === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reservoir data available for {selectedRegion} in {selectedYear}</p>
            <p className="text-sm mt-2">Try selecting a different year or region</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RainfallChart;