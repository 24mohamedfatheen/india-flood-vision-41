
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

// Enhanced reservoir to region mapping based on reservoir names
const RESERVOIR_REGION_MAP: Record<string, string> = {
    // Mumbai region reservoirs
    'tansa': 'mumbai',
    'vihar': 'mumbai',
    'tulsi': 'mumbai',
    'vaitarna': 'mumbai',
    'bhatsa': 'mumbai',
    'upper vaitarna': 'mumbai',
    'modak sagar': 'mumbai',
    
    // Delhi region reservoirs
    'bhakra': 'delhi',
    'yamuna': 'delhi',
    'tehri': 'delhi',
    
    // Kolkata region reservoirs
    'farakka': 'kolkata',
    'damodar': 'kolkata',
    'mayurakshi': 'kolkata',
    'dvc': 'kolkata',
    
    // Chennai region reservoirs
    'poondi': 'chennai',
    'cholavaram': 'chennai',
    'redhills': 'chennai',
    'chembarambakkam': 'chennai',
    'veeranam': 'chennai',
    
    // Bangalore region reservoirs
    'krishna raja sagara': 'bengaluru',
    'kabini': 'bengaluru',
    'cauvery': 'bengaluru',
    'hemavathi': 'bengaluru',
    'harangi': 'bengaluru',
    
    // Hyderabad region reservoirs
    'nagarjuna sagar': 'hyderabad',
    'srisailam': 'hyderabad',
    'nizamsagar': 'hyderabad',
    'singur': 'hyderabad',
    
    // Ahmedabad/Gujarat reservoirs
    'sardar sarovar': 'ahmedabad',
    'ukai': 'surat',
    'kadana': 'ahmedabad',
    'dharoi': 'ahmedabad',
    
    // Pune region reservoirs
    'khadakwasla': 'pune',
    'panshet': 'pune',
    'warasgaon': 'pune',
    'temghar': 'pune',
    
    // Patna/Bihar reservoirs
    'sone': 'patna',
    'kosi': 'patna',
    'gandak': 'patna',
    'bagmati': 'patna',
    
    // Assam reservoirs
    'kopili': 'guwahati',
    'umiam': 'guwahati',
    'doyang': 'guwahati',
    
    // Kerala reservoirs
    'idukki': 'kochi',
    'mullaperiyar': 'kochi',
    'kakki': 'thiruvananthapuram',
    'pamba': 'thiruvananthapuram',
    
    // Maharashtra reservoirs
    'koyna': 'kolhapur',
    'warna': 'kolhapur',
    'upper krishna': 'kolhapur',
    'jayakwadi': 'nashik',
    'gangapur': 'nashik',
    
    // Rajasthan reservoirs
    'bisalpur': 'jaipur',
    'mahi bajaj sagar': 'jaipur',
    'rana pratap sagar': 'jaipur',
    
    // Uttar Pradesh reservoirs
    'rihand': 'lucknow',
    'obra': 'lucknow',
    'mata tila': 'kanpur',
    'rajghat': 'varanasi',
    
    // Madhya Pradesh reservoirs
    'omkareshwar': 'indore',
    'bargi': 'indore',
    'tawa': 'indore',
    'gandhi sagar': 'indore',
    
    // Odisha reservoirs
    'hirakud': 'bhubaneswar',
    'balimela': 'bhubaneswar',
    'machkund': 'bhubaneswar',
    
    // Andhra Pradesh reservoirs
    'somasila': 'vijayawada',
    'sriram sagar': 'vijayawada',
    'pochampad': 'vijayawada',
    
    // Add more mappings as needed
};

// Function to map reservoir name to region
const getRegionFromReservoirName = (reservoirName: string): string | null => {
    const lowerName = reservoirName.toLowerCase().trim();
    
    // Direct match
    if (RESERVOIR_REGION_MAP[lowerName]) {
        return RESERVOIR_REGION_MAP[lowerName];
    }
    
    // Partial match - check if reservoir name contains any key
    for (const [key, region] of Object.entries(RESERVOIR_REGION_MAP)) {
        if (lowerName.includes(key) || key.includes(lowerName)) {
            return region;
        }
    }
    
    return null;
};

