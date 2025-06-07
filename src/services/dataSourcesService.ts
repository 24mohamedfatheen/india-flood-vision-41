
/**
 * Data Sources Service
 * 
 * This module handles interactions with external data sources like weather APIs,
 * river monitoring systems, and historical flood databases.
 * 
 * Each function in this module abstracts the specifics of a particular data source,
 * handling authentication, request formatting, error handling, and data normalization.
 */

interface IMDWeatherResponse {
  rainfall: number;
  humidity: number;
  temperature: number;
  timestamp: string;
  forecast?: {
    nextDays: Array<{
      date: string;
      rainfall: number;
      probability: number;
    }>;
  };
}

interface CWCRiverResponse {
  riverName: string;
  currentLevel: number;
  dangerLevel: number;
  warningLevel: number;
  normalLevel: number;
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
  forecast?: {
    expectedChanges: Array<{
      date: string;
      level: number;
    }>;
  };
}

/**
 * Fetches weather data from the India Meteorological Department (IMD) API
 * 
 * API Details:
 * - Base URL: https://api.imd.gov.in (simulated)
 * - Endpoint: /weather/current
 * - Parameters: latitude, longitude, region
 * - Authentication: API Key in headers
 * - Rate Limit: 100 requests per day
 * 
 * Response Format:
 * {
 *   "rainfall": 125,
 *   "humidity": 85,
 *   "temperature": 28,
 *   "timestamp": "2025-05-19T10:30:00Z",
 *   "forecast": {
 *     "nextDays": [
 *       { "date": "2025-05-20", "rainfall": 150, "probability": 80 },
 *       ...
 *     ]
 *   }
 * }
 */
export async function fetchWeatherDataFromIMD(
  region: string, 
  coordinates: [number, number]
): Promise<IMDWeatherResponse> {
  try {
    console.log(`Fetching IMD weather data for ${region} at coordinates [${coordinates[0]}, ${coordinates[1]}]`);
    
    // In a real implementation, this would make an HTTP request to the IMD API
    // For now, we're simulating the response
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate realistic data based on region and coordinates
    const [lat, lon] = coordinates;
    
    // Use latitude to influence rainfall (higher rainfall near equator or in mountainous regions)
    // This is simplified but creates some geographic variation
    const baseRainfall = Math.abs(lat - 20) < 10 ? 
      Math.floor(Math.random() * 150) + 100 : 
      Math.floor(Math.random() * 100) + 30;
    
    // Generate next 7 days forecast with realistic patterns
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Create realistic rainfall pattern with some days higher than others
      const dayVariation = Math.sin(i * 0.9) * 50 + (Math.random() * 30);
      const rainfall = Math.max(0, Math.round(baseRainfall + dayVariation));
      
      // Calculate probability based on rainfall amount
      const probability = Math.min(95, Math.max(5, rainfall * 0.4 + Math.random() * 10));
      
      return {
        date: date.toISOString().split('T')[0],
        rainfall,
        probability: Math.round(probability)
      };
    });
    
    return {
      rainfall: baseRainfall,
      humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
      temperature: Math.floor(Math.random() * 10) + 24, // 24-34°C
      timestamp: new Date().toISOString(),
      forecast: {
        nextDays
      }
    };
  } catch (error) {
    console.error('Error fetching data from IMD API:', error);
    throw new Error('Failed to fetch weather data from IMD');
  }
}

/**
 * Fetches river level data from the Central Water Commission (CWC) API
 * 
 * API Details:
 * - Base URL: https://api.cwc.gov.in (simulated)
 * - Endpoint: /rivers/level
 * - Parameters: region, state
 * - Authentication: API Key in headers
 * - Rate Limit: 1000 requests per day
 * 
 * Response Format:
 * {
 *   "riverName": "Yamuna",
 *   "currentLevel": 5.2,
 *   "dangerLevel": 7.5,
 *   "warningLevel": 6.0,
 *   "normalLevel": 3.5,
 *   "trend": "rising",
 *   "lastUpdated": "2025-05-19T08:15:00Z",
 *   "forecast": {
 *     "expectedChanges": [
 *       { "date": "2025-05-20", "level": 5.4 },
 *       ...
 *     ]
 *   }
 * }
 */
