// src/services/imdApiService.ts

import { supabase } from '../integrations/supabase/client';
import { regions } from '../data/floodData'; // Import regions from floodData.ts
import { ReservoirData } from './reservoirDataService'; // Assuming this interface is correct

// --- Type Definitions (No Changes Needed Here, they are good) ---
export type IMDWeatherWarning = {
    type: 'alert' | 'warning' | 'severe' | 'watch';
    issuedBy: string;
    issuedAt: string;
    validUntil: string;
    message: string;
    affectedAreas: string;
    sourceUrl: string;
};

export type IMDRiverData = {
    name: string;
    currentLevel: number; // in MCM
    dangerLevel: number; // in MCM
    warningLevel: number; // in MCM
    normalLevel: number; // in MCM
    trend: 'rising' | 'falling' | 'stable';
    lastUpdated: string;
};

export type IMDRegionData = {
    state: string;
    district: string;
    reservoirPercentage: number; // Aggregate percentage for the region/district
    inflowCusecs: number;       // Aggregate inflow for the region/district
    floodRiskLevel: 'low' | 'medium' | 'high' | 'severe';
    populationAffected: number; // Still will be 0 unless sourced
    affectedArea: number;       // Still will be 0 unless sourced
    riverData?: IMDRiverData; // Represents the *most critical* river/reservoir in the district, or aggregated data
    activeWarnings?: IMDWeatherWarning[]; // Still derived/mocked
    predictedFlood?: {
        date: string;
        probabilityPercentage: number;
        expectedRainfall: number;
        timeframe: string;
    };
    coordinates: [number, number];
};

// --- Helper for Coordinate Lookup ---
// Centralize coordinate lookup logic to prioritize regions from floodData.ts
const getCoordinatesForRegion = (regionName: string, fallbackLat?: number | null, fallbackLong?: number | null): [number, number] => {
    const foundRegion = regions.find(r => r.label.toLowerCase() === regionName.toLowerCase());
    if (foundRegion && foundRegion.coordinates && foundRegion.coordinates.length === 2) {
        return foundRegion.coordinates as [number, number];
    }
    // Fallback to coordinates from the reservoir data itself if available
    if (fallbackLat != null && fallbackLong != null) {
        return [fallbackLat, fallbackLong];
    }
    // Default to a central India point or [0,0] if no coordinates can be found
    return [20.5937, 78.9629]; // Central India
};


