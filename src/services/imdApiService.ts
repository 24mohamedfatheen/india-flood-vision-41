// src/services/imdApiService.ts

import { supabase } from '../integrations/supabase/client'; // Import Supabase client
import { regions } from '../data/floodData'; // Import regions for mapping (now dynamic)
import { ReservoirData } from './reservoirDataService'; // Import ReservoirData interface

// Types for IMD API responses (unchanged)
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
  reservoirPercentage: number;
  inflowCusecs: number;
  floodRiskLevel: 'low' | 'medium' | 'high' | 'severe';
  populationAffected: number;
  affectedArea: number;
  riverData?: IMDRiverData;
  activeWarnings?: IMDWeatherWarning[];
  predictedFlood?: {
    date: string;
    probabilityPercentage: number;
    expectedRainfall: number;
    timeframe: string;
  };
  coordinates: [number, number];
};

// Map for accurate coordinates of each city (still useful for lookup if not in CSV)
const cityCoordinates: Record<string, [number, number]> = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.7041, 77.1025],
  'Kolkata': [22.5726, 88.3639],
  'Chennai': [13.0827, 80.2707],
  'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Surat': [21.1702, 72.8311],
  'Jaipur': [26.9139, 75.8167],
  'Lucknow': [26.8467, 80.9462],
  'Kanpur': [26.4499, 80.3319],
  'Nagpur': [21.1497, 79.0806],
  'Patna': [25.5941, 85.1417],
  'Indore': [22.7167, 75.8472],
  'Kochi': [9.9312, 76.2600],
  'Guwahati': [26.1445, 91.7362],
  // New locations
  'Agra': [27.1767, 78.0078],
  'Allahabad': [25.4358, 81.8463],
  'Gorakhpur': [26.7600, 83.3731],
  'Bareilly': [28.3670, 79.4304],
  'Varanasi': [25.3176, 82.9739],
  'Gaya': [24.7978, 85.0098],
  'Purnia': [25.7877, 87.4764],
  'Motihari': [26.6575, 84.9192],
  'Dibrugarh': [27.4883, 94.9048],
  'Jorhat': [26.7441, 94.2166],
  'Kokrajhar': [26.4069, 90.2743],
  'Bhubaneswar': [20.2961, 85.8245],
  'Cuttack': [20.4630, 85.8829],
  'Balasore': [21.4939, 86.9400],
  'Vijayawada': [16.5062, 80.6480],
  'Rajahmundry': [16.9918, 81.7766],
  'Guntur': [16.3000, 80.4500],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Thrissur': [10.5276, 76.2144],
  'Kottayam': [9.5916, 76.5222],
  'Nashik': [20.0000, 73.7800],
  'Kolhapur': [16.7050, 74.2433],
  'Vadodara': [22.3072, 73.1812],
  'Rajkot': [22.2958, 70.7984],
  'Amritsar': [31.6340, 74.8723],
  'Ludhiana': [30.9010, 75.8573],
  'Jalandhar': [31.3260, 75.5762],
  'Roorkee': [29.8700, 77.8900],
  'Haridwar': [29.9457, 78.1642],
  'Shimla': [31.1048, 77.1734],
  'Bihar Sharif': [25.2000, 85.5000],
  'Bhagalpur': [25.2427, 86.9859],
  'Silchar': [24.8219, 92.7769],
  'Muzaffarpur': [26.1226, 85.3916],
  'Darbhanga': [26.1555, 85.9001],
  'Alappuzha': [9.4981, 76.3388],
  'Dehradun': [30.3165, 78.0322],
  'Srinagar': [34.0837, 74.7973]
};

// Helper to get state for region (now uses the dynamic regions array)
const getStateForRegion = (regionName: string): string => {
  const foundRegion = regions.find(r => r.value === regionName.toLowerCase());
  return foundRegion ? foundRegion.state : 'N/A';
};

