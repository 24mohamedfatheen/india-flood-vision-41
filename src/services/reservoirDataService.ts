
import { supabase } from '../integrations/supabase/client';

export interface ReservoirData {
    id?: number;
    reservoir_name?: string;
    state?: string;
    district?: string;
    current_level_mcm?: number;
    capacity_mcm?: number;
    percentage_full?: number;
    inflow_cusecs?: number;
    outflow_cusecs?: number;
    last_updated?: string;
    lat?: number;
    long?: number;
    full_reservoir_level?: number;
}

export interface FloodRiskCalculation {
    riskLevel: 'low' | 'medium' | 'high' | 'severe';
    probabilityIncrease: number;
    affectedPopulation: number;
    reasoning: string;
}

// Map regions to their relevant reservoirs
const REGION_RESERVOIR_MAP: Record<string, string[]> = {
    'mumbai': ['Tansa', 'Vihar', 'Tulsi', 'Vaitarna'],
    'delhi': ['Yamuna', 'Bhakra'],
    'kolkata': ['Damodar Valley', 'Farakka'],
    'chennai': ['Poondi', 'Cholavaram', 'Redhills', 'Chembarambakkam'],
    'bangalore': ['Cauvery', 'Kabini', 'Krishna Raja Sagara'],
    'hyderabad': ['Nagarjuna Sagar', 'Srisailam'],
    'ahmedabad': ['Sardar Sarovar', 'Ukai'],
    'pune': ['Khadakwasla', 'Panshet', 'Warasgaon'],
    'surat': ['Ukai', 'Kadana'],
    'jaipur': ['Bisalpur', 'Mahi Bajaj Sagar'],
    'lucknow': ['Rihand', 'Obra'],
    'kanpur': ['Rihand', 'Mata Tila'],
    'nagpur': ['Gosikhurd', 'Totladoh'],
    'patna': ['Sone', 'Kosi'],
    'indore': ['Omkareshwar', 'Bargi'],
    'kochi': ['Idukki', 'Mullaperiyar'],
    'guwahati': ['Kopili', 'Umiam'],
    'agra': ['Yamuna'],
    'allahabad': ['Ganga', 'Yamuna'],
    'gorakhpur': ['Rapti'],
    'bareilly': ['Ganga'],
    'varanasi': ['Ganga']
};

// Helper function to get state for region
const getStateForRegion = (region: string): string => {
    const regionStateMap: Record<string, string> = {
        'mumbai': 'Maharashtra', 'delhi': 'Delhi', 'kolkata': 'West Bengal', 'chennai': 'Tamil Nadu',
        'bangalore': 'Karnataka', 'hyderabad': 'Telangana', 'ahmedabad': 'Gujarat', 'pune': 'Maharashtra',
        'surat': 'Gujarat', 'jaipur': 'Rajasthan', 'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh',
        'nagpur': 'Maharashtra', 'patna': 'Bihar', 'indore': 'Madhya Pradesh', 'kochi': 'Kerala',
        'guwahati': 'Assam', 'agra': 'Uttar Pradesh', 'allahabad': 'Uttar Pradesh', 'gorakhpur': 'Uttar Pradesh',
        'bareilly': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'gaya': 'Bihar', 'purnia': 'Bihar',
        'motihari': 'Bihar', 'dibrugarh': 'Assam', 'jorhat': 'Assam', 'kokrajhar': 'Assam',
        'bhubaneswar': 'Odisha', 'cuttack': 'Odisha', 'balasore': 'Odisha', 'vijayawada': 'Andhra Pradesh',
        'rajahmundry': 'Andhra Pradesh', 'guntur': 'Andhra Pradesh', 'thiruvananthapuram': 'Kerala',
        'thrissur': 'Kerala', 'kottayam': 'Kerala', 'nashik': 'Maharashtra', 'kolhapur': 'Maharashtra',
        'vadodara': 'Gujarat', 'rajkot': 'Gujarat', 'amritsar': 'Punjab', 'ludhiana': 'Punjab',
        'jalandhar': 'Punjab', 'roorkee': 'Uttarakhand', 'haridwar': 'Uttarakhand', 'shimla': 'Himachal Pradesh',
        'bihar sharif': 'Bihar', 'bhagalpur': 'Bihar', 'silchar': 'Assam', 'muzaffarpur': 'Bihar',
        'darbhanga': 'Bihar', 'alappuzha': 'Kerala', 'dehradun': 'Uttarakhand', 'srinagar': 'Jammu and Kashmir'
    };
    return regionStateMap[region.toLowerCase()] || '';
};

export const fetchReservoirData = async (): Promise<ReservoirData[]> => {
    try {
        console.log('Fetching reservoir data from Supabase...');

        const { data: reservoirs, error } = await supabase
            .from('indian_reservoir_levels')
            .select('id, reservoir_name, state, district, current_level_mcm, capacity_mcm, percentage_full, inflow_cusecs, outflow_cusecs, last_updated, lat, long, full_reservoir_level')
            .limit(10000);

        if (error) {
            console.error('Error fetching reservoir data from Supabase:', error);
            return [];
        }

        if (!reservoirs || reservoirs.length === 0) {
            console.warn('No reservoir data found in Supabase for processing.');
            return [];
        }

        console.log(`Successfully fetched ${reservoirs.length} reservoir records.`);
        return reservoirs;

    } catch (error) {
        console.error('Critical error during reservoir data fetching:', error);
        return [];
    }
};

