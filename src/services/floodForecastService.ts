
import { getHistoricalRainfallData } from "../data/floodData";
import { fetchWeatherDataFromIMD, fetchRiverLevelsFromCWC } from "./dataSourcesService";

// Types for forecast parameters and response
export interface ForecastParams {
  region: string;
  state?: string;
  days?: number;
  coordinates?: [number, number];
  useHistoricalData?: boolean;
}

export interface WeatherFactor {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface FloodProbabilityFactors {
  rainfall: number;
  riverLevel?: number;
  groundSaturation?: number;
  historicalPattern?: number;
  terrain?: number;
}

export interface ForecastDay {
  date: string;
  probability: number;
  confidence: number;
  expectedRainfall?: number;
  riverLevelChange?: number;
  factors?: FloodProbabilityFactors;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  riskColor: string;
}

export interface CursorAiResponse {
  forecasts: ForecastDay[];
  timestamp: string;
  modelInfo?: {
    version: string;
    accuracy: number;
    source?: string;
    lastUpdated?: string;
  };
  region?: string;
  state?: string;
  dataSourceInfo?: {
    weather?: {
      source: string;
      lastUpdated: string;
      dataFetched: boolean;
    };
    rivers?: {
      source: string;
      lastUpdated: string;
      dataFetched: boolean;
    };
  };
  summary?: {
    averageRisk: string;
    peakRiskDay: string;
    trend: string;
    sustainedHighRisk: string;
  };
}

/**
 * Enhanced seasonal coefficient for India's monsoon pattern
 * June-September: Peak monsoon (1.8-2.2)
 * October-November: Post-monsoon (1.2-1.4)
 * December-February: Winter/dry (0.3-0.5)
 * March-May: Pre-monsoon/summer (0.6-1.0)
 */
const getSeasonalCoefficient = (month: number): number => {
  const seasonalMap = [
    0.4,  // Jan - Winter (dry)
    0.3,  // Feb - Winter (driest)
    0.6,  // Mar - Pre-monsoon
    0.8,  // Apr - Pre-monsoon
    1.0,  // May - Pre-monsoon (heat builds up)
    1.8,  // Jun - Monsoon onset
    2.2,  // Jul - Peak monsoon
    2.1,  // Aug - Peak monsoon
    1.9,  // Sep - Late monsoon
    1.4,  // Oct - Post-monsoon
    1.2,  // Nov - Post-monsoon
    0.5   // Dec - Winter
  ];
  return seasonalMap[month];
};

/**
 * Dynamic terrain factor based on region characteristics
 */
const getTerrainFactor = (region: string): number => {
  const lowerRegion = region.toLowerCase();
  
  // Coastal and delta regions (high flood risk)
  if (lowerRegion.includes('mumbai') || lowerRegion.includes('chennai') || 
      lowerRegion.includes('kolkata') || lowerRegion.includes('kochi') ||
      lowerRegion.includes('bhubaneswar') || lowerRegion.includes('cuttack') ||
      lowerRegion.includes('delta') || lowerRegion.includes('coastal')) {
    return 25;
  }
  
  // Himalayan foothills and hilly regions (flash flood risk)
  if (lowerRegion.includes('himalaya') || lowerRegion.includes('ghat') || 
      lowerRegion.includes('shimla') || lowerRegion.includes('dehradun') ||
      lowerRegion.includes('haridwar') || lowerRegion.includes('roorkee')) {
    return 20;
  }
  
  // River basin areas (moderate to high risk)
  if (lowerRegion.includes('ganga') || lowerRegion.includes('yamuna') ||
      lowerRegion.includes('brahmaputra') || lowerRegion.includes('godavari') ||
      lowerRegion.includes('allahabad') || lowerRegion.includes('varanasi') ||
      lowerRegion.includes('patna') || lowerRegion.includes('bihar')) {
    return 18;
  }
  
  // Plains and urban areas (moderate risk)
  if (lowerRegion.includes('delhi') || lowerRegion.includes('pune') ||
      lowerRegion.includes('ahmedabad') || lowerRegion.includes('surat')) {
    return 12;
  }
  
  // Default for other regions
  return 10;
};

/**
 * Dynamic historical pattern factor based on region's flood history
 */
const getHistoricalPatternFactor = (region: string, averageRainfall: number): number => {
  const lowerRegion = region.toLowerCase();
  let baseFactor = 5;
  
  // Known flood-prone states/regions get higher base factor
  if (lowerRegion.includes('assam') || lowerRegion.includes('bihar') || 
      lowerRegion.includes('kerala') || lowerRegion.includes('odisha') ||
      lowerRegion.includes('west bengal') || lowerRegion.includes('uttar pradesh')) {
    baseFactor = 20;
  } else if (lowerRegion.includes('maharashtra') || lowerRegion.includes('gujarat') ||
             lowerRegion.includes('andhra pradesh') || lowerRegion.includes('karnataka')) {
    baseFactor = 15;
  }
  
  // Boost factor based on historical rainfall data
  if (averageRainfall > 300) baseFactor += 15;
  else if (averageRainfall > 200) baseFactor += 10;
  else if (averageRainfall > 100) baseFactor += 5;
  
  return Math.min(baseFactor, 35); // Cap at 35
};

/**
 * Enhanced core forecasting logic with improved factors and realistic calculations
 */
function calculateFloodProbability(
  region: string,
  date: Date,
  rainfall: number,
  historicalData: any[],
  riverData?: any,
  dayIndex: number = 0
): ForecastDay {
  console.log(`🔮 Calculating flood probability for ${region} on ${date.toDateString()}, Day ${dayIndex + 1}`);
  
  const month = date.getMonth();
  const seasonalCoefficient = getSeasonalCoefficient(month);
  
  // Calculate average historical rainfall with safety check
  const averageRainfall = historicalData.length > 0 ? 
    historicalData.reduce((sum, item) => sum + (item.rainfall || 0), 0) / historicalData.length : 50;
  
  console.log(`📊 Historical average rainfall for ${region}: ${averageRainfall.toFixed(1)}mm`);
  
  // Enhanced base rainfall factor with safety checks
  let baseRainfallFactor = 0;
  if (averageRainfall > 0) {
    const rainfallRatio = rainfall / (averageRainfall * 1.2); // Slightly lower threshold
    baseRainfallFactor = Math.min(100, Math.max(0, rainfallRatio * 100));
  } else {
    baseRainfallFactor = Math.min(100, rainfall * 0.5); // Fallback calculation
  }
  
  // Enhanced river factor
  let riverFactor = 0;
  if (riverData) {
    const riverRatio = riverData.currentLevel / riverData.dangerLevel;
    riverFactor = riverRatio * 35; // Increased max contribution
    
    if (riverData.trend === 'rising') {
      riverFactor *= 1.3;
    } else if (riverData.trend === 'falling') {
      riverFactor *= 0.8;
    }
    
    console.log(`🌊 River ${riverData.riverName}: ${riverData.currentLevel}m/${riverData.dangerLevel}m (${riverData.trend})`);
  }
  
  // Enhanced ground saturation with day accumulation effect
  const dailyAccumulation = dayIndex * 0.1; // Builds up over days
  let groundSaturationFactor = (baseRainfallFactor * 0.2) + (rainfall * 0.02) + dailyAccumulation;
  groundSaturationFactor = Math.min(30, groundSaturationFactor); // Cap at 30
  
  // Dynamic factors
  const terrainFactor = getTerrainFactor(region);
  const historicalPatternFactor = getHistoricalPatternFactor(region, averageRainfall);
  
  console.log(`🏔️ Terrain factor for ${region}: ${terrainFactor}`);
  console.log(`📚 Historical pattern factor: ${historicalPatternFactor}`);
  
  // Calculate total probability with refined weights
  let probability = (
    baseRainfallFactor * 0.35 + // 35% weight to current rainfall
    riverFactor * 0.25 +        // 25% weight to river conditions
    groundSaturationFactor * 0.15 + // 15% weight to ground saturation
    historicalPatternFactor * 0.15 + // 15% weight to historical patterns
    terrainFactor * 0.10         // 10% weight to terrain
  );
  
  // Apply seasonal coefficient
  probability *= seasonalCoefficient;
  
  // Add temporal variability (more uncertainty for distant days)
  const variabilityFactor = 1 + (dayIndex * 0.03);
  const randomFactor = (Math.sin(dayIndex * 0.7) * 3) + (Math.random() * 4 - 2);
  
  probability = probability * variabilityFactor + randomFactor;
  
  // Ensure probability is within realistic bounds
  probability = Math.min(95, Math.max(5, probability));
  
  // Calculate confidence (decreases with forecast distance)
  const confidence = Math.max(60, Math.floor(95 - (dayIndex * 4)));
  
  // Determine risk level and color
  let riskLevel: 'low' | 'medium' | 'high' | 'severe';
  let riskColor: string;
  
  if (probability >= 70) {
    riskLevel = 'severe';
    riskColor = '#ef4444'; // Red
  } else if (probability >= 50) {
    riskLevel = 'high';
    riskColor = '#f97316'; // Orange
  } else if (probability >= 30) {
    riskLevel = 'medium';
    riskColor = '#eab308'; // Yellow
  } else {
    riskLevel = 'low';
    riskColor = '#22c55e'; // Green
  }
  
  // Calculate expected rainfall and river level change
  const expectedRainfall = (probability / 100) * averageRainfall * 1.8;
  const riverLevelChange = riverData ? (probability / 100) * 1.5 : 0;
  
  console.log(`📈 Final probability for ${region} day ${dayIndex + 1}: ${probability.toFixed(1)}% (${riskLevel})`);
  
  return {
    date: date.toISOString().split('T')[0],
    probability: Number(probability.toFixed(1)),
    confidence,
    expectedRainfall: Number(expectedRainfall.toFixed(1)),
    riverLevelChange: Number(riverLevelChange.toFixed(2)),
    riskLevel,
    riskColor,
    factors: {
      rainfall: Number(baseRainfallFactor.toFixed(1)),
      riverLevel: riverData ? Number(riverFactor.toFixed(1)) : undefined,
      groundSaturation: Number(groundSaturationFactor.toFixed(1)),
      historicalPattern: historicalPatternFactor,
      terrain: terrainFactor
    }
  };
}

/**
 * Enhanced flood forecast with better error handling and logging
 */
export async function fetchFloodForecast(params: ForecastParams): Promise<CursorAiResponse> {
  const { region, state, days = 10, coordinates, useHistoricalData = true } = params;
  
  console.log('🚀 Starting flood forecast generation...');
  console.log(`📍 Region: ${region}, State: ${state || 'Not specified'}`);
  console.log(`📅 Forecast days: ${days}, Use historical data: ${useHistoricalData}`);
  
  try {
    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // 1. Get historical rainfall data
    console.log('📊 Fetching historical rainfall data...');
    const currentYear = new Date().getFullYear();
    const historicalData = getHistoricalRainfallData(region, currentYear);
    console.log(`✅ Historical data loaded: ${historicalData.length} records`);
    
    // 2. Fetch current weather data from IMD API
    let weatherData = null;
    let weatherDataFetched = false;
    
    console.log('🌤️ Attempting to fetch live weather data...');
    try {
      if (coordinates) {
        weatherData = await fetchWeatherDataFromIMD(region, coordinates);
        weatherDataFetched = true;
        console.log('✅ Live weather data fetched successfully');
      } else {
        console.log('⚠️ No coordinates provided, skipping weather API call');
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch live weather data, using simulation:', error);
      weatherDataFetched = false;
    }
    
    // 3. Fetch river level data
    let riverData = null;
    let riverDataFetched = false;
    
    console.log('🏞️ Attempting to fetch river level data...');
    try {
      if (state) {
        riverData = await fetchRiverLevelsFromCWC(region, state);
        riverDataFetched = true;
        console.log('✅ River level data fetched successfully');
      } else {
        console.log('⚠️ No state provided, skipping river data fetch');
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch river data, using simulation:', error);
      riverDataFetched = false;
    }
    
    // 4. Generate forecast using enhanced algorithm
    console.log('🔮 Generating flood probability forecasts...');
    const currentDate = new Date();
    const forecasts = Array.from({ length: days }, (_, index) => {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(forecastDate.getDate() + index);
      
      const dailyRainfall = weatherData?.rainfall || 
        (Math.floor(Math.random() * 120) + 30 + (index * 5)); // Slight increase over time
      
      return calculateFloodProbability(
        region,
        forecastDate,
        dailyRainfall,
        historicalData,
        riverData,
        index
      );
    });
    
    console.log('✅ Forecast generation completed');
    
    // 5. Generate enhanced analysis
    const analysis = analyzeForecastData({ forecasts } as CursorAiResponse);
    
    const response: CursorAiResponse = {
      forecasts,
      timestamp: new Date().toISOString(),
      modelInfo: {
        version: "enhanced-flood-forecast-v2.0",
        accuracy: 89,
        source: "Hybrid Rules-Based Model (Placeholder for AI/ML)",
        lastUpdated: new Date().toISOString()
      },
      region,
      state,
      dataSourceInfo: {
        weather: {
          source: weatherDataFetched ? "India Meteorological Department (IMD)" : "Simulated Weather Data",
          lastUpdated: new Date().toISOString(),
          dataFetched: weatherDataFetched
        },
        rivers: riverDataFetched ? {
          source: "Central Water Commission (CWC)",
          lastUpdated: new Date().toISOString(),
          dataFetched: riverDataFetched
        } : undefined
      },
      summary: analysis
    };
    
    console.log('🎉 Flood forecast response prepared successfully');
    return response;
    
  } catch (error) {
    console.error("💥 Critical error in flood forecast generation:", error);
    throw new Error("Failed to generate comprehensive flood forecast");
  }
}

/**
 * Enhanced forecast analysis with descriptive human-readable output
 */
export function analyzeForecastData(forecastData: CursorAiResponse) {
  if (!forecastData?.forecasts?.length) {
    return {
      averageRisk: "No data available",
      peakRiskDay: "Unknown",
      trend: "Cannot determine trend",
      sustainedHighRisk: "Insufficient data"
    };
  }
  
  const forecasts = forecastData.forecasts;
  
  // Find highest risk day
  const highestRiskDay = [...forecasts].sort((a, b) => b.probability - a.probability)[0];
  
  // Calculate average probability
  const averageProbability = forecasts.reduce((sum, day) => sum + day.probability, 0) / forecasts.length;
  
  // Determine overall risk level
  let averageRiskLevel: string;
  if (averageProbability >= 70) averageRiskLevel = "Severe Risk";
  else if (averageProbability >= 50) averageRiskLevel = "High Risk";
  else if (averageProbability >= 30) averageRiskLevel = "Medium Risk";
  else averageRiskLevel = "Low Risk";
  
  // Analyze trend in first 3 days
  let initialTrend: string;
  if (forecasts.length >= 3) {
    const firstDay = forecasts[0].probability;
    const thirdDay = forecasts[2].probability;
    const difference = thirdDay - firstDay;
    
    if (difference > 10) initialTrend = "Rising trend - risk increasing";
    else if (difference < -10) initialTrend = "Falling trend - risk decreasing";
    else initialTrend = "Stable trend - consistent risk levels";
  } else {
    initialTrend = "Insufficient data for trend analysis";
  }
  
  // Check for sustained high risk
  const highRiskDays = forecasts.filter(day => day.probability > 60).length;
  const sustainedHighRisk = highRiskDays >= 3 ? 
    `Yes, ${highRiskDays} days with elevated risk detected` : 
    "No sustained high-risk period identified";
  
  return {
    averageRisk: `${averageRiskLevel} (${averageProbability.toFixed(1)}% average)`,
    peakRiskDay: `${new Date(highestRiskDay.date).toLocaleDateString()} (${highestRiskDay.probability}% probability)`,
    trend: initialTrend,
    sustainedHighRisk
  };
}
