// src/services/reservoirDataService.ts (Suggested new file name)

import { supabase } from '../integrations/supabase/client';
// You might also import 'regions' from floodData.ts if this service directly uses it for mapping
// import { regions } from '../data/floodData';

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
    // Include full_reservoir_level if it's consistently available and useful for risk calculation
    full_reservoir_level?: number; // Added from your schema
}

export interface FloodRiskCalculation {
    riskLevel: 'low' | 'medium' | 'high' | 'severe';
    probabilityIncrease: number; // Represents probability increase due to reservoir conditions
    affectedPopulation: number;
    reasoning: string;
}

// Map regions to their relevant reservoirs (consider making this more dynamic or comprehensive if possible)
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
    // Add new cities here as well if they have known relevant reservoirs
    // 'agra': ['Yamuna'] // Example
};

// Helper function to get state for region (consider importing 'regions' from floodData.ts instead)
// For now, this is a hardcoded map. If you have a single source of truth for regions, use that.
const getStateForRegion = (region: string): string => {
    const regionStateMap: Record<string, string> = {
        'mumbai': 'Maharashtra', 'delhi': 'Delhi', 'kolkata': 'West Bengal', 'chennai': 'Tamil Nadu',
        'bangalore': 'Karnataka', 'hyderabad': 'Telangana', 'ahmedabad': 'Gujarat', 'pune': 'Maharashtra',
        'surat': 'Gujarat', 'jaipur': 'Rajasthan', 'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh',
        'nagpur': 'Maharashtra', 'patna': 'Bihar', 'indore': 'Madhya Pradesh', 'kochi': 'Kerala',
        'guwahati': 'Assam',
        // Add states for new cities here if this map is the primary source
        'agra': 'Uttar Pradesh', 'allahabad': 'Uttar Pradesh', // etc.
    };
    return regionStateMap[region.toLowerCase()] || '';
};