// Live API service using Supabase
export const imdApiService = {
  fetchFloodData: async (): Promise<IMDRegionData[]> => {
    console.log('Fetching live data from Supabase (indian_reservoir_levels)...');

    try {
      // Fetch ALL reservoir data with limit of 10000 to ensure we get all records
      const { data: reservoirs, error } = await supabase
        .from('indian_reservoir_levels')
        .select('reservoir_name, state, district, current_level_mcm, capacity_mcm, percentage_full, inflow_cusecs, outflow_cusecs, last_updated, lat, long')
        .limit(10000);

      if (error) {
        console.error('Error fetching reservoir data from Supabase:', error);
        return []; // Return empty array on error
      }

      if (!reservoirs || reservoirs.length === 0) {
        console.warn('No reservoir data found in Supabase.');
        return []; // Return empty array if no data
      }

      console.log(`Successfully fetched ${reservoirs.length} reservoir records from Supabase.`);

      // Process reservoir data to fit IMDRegionData structure
      const regionDataMap = new Map<string, IMDRegionData>();

      // Initialize regionDataMap with all regions to ensure all are present
      regions.forEach(region => {
        const defaultCoordinates: [number, number] = region.coordinates && region.coordinates.length >= 2 
          ? [region.coordinates[0], region.coordinates[1]] as [number, number]
          : cityCoordinates[region.label] || [0, 0];
        regionDataMap.set(region.label.toLowerCase(), {
          state: region.state,
          district: region.label,
          reservoirPercentage: 0, 
          inflowCusecs: 0,        
          floodRiskLevel: 'low', 
          populationAffected: 0,
          affectedArea: 0,
          coordinates: defaultCoordinates,
        });
      });

      // Initialize 'unknown' region to catch unmapped data
      if (!regionDataMap.has('unknown')) {
        regionDataMap.set('unknown', {
          state: 'N/A',
          district: 'unknown',
          reservoirPercentage: 0,
          inflowCusecs: 0,
          floodRiskLevel: 'low',
          populationAffected: 0,
          affectedArea: 0,
          coordinates: [20.5937, 78.9629], // Fixed coordinate as specified
        });
      }

      reservoirs.forEach((res: ReservoirData) => {
        let regionName: string = 'unknown'; // Default to unknown
        let matchedRegion = false;

        // Robust & Non-Random Region Mapping
        // 1. Try to match by district name first (case-insensitive, trimmed)
        if (res.district) {
          const trimmedDistrict = res.district.trim();
          const potentialRegion = regions.find(r => 
            r.label.toLowerCase() === trimmedDistrict.toLowerCase()
          );
          if (potentialRegion) {
            regionName = potentialRegion.label;
            matchedRegion = true;
          }
        }
        
        // 2. If no district match, try to match by state (case-insensitive, trimmed)
        if (!matchedRegion && res.state) {
          const trimmedState = res.state.trim();
          const potentialRegion = regions.find(r => 
            r.state.toLowerCase() === trimmedState.toLowerCase()
          );
          if (potentialRegion) {
            regionName = potentialRegion.label;
            matchedRegion = true;
          }
        }
        
        // 3. Only if NO district or state match: Assign to unknown
        const lowerRegionName = regionName.toLowerCase();

        // Get or create IMDRegionData for this region
        let regionEntry = regionDataMap.get(lowerRegionName);
        if (!regionEntry) {
          // This should ideally not happen if 'regions' contains all relevant cities and 'unknown' is initialized.
          const fallbackCoordinates: [number, number] = cityCoordinates[regionName] || [res.lat || 0, res.long || 0];
          regionEntry = {
            state: getStateForRegion(regionName), 
            district: regionName,
            reservoirPercentage: 0,
            inflowCusecs: 0,
            floodRiskLevel: 'low',
            populationAffected: 0,
            affectedArea: 0,
            coordinates: fallbackCoordinates,
          };
          regionDataMap.set(lowerRegionName, regionEntry);
        }

        // Updated risk thresholds based on actual data values shown in the image
        // The data shows values like 623.28, 747.7, 422.76, etc. which are much higher than previous thresholds
        const rawPercentageFull = res.percentage_full;
        const percentageFull = Math.min(100, Math.max(0, parseFloat(String(rawPercentageFull)) || 0));
        
        const inflowCusecs = res.inflow_cusecs || 0;
        const outflowCusecs = res.outflow_cusecs || 0;
        const currentLevel = res.current_level_mcm || 0;

        // Update region data with highest percentage and sum inflows
        if (percentageFull > regionEntry.reservoirPercentage) {
          regionEntry.reservoirPercentage = percentageFull;
        }
        regionEntry.inflowCusecs += inflowCusecs;

        // Updated Risk Level Calculation based on actual reservoir levels
        // Based on the image data showing levels in hundreds (422-747 range)
        let riskLevel: IMDRegionData['floodRiskLevel'] = 'low';
        
        // Use current level (MCM) for risk assessment as it shows actual water levels
        if (currentLevel >= 600 || regionEntry.reservoirPercentage >= 80 || regionEntry.inflowCusecs >= 5000) {
          riskLevel = 'severe';
        } else if (currentLevel >= 400 || regionEntry.reservoirPercentage >= 60 || regionEntry.inflowCusecs >= 2000) {
          riskLevel = 'high';
        } else if (currentLevel >= 200 || regionEntry.reservoirPercentage >= 40 || regionEntry.inflowCusecs >= 500) {
          riskLevel = 'medium';
        }
        
        // Update risk level if this reservoir's contribution leads to a higher risk
        const riskLevelOrder = { 'low': 0, 'medium': 1, 'high': 2, 'severe': 3 };
        if (riskLevelOrder[riskLevel] > riskLevelOrder[regionEntry.floodRiskLevel]) {
          regionEntry.floodRiskLevel = riskLevel;
        }

        // populationAffected and affectedArea remain 0 unless directly provided
        // These fields remain 0 as specified - no dummy data

        // Populate riverData if relevant
        if (res.reservoir_name) {
          if (!regionEntry.riverData || (res.current_level_mcm && res.current_level_mcm > (regionEntry.riverData.currentLevel || 0))) {
            regionEntry.riverData = {
              name: res.reservoir_name,
              currentLevel: res.current_level_mcm || 0,
              dangerLevel: res.capacity_mcm ? res.capacity_mcm * 0.95 : 800, // Updated based on data scale
              warningLevel: res.capacity_mcm ? res.capacity_mcm * 0.85 : 650, // Updated based on data scale
              normalLevel: res.capacity_mcm ? res.capacity_mcm * 0.5 : 350, // Updated based on data scale
              trend: (inflowCusecs > outflowCusecs) ? 'rising' : (outflowCusecs > inflowCusecs ? 'falling' : 'stable'),
              lastUpdated: res.last_updated || new Date().toISOString()
            };
          }
        }
      });

      const resultData = Array.from(regionDataMap.values());
      console.log('Live IMD data fetched and processed successfully:', resultData);
      return resultData;

    } catch (error) {
      console.error('Error fetching live IMD data from Supabase:', error);
      return [];
    }
  }
};
