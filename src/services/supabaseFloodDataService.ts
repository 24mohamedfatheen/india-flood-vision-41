import { supabase } from '@/integrations/supabase/client';

export interface HistoricalRainfallData {
  year: number;
  month: number;
  location: string;
  state: string;
  total_rainfall_mm: number;
  avg_daily_rainfall_mm: number;
  max_daily_rainfall_mm: number;
  rainy_days_count: number;
}

export interface ReservoirData {
  reservoir_name: string;
  state: string;
  district: string;
  current_level_mcm: number;
  capacity_mcm: number;
  percentage_full: number;
  inflow_cusecs: number;
  outflow_cusecs: number;
  last_updated: string;
  lat: number;
  long: number;
}

export interface FloodRiskFactors {
  historicalRisk: number;
  reservoirRisk: number;
  seasonalRisk: number;
  averageRainfall: number;
  recentRainfall: number;
}

/**
 * Fetch historical rainfall data for a specific region from Supabase
 */
export async function fetchHistoricalRainfallFromSupabase(
  region: string, 
  years: number = 5
): Promise<HistoricalRainfallData[]> {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;
    
    console.log(`Fetching rainfall data for region: ${region} since ${startYear}`);
    
    // Use type assertion to bypass the strict typing issue
    const supabaseAny = supabase as any;
    
    // First try to get region-specific data
    let { data, error } = await supabaseAny
      .from('monthly_rainfall_data')
      .select('*')
      .ilike('location', `%${region}%`)
      .gte('year', startYear)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(40);

    // If no error but no data, try broader search
    if (!error && (!data || data.length === 0)) {
      console.log('No region-specific data found, trying broader search...');
      
      const { data: broadData, error: broadError } = await supabaseAny
        .from('monthly_rainfall_data')
        .select('*')
        .gte('year', startYear)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(30);
        
      if (broadError) {
        console.error('Error in broad search:', broadError);
        return [];
      }
      
      data = broadData;
      error = null;
    }

    if (error) {
      console.error('Error fetching rainfall data:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No rainfall data found in database');
      return [];
    }

    console.log(`Fetched ${data.length} historical rainfall records`);
    return mapRainfallData(data);
  } catch (error) {
    console.error('Error in fetchHistoricalRainfallFromSupabase:', error);
    return [];
  }
}

/**
 * Map raw data to our interface
 */
function mapRainfallData(data: any[]): HistoricalRainfallData[] {
  return data.map(record => ({
    year: record.year || new Date().getFullYear(),
    month: record.month || 1,
    location: record.location || 'Unknown',
    state: record.state || 'Unknown',
    total_rainfall_mm: Number(record.total_rainfall_mm) || 0,
    avg_daily_rainfall_mm: Number(record.avg_daily_rainfall_mm) || 0,
    max_daily_rainfall_mm: Number(record.max_daily_rainfall_mm) || 0,
    rainy_days_count: record.rainy_days_count || 0
  }));
}

/**
 * Fetch current reservoir levels for regions within proximity of the selected area
 */
export async function fetchNearbyReservoirsFromSupabase(
  region: string,
  coordinates?: [number, number]
): Promise<ReservoirData[]> {
  try {
    console.log(`Fetching reservoir data for region: ${region}`);
    
    let query = supabase
      .from('indian_reservoir_levels')
      .select('*')
      .not('percentage_full', 'is', null)
      .not('current_level_mcm', 'is', null)
      .order('last_updated', { ascending: false });

    // If coordinates are provided, try to find nearby reservoirs
    if (coordinates) {
      const [lat, lon] = coordinates;
      console.log(`Using coordinates: ${lat}, ${lon}`);
      // Use a bounding box approach for nearby reservoirs (within ~2 degrees)
      query = query
        .gte('lat', lat - 2)
        .lte('lat', lat + 2)
        .gte('long', lon - 2)
        .lte('long', lon + 2)
        .limit(15);
    } else {
      // Try to match by region name in reservoir name or get top reservoirs by capacity
      query = query
        .or(`reservoir_name.ilike.%${region}%,district.ilike.%${region}%,state.ilike.%${region}%`)
        .limit(20);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reservoir data:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No specific reservoirs found, fetching fallback data...');
      // Fallback: get some recent reservoir data
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('indian_reservoir_levels')
        .select('*')
        .not('percentage_full', 'is', null)
        .gte('percentage_full', 50) // Focus on reservoirs that are significantly full
        .order('percentage_full', { ascending: false })
        .limit(10);
        
      if (fallbackError || !fallbackData) {
        console.error('Error fetching fallback reservoir data:', fallbackError);
        return [];
      }
      
      console.log(`Using fallback reservoir data: ${fallbackData.length} records`);
      return mapReservoirData(fallbackData);
    }

    console.log(`Fetched ${data.length} reservoir records near ${region}`);
    return mapReservoirData(data);
  } catch (error) {
    console.error('Error in fetchNearbyReservoirsFromSupabase:', error);
    return [];
  }
}