export const fetchReservoirData = async (): Promise<ReservoirData[]> => {
    try {
        console.log('Fetching reservoir data from Supabase...');

        // Select all relevant columns for comprehensive data
        const { data: reservoirs, error } = await supabase
            .from('indian_reservoir_levels')
            .select('id, reservoir_name, state, district, current_level_mcm, capacity_mcm, percentage_full, inflow_cusecs, outflow_cusecs, last_updated, lat, long, full_reservoir_level')
            .limit(10000); // Increased limit to ensure all relevant records are fetched

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

---

#### 3. `calculateFloodRiskFromReservoirs` Function

This function is well-thought-out, incorporating multiple factors for risk assessment.

**Key Enhancements:**

* **Refine `relevantReservoirs` filtering**: Your current filter uses `r.reservoir_name?.toLowerCase().includes(name.toLowerCase())` which is good. Adding the state check (`r.state?.toLowerCase() === getStateForRegion(region).toLowerCase()`) is also a good fallback. However, consider if `r.district` is a better primary key for mapping to your `regions` (cities) if possible, as a city (region) belongs to a specific district.
* **Risk Scoring Clarity**: The scoring logic is clear. You might want to normalize the scores if they're meant to be truly comparable across regions.
* **Affected Population**: This remains a hardcoded estimate. If you have population data per district/region in your `floodData.ts` or another static source, you could integrate it here.
* **Reasoning Refinement**: Make the reasoning more precise.

```typescript
// Part of src/services/reservoirDataService.ts (or floodRiskService.ts)

export const calculateFloodRiskFromReservoirs = (
    regionName: string, // Changed parameter name for clarity
    reservoirs: ReservoirData[]
): FloodRiskCalculation => {
    const lowerCaseRegionName = regionName.toLowerCase();
    const regionReservoirs = REGION_RESERVOIR_MAP[lowerCaseRegionName] || [];

    // Prioritize matching by district name from the Supabase data
    // Then, if a reservoir name matches a key in REGION_RESERVOIR_MAP, include it
    // Finally, fall back to state matching if no district or specific reservoir name match
    const relevantReservoirs = reservoirs.filter(r => {
        const reservoirDistrict = r.district?.toLowerCase();
        const reservoirState = r.state?.toLowerCase();
        const mappedRegionState = getStateForRegion(regionName).toLowerCase();

        // 1. Direct district match (if the regionName itself is a district)
        if (reservoirDistrict === lowerCaseRegionName) return true;

        // 2. Reservoir name match with the predefined map
        if (regionReservoirs.some(name => r.reservoir_name?.toLowerCase().includes(name.toLowerCase()))) {
            return true;
        }

        // 3. State match (as a broader fallback, assumes regions in the same state are influenced)
        if (mappedRegionState && reservoirState === mappedRegionState) {
            return true;
        }

        return false;
    });

    if (relevantReservoirs.length === 0) {
        // Fallback for regions with no direct reservoir data
        return {
            riskLevel: 'low', // Default to low if no relevant data
            probabilityIncrease: 0,
            affectedPopulation: 0,
            reasoning: 'No relevant reservoir data found for this region.'
        };
    }

    let totalRiskScore = 0;
    let criticalCount = 0; // Reservoirs > 90% FRL/Capacity
    let highInflowCount = 0; // Reservoirs with high net inflow
    let potentialOverflowCount = 0; // Reservoirs very near/at FRL with positive net inflow

    relevantReservoirs.forEach(reservoir => {
        // Use full_reservoir_level (FRL) if available for better accuracy
        const effectiveCapacity = reservoir.full_reservoir_level || reservoir.capacity_mcm || 0;
        const currentLevel = reservoir.current_level_mcm || 0;

        let percentageFilled = 0;
        if (effectiveCapacity > 0) {
            percentageFilled = (currentLevel / effectiveCapacity) * 100;
        } else if (reservoir.percentage_full !== undefined) {
            percentageFilled = reservoir.percentage_full; // Fallback to percentage_full if no levels
        }

        const inflowRate = reservoir.inflow_cusecs || 0;
        const outflowRate = reservoir.outflow_cusecs || 0;
        const netInflow = inflowRate - outflowRate;

        let reservoirRisk = 0;

        // Risk based on percentage filled (prioritize FRL calculation)
        if (percentageFilled >= 95) {
            reservoirRisk += 50; // Severe risk
            criticalCount++;
            if (netInflow > 0) potentialOverflowCount++;
        } else if (percentageFilled >= 85) {
            reservoirRisk += 30; // High risk
            criticalCount++;
        } else if (percentageFilled >= 70) {
            reservoirRisk += 15; // Medium risk
        }

        // Risk based on net inflow
        if (netInflow > 20000) { // Very high inflow
            reservoirRisk += 40;
            highInflowCount++;
        } else if (netInflow > 10000) { // High inflow
            reservoirRisk += 25;
            highInflowCount++;
        } else if (netInflow > 2000) { // Moderate inflow
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
        affectedPopulation = 2000000; // Example
        reasoning += `Severe risk due to high reservoir levels (avg score: ${avgRiskScore.toFixed(0)})`;
        if (potentialOverflowCount > 0) reasoning += ` and ${potentialOverflowCount} reservoir(s) nearing overflow.`;
    } else if (avgRiskScore >= 40 || criticalCount > 0) {
        riskLevel = 'high';
        probabilityIncrease = 30;
        affectedPopulation = 1000000; // Example
        reasoning += `High risk, average reservoir stress is significant (avg score: ${avgRiskScore.toFixed(0)})`;
        if (criticalCount > 0) reasoning += ` with ${criticalCount} reservoir(s) at critical levels.`;
    } else if (avgRiskScore >= 20 || highInflowCount > 0) {
        riskLevel = 'medium';
        probabilityIncrease = 15;
        affectedPopulation = 500000; // Example
        reasoning += `Medium risk with some reservoir stress (avg score: ${avgRiskScore.toFixed(0)})`;
        if (highInflowCount > 0) reasoning += ` and ${highInflowCount} reservoir(s) experiencing high inflows.`;
    } else {
        riskLevel = 'low';
        probabilityIncrease = 5;
        affectedPopulation = 100000; // Example
        reasoning += `Low risk, reservoir conditions are stable (avg score: ${avgRiskScore.toFixed(0)}).`;
    }

    return {
        riskLevel,
        probabilityIncrease,
        affectedPopulation,
        reasoning: reasoning.trim()
    };
};
