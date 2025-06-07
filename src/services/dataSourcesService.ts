/**
 * Enhanced Data Sources Service with more realistic data generation
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
 * Enhanced weather data with region-specific realistic values
 */
export async function fetchWeatherDataFromIMD(
  region: string, 
  coordinates: [number, number]
): Promise<IMDWeatherResponse> {
  try {
    console.log(`🌤️ Fetching enhanced weather data for ${region} at [${coordinates[0]}, ${coordinates[1]}]`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const [lat, lon] = coordinates;
    const lowerRegion = region.toLowerCase();
    
    // Region-specific rainfall patterns
    let baseRainfall: number;
    if (lowerRegion.includes('mumbai') || lowerRegion.includes('kerala') || lowerRegion.includes('assam')) {
      // High rainfall regions
      baseRainfall = Math.floor(Math.random() * 200) + 150;
    } else if (lowerRegion.includes('chennai') || lowerRegion.includes('kolkata') || 
        lowerRegion.includes('odisha')) {
      // Moderate-high rainfall regions
      baseRainfall = Math.floor(Math.random() * 150) + 100;
    } else if (lowerRegion.includes('delhi') || lowerRegion.includes('bihar') || 
        lowerRegion.includes('uttar pradesh')) {
      // Moderate rainfall regions
      baseRainfall = Math.floor(Math.random() * 100) + 60;
    } else if (lowerRegion.includes('rajasthan') || lowerRegion.includes('gujarat')) {
      // Lower rainfall regions
      baseRainfall = Math.floor(Math.random() * 60) + 20;
    } else {
      // Default calculation with geographic influence
      baseRainfall = Math.abs(lat - 20) < 10 ? 
        Math.floor(Math.random() * 150) + 80 : 
        Math.floor(Math.random() * 80) + 40;
    }
    
    // Temperature based on latitude and region
    let temperature: number;
    if (lowerRegion.includes('shimla') || lowerRegion.includes('srinagar') || lat > 30) {
      temperature = Math.floor(Math.random() * 15) + 15; // Hill stations: 15-30°C
    } else if (lowerRegion.includes('rajasthan') || lowerRegion.includes('delhi')) {
      temperature = Math.floor(Math.random() * 15) + 28; // Hot regions: 28-43°C
    } else {
      temperature = Math.floor(Math.random() * 12) + 24; // Most regions: 24-36°C
    }
    
    // Humidity based on coastal proximity and region
    let humidity: number;
    if (lowerRegion.includes('mumbai') || lowerRegion.includes('kolkata') || 
        lowerRegion.includes('chennai') || lowerRegion.includes('kochi')) {
      humidity = Math.floor(Math.random() * 20) + 75; // Coastal: 75-95%
    } else if (lowerRegion.includes('rajasthan') || lowerRegion.includes('delhi')) {
      humidity = Math.floor(Math.random() * 25) + 45; // Arid: 45-70%
    } else {
      humidity = Math.floor(Math.random() * 25) + 60; // Inland: 60-85%
    }
    
    // Generate realistic 7-day forecast
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Create realistic rainfall pattern with monsoon-like progression
      const seasonality = Math.sin((date.getMonth() - 5) * Math.PI / 6); // Peak in July-August
      const dayVariation = Math.sin(i * 0.8) * 40 + (Math.random() * 50 - 25);
      const rainfall = Math.max(0, Math.round(baseRainfall * (0.7 + seasonality * 0.5) + dayVariation));
      
      // Probability based on rainfall intensity
      const probability = Math.min(95, Math.max(10, rainfall * 0.6 + Math.random() * 15));
      
      return {
        date: date.toISOString().split('T')[0],
        rainfall,
        probability: Math.round(probability)
      };
    });
    
    console.log(`✅ Generated weather data: ${baseRainfall}mm rain, ${temperature}°C, ${humidity}% humidity`);
    
    return {
      rainfall: baseRainfall,
      humidity,
      temperature,
      timestamp: new Date().toISOString(),
      forecast: { nextDays }
    };
    
  } catch (error) {
    console.error('❌ Error in weather data simulation:', error);
    throw new Error('Failed to fetch weather data from IMD');
  }
}

/**
 * Enhanced river level data with realistic basin-specific values
 */