export async function fetchRiverLevelsFromCWC(
  region: string,
  state: string
): Promise<CWCRiverResponse> {
  try {
    console.log(`Fetching CWC river data for ${region}, ${state}`);
    
    // In a real implementation, this would make an HTTP request to the CWC API
    // For now, we're simulating the response
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Map of common rivers by state
    const riverMap: Record<string, string> = {
      'Maharashtra': 'Godavari',
      'West Bengal': 'Hooghly',
      'Tamil Nadu': 'Cauvery',
      'Delhi': 'Yamuna',
      'Karnataka': 'Krishna',
      'Kerala': 'Periyar',
      'Assam': 'Brahmaputra',
      'Bihar': 'Ganga',
      'Uttar Pradesh': 'Yamuna',
      'Telangana': 'Krishna',
      'Gujarat': 'Sabarmati',
      'Rajasthan': 'Luni',
      'Madhya Pradesh': 'Narmada'
    };
    
    // Determine river name based on state
    const riverName = riverMap[state] || 'Local River';
    
    // Generate realistic river levels and trends
    // More realistic current level (between normal and danger)
    const normalLevel = 3.5;
    const warningLevel = 6.0;
    const dangerLevel = 7.5;
    
    // Current level is between normal and warning for most cases
    const currentLevel = normalLevel + 
      ((warningLevel - normalLevel) * (Math.random() * 0.8 + 0.1));
    
    // Generate trend based on region's first letter (arbitrary but consistent)
    const trendValue = region.charCodeAt(0) % 3;
    const trend = trendValue === 0 ? 'rising' : (trendValue === 1 ? 'falling' : 'stable');
    
    // Generate forecast for next 5 days
    const expectedChanges = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Calculate level change based on trend
      let levelChange = 0;
      if (trend === 'rising') {
        levelChange = 0.1 + (Math.random() * 0.3); // Rising by 0.1-0.4m per day
      } else if (trend === 'falling') {
        levelChange = -0.1 - (Math.random() * 0.2); // Falling by 0.1-0.3m per day
      } else {
        levelChange = (Math.random() * 0.2) - 0.1; // Fluctuating slightly
      }
      
      // Apply the change, with more randomness for later days
      const dayVariation = Math.random() * 0.1 * i;
      const level = Math.max(normalLevel * 0.8, 
                           Math.min(dangerLevel * 1.1, 
                                  currentLevel + (levelChange * (i + 1)) + dayVariation));
      
      return {
        date: date.toISOString().split('T')[0],
        level: Number(level.toFixed(1))
      };
    });
    
    return {
      riverName,
      currentLevel: Number(currentLevel.toFixed(1)),
      dangerLevel,
      warningLevel,
      normalLevel,
      trend,
      lastUpdated: new Date().toISOString(),
      forecast: {
        expectedChanges
      }
    };
  } catch (error) {
    console.error('Error fetching data from CWC API:', error);
    throw new Error('Failed to fetch river level data from CWC');
  }
}

/**
 * Fetches historical flood data from a government open data portal
 * This is a placeholder for a real implementation that would access historical records
 */
export async function fetchHistoricalFloodData(region: string, years: number = 10) {
  try {
    console.log(`Fetching historical flood data for ${region} over ${years} years`);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would fetch from a historical database
    // For now, generate simulated historical data
    
    const currentYear = new Date().getFullYear();
    const historicalEvents = [];
    
    // Generate some random but plausible historical flood events
    for (let y = 0; y < years; y++) {
      const year = currentYear - y;
      
      // Not every year has a flood
      if (Math.random() > 0.6) {
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        
        historicalEvents.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          severity: Math.floor(Math.random() * 5) + 1, // 1-5 severity scale
          affectedArea: Math.floor(Math.random() * 1000) + 50, // 50-1050 sq km
          casualties: Math.floor(Math.random() * 50), // 0-50 casualties
          economicLoss: Math.floor(Math.random() * 1000) + 10, // 10-1010 crore rupees
        });
      }
    }
    
    return {
      region,
      totalEvents: historicalEvents.length,
      avgEventsPerYear: historicalEvents.length / years,
      events: historicalEvents,
    };
  } catch (error) {
    console.error('Error fetching historical flood data:', error);
    throw new Error('Failed to fetch historical flood data');
  }
}