// Enhanced risk calculation based on actual reservoir data
const calculateRiskFromReservoirData = (reservoir: ReservoirData): 'low' | 'medium' | 'high' | 'severe' => {
    const percentageFull = reservoir.percentage_full || 0;
    const inflowCusecs = reservoir.inflow_cusecs || 0;
    const outflowCusecs = reservoir.outflow_cusecs || 0;
    const currentLevel = reservoir.current_level_mcm || 0;
    const capacity = reservoir.capacity_mcm || 0;
    const fullReservoirLevel = reservoir.full_reservoir_level || 0;
    
    let riskScore = 0;
    
    // Calculate percentage relative to FRL if available, otherwise use capacity
    let effectivePercentage = percentageFull;
    if (fullReservoirLevel > 0 && currentLevel > 0) {
        effectivePercentage = (currentLevel / fullReservoirLevel) * 100;
    }
    
    // Risk based on reservoir level
    if (effectivePercentage >= 95) {
        riskScore += 40; // Critical level
    } else if (effectivePercentage >= 85) {
        riskScore += 30; // High level
    } else if (effectivePercentage >= 70) {
        riskScore += 20; // Medium level
    } else if (effectivePercentage >= 50) {
        riskScore += 10; // Moderate level
    }
    
    // Risk based on inflow vs outflow
    const netInflow = inflowCusecs - outflowCusecs;
    if (netInflow > 10000) {
        riskScore += 25; // Very high inflow
    } else if (netInflow > 5000) {
        riskScore += 15; // High inflow
    } else if (netInflow > 1000) {
        riskScore += 10; // Moderate inflow
    }
    
    // Additional risk if reservoir is both high and has high inflow
    if (effectivePercentage > 80 && netInflow > 5000) {
        riskScore += 20; // Compound risk
    }
    
    // Convert risk score to risk level
    if (riskScore >= 60) {
        return 'severe';
    } else if (riskScore >= 40) {
        return 'high';
    } else if (riskScore >= 20) {
        return 'medium';
    } else {
        return 'low';
    }
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

            // Use a Map to aggregate data per region
            const aggregatedRegionData = new Map<string, IMDRegionData>();

            // Process each reservoir and map to regions
            reservoirs.forEach((reservoir: ReservoirData) => {
                // Map reservoir to region using enhanced mapping
                const mappedRegion = getRegionFromReservoirName(reservoir.reservoir_name || '');
                
                if (!mappedRegion) {
                    console.log(`Could not map reservoir "${reservoir.reservoir_name}" to any region`);
                    return; // Skip this reservoir if we can't map it
                }

                // Calculate risk for this reservoir
                const reservoirRisk = calculateRiskFromReservoirData(reservoir);
                
                console.log(`Mapped reservoir "${reservoir.reservoir_name}" to region "${mappedRegion}" with risk level: ${reservoirRisk}`);

                // Get or create region entry
                let regionEntry = aggregatedRegionData.get(mappedRegion);
                if (!regionEntry) {
                    // Find the region info from our regions data
                    const regionInfo = regions.find(r => r.value === mappedRegion);
                    
                    regionEntry = {
                        state: regionInfo?.state || reservoir.state || 'Unknown',
                        district: regionInfo?.label || mappedRegion,
                        reservoirPercentage: 0,
                        inflowCusecs: 0,
                        floodRiskLevel: 'low',
                        populationAffected: 0,
                        affectedArea: 0,
                        coordinates: getCoordinatesForRegion(mappedRegion, reservoir.lat, reservoir.long),
                    };
                    aggregatedRegionData.set(mappedRegion, regionEntry);
                }

                // Update aggregated data
                const percentageFull = reservoir.percentage_full || 0;
                const inflowCusecs = reservoir.inflow_cusecs || 0;
                const currentLevel = reservoir.current_level_mcm || 0;

                // Take the maximum percentage and sum inflows
                regionEntry.reservoirPercentage = Math.max(regionEntry.reservoirPercentage, percentageFull);
                regionEntry.inflowCusecs += inflowCusecs;

                // Update risk level to the highest risk among all reservoirs in the region
                const riskLevelOrder = { 'low': 0, 'medium': 1, 'high': 2, 'severe': 3 };
                if (riskLevelOrder[reservoirRisk] > riskLevelOrder[regionEntry.floodRiskLevel]) {
                    regionEntry.floodRiskLevel = reservoirRisk;
                }

                // Update river data with the most critical reservoir
                if (!regionEntry.riverData || (currentLevel > (regionEntry.riverData.currentLevel || 0))) {
                    regionEntry.riverData = {
                        name: reservoir.reservoir_name || 'Unknown',
                        currentLevel: currentLevel,
                        dangerLevel: reservoir.full_reservoir_level || (reservoir.capacity_mcm ? reservoir.capacity_mcm * 0.95 : 800),
                        warningLevel: reservoir.full_reservoir_level ? reservoir.full_reservoir_level * 0.85 : (reservoir.capacity_mcm ? reservoir.capacity_mcm * 0.85 : 650),
                        normalLevel: reservoir.full_reservoir_level ? reservoir.full_reservoir_level * 0.5 : (reservoir.capacity_mcm ? reservoir.capacity_mcm * 0.5 : 350),
                        trend: (inflowCusecs > (reservoir.outflow_cusecs || 0)) ? 'rising' : ((reservoir.outflow_cusecs || 0) > inflowCusecs ? 'falling' : 'stable'),
                        lastUpdated: reservoir.last_updated || new Date().toISOString()
                    };
                }

                // Add warnings for severe cases
                if (regionEntry.floodRiskLevel === 'severe' && !regionEntry.activeWarnings) {
                    regionEntry.activeWarnings = [{
                        type: 'severe',
                        issuedBy: 'Reservoir Monitoring System',
                        issuedAt: new Date().toISOString(),
                        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        message: `Severe flood alert for ${regionEntry.district} due to critical reservoir levels and high inflows.`,
                        affectedAreas: regionEntry.district,
                        sourceUrl: '#'
                    }];
                }

                // Add flood predictions for high/severe risk
                if ((regionEntry.floodRiskLevel === 'high' || regionEntry.floodRiskLevel === 'severe') && !regionEntry.predictedFlood) {
                    regionEntry.predictedFlood = {
                        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        probabilityPercentage: regionEntry.floodRiskLevel === 'severe' ? 85 : 65,
                        expectedRainfall: regionEntry.floodRiskLevel === 'severe' ? 180 : 100,
                        timeframe: 'Next 72 hours'
                    };
                }
            });

            const resultData = Array.from(aggregatedRegionData.values());
            console.log('Live IMD data processed successfully. Regions with data:', resultData.length);
            console.log('Risk distribution:', resultData.reduce((acc, region) => {
                acc[region.floodRiskLevel] = (acc[region.floodRiskLevel] || 0) + 1;
                return acc;
            }, {} as Record<string, number>));
            
            return resultData;

        } catch (error) {
            console.error('Failed to fetch live IMD data from Supabase:', error);
            return [];
        }
    }
};