export async function fetchRiverLevelsFromCWC(
  region: string,
  state: string
): Promise<CWCRiverResponse> {
  try {
    console.log(`🏞️ Fetching enhanced river data for ${region}, ${state}`);
    
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Enhanced river mapping with major basin information
    const riverMap: Record<string, { name: string; dangerLevel: number; normalLevel: number }> = {
      'Maharashtra': { name: 'Godavari', dangerLevel: 8.5, normalLevel: 4.2 },
      'West Bengal': { name: 'Hooghly', dangerLevel: 7.8, normalLevel: 3.8 },
      'Tamil Nadu': { name: 'Cauvery', dangerLevel: 6.5, normalLevel: 3.2 },
      'Delhi': { name: 'Yamuna', dangerLevel: 7.5, normalLevel: 3.5 },
      'Karnataka': { name: 'Krishna', dangerLevel: 9.2, normalLevel: 4.8 },
      'Kerala': { name: 'Periyar', dangerLevel: 5.8, normalLevel: 2.9 },
      'Assam': { name: 'Brahmaputra', dangerLevel: 12.5, normalLevel: 6.8 },
      'Bihar': { name: 'Ganga', dangerLevel: 10.2, normalLevel: 5.1 },
      'Uttar Pradesh': { name: 'Yamuna', dangerLevel: 8.0, normalLevel: 4.0 },
      'Telangana': { name: 'Krishna', dangerLevel: 8.8, normalLevel: 4.5 },
      'Gujarat': { name: 'Sabarmati', dangerLevel: 6.2, normalLevel: 2.8 },
      'Rajasthan': { name: 'Luni', dangerLevel: 4.5, normalLevel: 2.0 },
      'Madhya Pradesh': { name: 'Narmada', dangerLevel: 7.9, normalLevel: 3.9 },
      'Odisha': { name: 'Mahanadi', dangerLevel: 8.7, normalLevel: 4.3 },
      'Andhra Pradesh': { name: 'Godavari', dangerLevel: 9.1, normalLevel: 4.6 },
      'Punjab': { name: 'Sutlej', dangerLevel: 6.8, normalLevel: 3.4 },
      'Himachal Pradesh': { name: 'Sutlej', dangerLevel: 5.9, normalLevel: 2.8 },
      'Uttarakhand': { name: 'Ganga', dangerLevel: 7.2, normalLevel: 3.6 },
      'Jammu and Kashmir': { name: 'Jhelum', dangerLevel: 6.1, normalLevel: 2.9 }
    };
    
    // Get river info or use default
    const riverInfo = riverMap[state] || { name: 'Local River', dangerLevel: 7.0, normalLevel: 3.5 };
    const { name: riverName, dangerLevel, normalLevel } = riverInfo;
    const warningLevel = normalLevel + (dangerLevel - normalLevel) * 0.7;
    
    // Generate more realistic current level based on region's flood proneness
    const lowerRegion = region.toLowerCase();
    let riskMultiplier = 0.6; // Default: 60% between normal and warning
    
    if (lowerRegion.includes('bihar') || lowerRegion.includes('assam') || 
        lowerRegion.includes('kerala') || lowerRegion.includes('odisha')) {
      riskMultiplier = 0.8; // High-risk regions: closer to warning level
    } else if (lowerRegion.includes('rajasthan') || lowerRegion.includes('gujarat')) {
      riskMultiplier = 0.4; // Lower-risk regions: closer to normal level
    }
    
    const levelRange = warningLevel - normalLevel;
    const currentLevel = normalLevel + (levelRange * riskMultiplier) + (Math.random() * 0.5 - 0.25);
    
    // Generate realistic trend with appropriate probabilities
    const trendProbabilities = [0.4, 0.3, 0.3]; // rising, stable, falling
    const randomValue = Math.random();
    let trend: 'rising' | 'falling' | 'stable';
    
    if (randomValue < trendProbabilities[0]) {
      trend = 'rising';
    } else if (randomValue < trendProbabilities[0] + trendProbabilities[1]) {
      trend = 'stable';
    } else {
      trend = 'falling';
    }
    
    // Adjust current level slightly based on trend
    let adjustedCurrentLevel = currentLevel;
    if (trend === 'rising') {
      adjustedCurrentLevel += Math.random() * 0.3;
    } else if (trend === 'falling') {
      adjustedCurrentLevel -= Math.random() * 0.2;
    }
    
    // Ensure level is within realistic bounds
    adjustedCurrentLevel = Math.max(normalLevel * 0.8, Math.min(dangerLevel * 1.1, adjustedCurrentLevel));
    
    // Generate 5-day forecast with realistic progression
    const expectedChanges = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      let dailyChange = 0;
      if (trend === 'rising') {
        dailyChange = 0.15 + (Math.random() * 0.25); // 0.15-0.40m rise per day
      } else if (trend === 'falling') {
        dailyChange = -0.10 - (Math.random() * 0.20); // 0.10-0.30m fall per day
      } else {
        dailyChange = (Math.random() * 0.15) - 0.075; // Small fluctuations
      }
      
      // Add increasing uncertainty for future days
      const uncertainty = Math.random() * 0.1 * (i + 1);
      const projectedLevel = Math.max(
        normalLevel * 0.7, 
        Math.min(
          dangerLevel * 1.2, 
          adjustedCurrentLevel + (dailyChange * (i + 1)) + uncertainty
        )
      );
      
      return {
        date: date.toISOString().split('T')[0],
        level: Number(projectedLevel.toFixed(1))
      };
    });
    
    console.log(`✅ Generated river data for ${riverName}: ${adjustedCurrentLevel.toFixed(1)}m (${trend})`);
    
    return {
      riverName,
      currentLevel: Number(adjustedCurrentLevel.toFixed(1)),
      dangerLevel,
      warningLevel: Number(warningLevel.toFixed(1)),
      normalLevel,
      trend,
      lastUpdated: new Date().toISOString(),
      forecast: { expectedChanges }
    };
    
  } catch (error) {
    console.error('❌ Error in river data simulation:', error);
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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentYear = new Date().getFullYear();
    const historicalEvents = [];
    
    for (let y = 0; y < years; y++) {
      const year = currentYear - y;
      
      if (Math.random() > 0.6) {
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        
        historicalEvents.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          severity: Math.floor(Math.random() * 5) + 1,
          affectedArea: Math.floor(Math.random() * 1000) + 50,
          casualties: Math.floor(Math.random() * 50),
          economicLoss: Math.floor(Math.random() * 1000) + 10,
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
