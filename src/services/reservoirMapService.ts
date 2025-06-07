
import { supabase } from '../integrations/supabase/client';

export interface ReservoirMapData {
  id: string;
  name: string;
  state: string;
  district: string;
  coordinates: [number, number];
  reservoirPercentage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  inflowCusecs: number;
  outflowCusecs: number;
  lastUpdated: string;
}

export interface DistrictReservoirSummary {
  district: string;
  state: string;
  coordinates: [number, number];
  reservoirCount: number;
  avgReservoirPercentage: number;
  totalInflowCusecs: number;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  reservoirs: ReservoirMapData[];
}

// Calculate risk level based on reservoir percentage and inflow
const calculateRiskLevel = (percentage: number, inflow: number): 'low' | 'medium' | 'high' | 'severe' => {
  if (percentage >= 90 || inflow >= 10000) return 'severe';
  if (percentage >= 75 || inflow >= 5000) return 'high';
  if (percentage >= 60 || inflow >= 1000) return 'medium';
  return 'low';
};

// Fetch reservoir data for a specific state
export const fetchReservoirsForState = async (state: string): Promise<ReservoirMapData[]> => {
  try {
    console.log(`🗺️ Fetching reservoirs for state: ${state}`);
    
    const { data, error } = await supabase
      .from('indian_reservoir_levels')
      .select('*')
      .eq('state', state)
      .not('reservoir_name', 'is', null)
      .not('lat', 'is', null)
      .not('long', 'is', null)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching reservoirs for state:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No reservoirs found for state: ${state}`);
      return [];
    }

    const reservoirs: ReservoirMapData[] = data.map((reservoir, index) => {
      const percentage = Math.min(100, Math.max(0, reservoir.percentage_full || 0));
      const inflow = reservoir.inflow_cusecs || 0;
      const outflow = reservoir.outflow_cusecs || 0;
      
      return {
        id: `${reservoir.reservoir_name}-${index}`,
        name: reservoir.reservoir_name,
        state: reservoir.state,
        district: reservoir.district || 'Unknown',
        coordinates: [reservoir.lat, reservoir.long],
        reservoirPercentage: percentage,
        riskLevel: calculateRiskLevel(percentage, inflow),
        inflowCusecs: inflow,
        outflowCusecs: outflow,
        lastUpdated: reservoir.last_updated || new Date().toISOString()
      };
    });

    console.log(`✅ Found ${reservoirs.length} reservoirs for ${state}`);
    return reservoirs;
  } catch (error) {
    console.error('Error in fetchReservoirsForState:', error);
    return [];
  }
};

// Fetch reservoir data for a specific district
export const fetchReservoirsForDistrict = async (state: string, district: string): Promise<ReservoirMapData[]> => {
  try {
    console.log(`🏞️ Fetching reservoirs for district: ${district}, ${state}`);
    
    const { data, error } = await supabase
      .from('indian_reservoir_levels')
      .select('*')
      .eq('state', state)
      .eq('district', district)
      .not('reservoir_name', 'is', null)
      .not('lat', 'is', null)
      .not('long', 'is', null)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching reservoirs for district:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No reservoirs found for district: ${district}`);
      return [];
    }

    const reservoirs: ReservoirMapData[] = data.map((reservoir, index) => {
      const percentage = Math.min(100, Math.max(0, reservoir.percentage_full || 0));
      const inflow = reservoir.inflow_cusecs || 0;
      const outflow = reservoir.outflow_cusecs || 0;
      
      return {
        id: `${reservoir.reservoir_name}-${index}`,
        name: reservoir.reservoir_name,
        state: reservoir.state,
        district: reservoir.district || 'Unknown',
        coordinates: [reservoir.lat, reservoir.long],
        reservoirPercentage: percentage,
        riskLevel: calculateRiskLevel(percentage, inflow),
        inflowCusecs: inflow,
        outflowCusecs: outflow,
        lastUpdated: reservoir.last_updated || new Date().toISOString()
      };
    });

    console.log(`✅ Found ${reservoirs.length} reservoirs for ${district}`);
    return reservoirs;
  } catch (error) {
    console.error('Error in fetchReservoirsForDistrict:', error);
    return [];
  }
};

// Get district summaries with aggregated reservoir data
export const getDistrictReservoirSummaries = async (state: string): Promise<DistrictReservoirSummary[]> => {
  try {
    const reservoirs = await fetchReservoirsForState(state);
    
    if (reservoirs.length === 0) {
      return [];
    }

    // Group reservoirs by district
    const districtMap = new Map<string, ReservoirMapData[]>();
    
    reservoirs.forEach(reservoir => {
      const district = reservoir.district;
      if (!districtMap.has(district)) {
        districtMap.set(district, []);
      }
      districtMap.get(district)!.push(reservoir);
    });

    // Create summaries for each district
    const summaries: DistrictReservoirSummary[] = [];
    
    districtMap.forEach((districtReservoirs, districtName) => {
      if (districtReservoirs.length === 0) return;

      // Calculate averages and totals
      const totalPercentage = districtReservoirs.reduce((sum, r) => sum + r.reservoirPercentage, 0);
      const avgPercentage = totalPercentage / districtReservoirs.length;
      const totalInflow = districtReservoirs.reduce((sum, r) => sum + r.inflowCusecs, 0);
      
      // Use the first reservoir's coordinates as district center (could be improved with actual district centroids)
      const coordinates = districtReservoirs[0].coordinates;
      
      // Determine overall risk level for the district
      const riskLevel = calculateRiskLevel(avgPercentage, totalInflow);
      
      summaries.push({
        district: districtName,
        state: state,
        coordinates: coordinates,
        reservoirCount: districtReservoirs.length,
        avgReservoirPercentage: Math.round(avgPercentage * 100) / 100,
        totalInflowCusecs: totalInflow,
        riskLevel: riskLevel,
        reservoirs: districtReservoirs
      });
    });

    console.log(`📊 Created ${summaries.length} district summaries for ${state}`);
    return summaries;
  } catch (error) {
    console.error('Error in getDistrictReservoirSummaries:', error);
    return [];
  }
};