/**
 * Map raw Supabase reservoir data to our interface
 */
function mapReservoirData(data: any[]): ReservoirData[] {
  return data.map(record => ({
    reservoir_name: record.reservoir_name || 'Unknown Reservoir',
    state: record.state || 'Unknown State',
    district: record.district || 'Unknown District', 
    current_level_mcm: Number(record.current_level_mcm) || 0,
    capacity_mcm: Number(record.capacity_mcm) || 0,
    percentage_full: Number(record.percentage_full) || 0,
    inflow_cusecs: record.inflow_cusecs || 0,
    outflow_cusecs: record.outflow_cusecs || 0,
    last_updated: record.last_updated || new Date().toISOString(),
    lat: record.lat || 0,
    long: record.long || 0
  }));
}

/**
 * Calculate flood risk factors based on real Supabase data
 */
export async function calculateFloodRiskFactors(
  region: string,
  coordinates?: [number, number]
): Promise<FloodRiskFactors> {
  try {
    // Fetch historical rainfall and current reservoir data in parallel
    const [rainfallData, reservoirData] = await Promise.all([
      fetchHistoricalRainfallFromSupabase(region, 5),
      fetchNearbyReservoirsFromSupabase(region, coordinates)
    ]);

    console.log(`Analysis data: ${rainfallData.length} rainfall records, ${reservoirData.length} reservoirs`);

    // Calculate historical risk based on rainfall patterns
    let historicalRisk = 0;
    let averageRainfall = 0;
    let recentRainfall = 0;

    if (rainfallData.length > 0) {
      // Calculate average monthly rainfall
      const totalRainfall = rainfallData.reduce((sum, record) => sum + record.total_rainfall_mm, 0);
      averageRainfall = totalRainfall / rainfallData.length;

      // Calculate risk based on high rainfall periods
      const highRainfallMonths = rainfallData.filter(record => record.total_rainfall_mm > averageRainfall * 1.5);
      historicalRisk = (highRainfallMonths.length / rainfallData.length) * 100;

      // Get recent rainfall (last 6 months of data)
      const recentData = rainfallData.slice(0, 6);
      if (recentData.length > 0) {
        recentRainfall = recentData.reduce((sum, record) => sum + record.total_rainfall_mm, 0) / recentData.length;
      }
    } else {
      // Fallback values if no data available
      averageRainfall = 100;
      historicalRisk = 25;
      recentRainfall = 80;
    }

    // Calculate reservoir risk based on current levels
    let reservoirRisk = 0;
    if (reservoirData.length > 0) {
      // Calculate average fullness and identify high-risk reservoirs
      const averageFullness = reservoirData.reduce((sum, reservoir) => sum + reservoir.percentage_full, 0) / reservoirData.length;
      
      // Higher risk if reservoirs are very full (>80%) or if there are many full reservoirs
      const highRiskReservoirs = reservoirData.filter(reservoir => reservoir.percentage_full > 80);
      reservoirRisk = Math.min(100, (averageFullness * 0.8) + (highRiskReservoirs.length * 10));
    } else {
      // Default reservoir risk if no data
      reservoirRisk = 20;
    }

    // Calculate seasonal risk based on current month
    const currentMonth = new Date().getMonth();
    // Monsoon months (June-September) have higher base risk
    const monsoonMonths = [5, 6, 7, 8]; // June, July, August, September
    const seasonalRisk = monsoonMonths.includes(currentMonth) ? 30 : 10;

    const result = {
      historicalRisk: Number(historicalRisk.toFixed(1)),
      reservoirRisk: Number(reservoirRisk.toFixed(1)),
      seasonalRisk,
      averageRainfall: Number(averageRainfall.toFixed(1)),
      recentRainfall: Number(recentRainfall.toFixed(1))
    };

    console.log(`Calculated flood risk factors for ${region}:`, result);

    return result;
  } catch (error) {
    console.error('Error calculating flood risk factors:', error);
    
    // Return default values on error
    return {
      historicalRisk: 25,
      reservoirRisk: 20,
      seasonalRisk: 15,
      averageRainfall: 100,
      recentRainfall: 80
    };
  }
}