export const calculateFloodRiskFromReservoirs = (
    regionName: string,
    reservoirs: ReservoirData[]
): FloodRiskCalculation => {
    const lowerCaseRegionName = regionName.toLowerCase();
    const regionReservoirs = REGION_RESERVOIR_MAP[lowerCaseRegionName] || [];

    // Filter relevant reservoirs based on multiple criteria
    const relevantReservoirs = reservoirs.filter(r => {
        const reservoirDistrict = r.district?.toLowerCase();
        const reservoirState = r.state?.toLowerCase();
        const mappedRegionState = getStateForRegion(regionName).toLowerCase();

        // 1. Direct district match
        if (reservoirDistrict === lowerCaseRegionName) return true;

        // 2. Reservoir name match with predefined map
        if (regionReservoirs.some(name => r.reservoir_name?.toLowerCase().includes(name.toLowerCase()))) {
            return true;
        }

        // 3. State match as fallback
        if (mappedRegionState && reservoirState === mappedRegionState) {
            return true;
        }

        return false;
    });

    if (relevantReservoirs.length === 0) {
        return {
            riskLevel: 'low',
            probabilityIncrease: 0,
            affectedPopulation: 0,
            reasoning: 'No relevant reservoir data found for this region.'
        };
    }

    let totalRiskScore = 0;
    let criticalCount = 0;
    let highInflowCount = 0;
    let potentialOverflowCount = 0;

    relevantReservoirs.forEach(reservoir => {
        const effectiveCapacity = reservoir.full_reservoir_level || reservoir.capacity_mcm || 0;
        const currentLevel = reservoir.current_level_mcm || 0;

        let percentageFilled = 0;
        if (effectiveCapacity > 0) {
            percentageFilled = (currentLevel / effectiveCapacity) * 100;
        } else if (reservoir.percentage_full !== undefined) {
            percentageFilled = reservoir.percentage_full;
        }

        const inflowRate = reservoir.inflow_cusecs || 0;
        const outflowRate = reservoir.outflow_cusecs || 0;
        const netInflow = inflowRate - outflowRate;

        let reservoirRisk = 0;

        // Risk based on percentage filled
        if (percentageFilled >= 95) {
            reservoirRisk += 50;
            criticalCount++;
            if (netInflow > 0) potentialOverflowCount++;
        } else if (percentageFilled >= 85) {
            reservoirRisk += 30;
            criticalCount++;
        } else if (percentageFilled >= 70) {
            reservoirRisk += 15;
        }

        // Risk based on net inflow
        if (netInflow > 20000) {
            reservoirRisk += 40;
            highInflowCount++;
        } else if (netInflow > 10000) {
            reservoirRisk += 25;
            highInflowCount++;
        } else if (netInflow > 2000) {
            reservoirRisk += 10;
        }

        totalRiskScore += reservoirRisk;
    });

    const avgRiskScore = relevantReservoirs.length > 0 ? totalRiskScore / relevantReservoirs.length : 0;

    let riskLevel: 'low' | 'medium' | 'high' | 'severe';
    let probabilityIncrease: number;
    let affectedPopulation: number;
    let reasoning = `Flood risk for ${regionName}: `;

    if (avgRiskScore >= 60 || potentialOverflowCount > 0) {
        riskLevel = 'severe';
        probabilityIncrease = 45;
        affectedPopulation = 2000000;
        reasoning += `Severe risk due to high reservoir levels (avg score: ${avgRiskScore.toFixed(0)})`;
        if (potentialOverflowCount > 0) reasoning += ` and ${potentialOverflowCount} reservoir(s) nearing overflow.`;
    } else if (avgRiskScore >= 40 || criticalCount > 0) {
        riskLevel = 'high';
        probabilityIncrease = 30;
        affectedPopulation = 1000000;
        reasoning += `High risk, average reservoir stress is significant (avg score: ${avgRiskScore.toFixed(0)})`;
        if (criticalCount > 0) reasoning += ` with ${criticalCount} reservoir(s) at critical levels.`;
    } else if (avgRiskScore >= 20 || highInflowCount > 0) {
        riskLevel = 'medium';
        probabilityIncrease = 15;
        affectedPopulation = 500000;
        reasoning += `Medium risk with some reservoir stress (avg score: ${avgRiskScore.toFixed(0)})`;
        if (highInflowCount > 0) reasoning += ` and ${highInflowCount} reservoir(s) experiencing high inflows.`;
    } else {
        riskLevel = 'low';
        probabilityIncrease = 5;
        affectedPopulation = 100000;
        reasoning += `Low risk, reservoir conditions are stable (avg score: ${avgRiskScore.toFixed(0)}).`;
    }

    return {
        riskLevel,
        probabilityIncrease,
        affectedPopulation,
        reasoning: reasoning.trim()
    };
};