// --- IMD API Service ---
export const imdApiService = {
    fetchFloodData: async (): Promise<IMDRegionData[]> => {
        console.log('Fetching live data from Supabase (indian_reservoir_levels)...');

        try {
            // Select more relevant columns from the schema, including FRL for better risk calculation
            const { data: reservoirs, error } = await supabase
                .from('indian_reservoir_levels')
                .select('reservoir_name, district, state, capacity_mcm, current_level_mcm, inflow_cusecs, outflow_cusecs, percentage_full, last_updated, lat, long, full_reservoir_level')
                .limit(10000); // Fetch all records for comprehensive aggregation

            if (error) {
                console.error('Error fetching reservoir data from Supabase:', error);
                return []; // Return empty array on error
            }

            if (!reservoirs || reservoirs.length === 0) {
                console.warn('No reservoir data found in Supabase.');
                return []; // Return empty array if no data
            }

            console.log(`Successfully fetched ${reservoirs.length} reservoir records from Supabase.`);

            // Use a Map to aggregate data per district/region
            const aggregatedRegionData = new Map<string, IMDRegionData>();

            // Initialize all known regions from floodData.ts with default values
            regions.forEach(region => {
                const regionKey = region.label.toLowerCase();
                aggregatedRegionData.set(regionKey, {
                    state: region.state,
                    district: region.label,
                    reservoirPercentage: 0,
                    inflowCusecs: 0,
                    floodRiskLevel: 'low',
                    populationAffected: 0, // No data from DB
                    affectedArea: 0,       // No data from DB
                    coordinates: getCoordinatesForRegion(region.label), // Get from regions.ts
                    // Initialize optional fields as undefined
                    riverData: undefined,
                    activeWarnings: undefined,
                    predictedFlood: undefined
                });
            });

            reservoirs.forEach((res: ReservoirData) => {
                // Determine the most appropriate region name for this reservoir data
                // Prioritize district matching, then state matching, then specific known cities
                let assignedRegionName: string | null = null;

                // Try matching by district first
                if (res.district) {
                    const trimmedDistrict = res.district.trim().toLowerCase();
                    const foundRegionByDistrict = regions.find(r => r.label.toLowerCase() === trimmedDistrict);
                    if (foundRegionByDistrict) {
                        assignedRegionName = foundRegionByDistrict.label;
                    }
                }

                // If no district match, try matching by state
                if (!assignedRegionName && res.state) {
                    const trimmedState = res.state.trim().toLowerCase();
                    // Find a region (city) that belongs to this state. This is a heuristic.
                    const foundRegionByState = regions.find(r => r.state.toLowerCase() === trimmedState);
                    if (foundRegionByState) {
                        assignedRegionName = foundRegionByState.label;
                    }
                }

                // Fallback to "unknown" if no mapping is found in `regions`
                const regionKey = assignedRegionName ? assignedRegionName.toLowerCase() : 'unknown';

                // Get or initialize the region entry in the aggregated map
                let regionEntry = aggregatedRegionData.get(regionKey);
                if (!regionEntry) {
                    // Create a new entry for truly 'unknown' or unmapped districts/states
                    regionEntry = {
                        state: res.state || 'Unknown State', // Use state from reservoir data if available
                        district: assignedRegionName || res.district || 'Unknown District', // Use reservoir district if no region match
                        reservoirPercentage: 0,
                        inflowCusecs: 0,
                        floodRiskLevel: 'low',
                        populationAffected: 0,
                        affectedArea: 0,
                        coordinates: getCoordinatesForRegion(assignedRegionName || res.district || 'unknown', res.lat, res.long),
                    };
                    aggregatedRegionData.set(regionKey, regionEntry);
                }

                // --- Aggregate Data for the Region/District ---
                const percentageFull = parseFloat(String(res.percentage_full)) || 0;
                const inflowCusecs = res.inflow_cusecs || 0;
                const currentLevel = res.current_level_mcm || 0;
                const capacityMCM = res.capacity_mcm || 0;
                const fullReservoirLevel = res.full_reservoir_level || null;

                // Aggregate reservoir percentage (take the highest, or average, depending on strategy)
                // For simplicity here, we'll take the max percentage, assuming it indicates highest stress
                regionEntry.reservoirPercentage = Math.max(regionEntry.reservoirPercentage, percentageFull);

                // Sum inflows for a more comprehensive picture of water coming into the region
                regionEntry.inflowCusecs += inflowCusecs;

                // --- Improved Risk Level Calculation ---
                // Prioritize FRL if available, otherwise use capacity and percentage
                let currentRiskLevel: IMDRegionData['floodRiskLevel'] = 'low';

                if (fullReservoirLevel && currentLevel && currentLevel > 0) {
                    // Calculate percentage relative to FRL if available
                    const percentageOfFRL = (currentLevel / fullReservoirLevel) * 100;
                    if (percentageOfFRL >= 95) { // 95% of FRL or more
                        currentRiskLevel = 'severe';
                    } else if (percentageOfFRL >= 85) { // 85-95% of FRL
                        currentRiskLevel = 'high';
                    } else if (percentageOfFRL >= 70) { // 70-85% of FRL
                        currentRiskLevel = 'medium';
                    }
                } else if (capacityMCM > 0) {
                    // Fallback to percentage of capacity if FRL not available
                    if (percentageFull >= 90) { // 90% of capacity or more
                        currentRiskLevel = 'severe';
                    } else if (percentageFull >= 75) { // 75-90% of capacity
                        currentRiskLevel = 'high';
                    } else if (percentageFull >= 50) { // 50-75% of capacity
                        currentRiskLevel = 'medium';
                    }
                }

                // Also consider high inflow as a risk factor, regardless of current level
                if (inflowCusecs >= 10000) { // Very high inflow
                    currentRiskLevel = 'severe';
                } else if (inflowCusecs >= 5000 && currentRiskLevel !== 'severe') { // High inflow
                    currentRiskLevel = 'high';
                } else if (inflowCusecs >= 1000 && currentRiskLevel === 'low') { // Moderate inflow, might push low to medium
                    currentRiskLevel = 'medium';
                }


                // Update the region's overall risk level if this reservoir's data indicates a higher risk
                const riskLevelOrder = { 'low': 0, 'medium': 1, 'high': 2, 'severe': 3 };
                if (riskLevelOrder[currentRiskLevel] > riskLevelOrder[regionEntry.floodRiskLevel]) {
                    regionEntry.floodRiskLevel = currentRiskLevel;
                }

                // --- Populate River Data (for the most significant reservoir in the region) ---
                // Here, we decide to use the reservoir with the highest current level as the representative 'riverData' for the district
                if (!regionEntry.riverData || (currentLevel > (regionEntry.riverData.currentLevel || 0))) {
                    regionEntry.riverData = {
                        name: res.reservoir_name, // Using reservoir name as river name proxy
                        currentLevel: currentLevel,
                        dangerLevel: fullReservoirLevel || (capacityMCM * 0.95) || 800, // Prioritize FRL for danger
                        warningLevel: (fullReservoirLevel ? fullReservoirLevel * 0.85 : (capacityMCM * 0.85)) || 650, // Prioritize FRL for warning
                        normalLevel: (fullReservoirLevel ? fullReservoirLevel * 0.5 : (capacityMCM * 0.5)) || 350, // Prioritize FRL for normal
                        trend: (inflowCusecs > (res.outflow_cusecs || 0)) ? 'rising' : ((res.outflow_cusecs || 0) > inflowCusecs ? 'falling' : 'stable'),
                        lastUpdated: res.last_updated || new Date().toISOString()
                    };
                }

                // --- Placeholder for activeWarnings & predictedFlood ---
                // These still need external sources or more sophisticated internal derivation
                // For now, they remain undefined unless you add specific logic here.
                // You could, for example, mock a warning if riskLevel is 'severe'.
                if (regionEntry.floodRiskLevel === 'severe' && !regionEntry.activeWarnings) {
                    regionEntry.activeWarnings = [{
                        type: 'severe',
                        issuedBy: 'IMD (Simulated)',
                        issuedAt: new Date().toISOString(),
                        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
                        message: `Severe flood alert for ${regionEntry.district} due to high reservoir levels and heavy inflows.`,
                        affectedAreas: regionEntry.district,
                        sourceUrl: '#'
                    }];
                }
                // Similarly for predictedFlood, you can add a simple prediction based on riskLevel
                if (regionEntry.floodRiskLevel === 'high' || regionEntry.floodRiskLevel === 'severe') {
                    regionEntry.predictedFlood = {
                        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
                        probabilityPercentage: (regionEntry.floodRiskLevel === 'severe' ? 80 : 60), // Higher for severe
                        expectedRainfall: regionEntry.floodRiskLevel === 'severe' ? 150 : 80, // More rainfall for severe
                        timeframe: 'Next 72 hours'
                    };
                }

            });

            const resultData = Array.from(aggregatedRegionData.values());
            console.log('Live IMD data fetched and processed successfully. Total regions:', resultData.length);
            return resultData;

        } catch (error) {
            console.error('Failed to fetch live IMD data from Supabase:', error);
            // Consider throwing a more specific error or returning a default/mock data if critical.
            return [];
        }
    }
};
