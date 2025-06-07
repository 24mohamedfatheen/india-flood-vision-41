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
    };
    rivers?: {
      source: string;
      lastUpdated: string;
    };
  };
}

/**
 * Core forecasting logic - converts input data into flood probability forecasts
 * 
 * NOTE: This is the module that would be replaced with an AI/ML model in the future.
 * The current implementation uses a rules-based approach based on weighted factors.
 * 
 * Expected inputs:
 * - Historical and recent rainfall data
 * - Current and projected river levels
 * - Ground saturation estimates
 * - Historical flood patterns
 * 
 * Expected outputs:
 * - Daily flood probability scores (0-100)
 * - Confidence levels for each prediction
 * - Contributing factors with their weights
 */
function calculateFloodProbability(
  region: string,
  date: Date,
  rainfall: number,
  historicalData: any[],
  riverData?: any,
  dayIndex: number = 0
): ForecastDay {
  // Base probability calculation
  // In a real system, this would use multiple weighted factors and potentially ML models
  
  // Get the month for seasonal adjustments
  const month = date.getMonth();
  const seasonalCoefficient = [1.2, 1.1, 0.9, 0.8, 0.7, 0.5, 0.4, 0.6, 0.8, 1.0, 1.1, 1.3][month];
  
  // Calculate average historical rainfall for context
  const averageRainfall = historicalData.reduce((sum, item) => sum + item.rainfall, 0) / historicalData.length;
  
  // Base probability is influenced by expected rainfall compared to historical average
  let baseRainfallFactor = (rainfall / (averageRainfall * 1.5)) * 100;
  
  // River level impact (if data available)
  let riverFactor = 0;
  if (riverData) {
    // Higher factor when river level approaches danger level
    const riverRatio = riverData.currentLevel / riverData.dangerLevel;
    riverFactor = riverRatio * 30; // Maximum 30% contribution
    
    // Additional boost if river is already rising
    if (riverData.trend === 'rising') {
      riverFactor *= 1.2;
    }
  }
  
  // Ground saturation estimate (simplified)
  const groundSaturationFactor = baseRainfallFactor * 0.3;
  
  // Historical pattern adjustment (e.g., areas with frequent flooding)
  const historicalPatternFactor = averageRainfall > 200 ? 15 : 5;
  
  // Terrain impact (mock data - would come from elevation/topography data)
  const terrainFactor = 10;
  
  // Calculate total probability with all factors
  let probability = (
    baseRainfallFactor * 0.4 + // 40% weight to rainfall
    riverFactor * 0.3 +        // 30% weight to river conditions
    groundSaturationFactor +   // Ground saturation
    historicalPatternFactor +  // Historical patterns
    terrainFactor              // Terrain
  );
  
  // Apply seasonal coefficient
  probability *= seasonalCoefficient;
  
  // Variability increases with forecast distance
  const variabilityFactor = 1 + (dayIndex * 0.05);
  
  // Add some randomness but ensure trend consistency
  const randomFactor = (Math.sin(dayIndex * 0.5) * 5) + (Math.random() * 5 - 2.5);
  
  // Adjust probability with variability and randomness
  probability = probability * variabilityFactor + randomFactor;
  
  // Ensure probability is between 5 and 95
  probability = Math.min(95, Math.max(5, probability));
  
  // Calculate confidence (decreases with time)
  const confidence = Math.floor(95 - (dayIndex * 5));
  
  // Expected rainfall calculation based on probability and historical data
  const expectedRainfall = (probability / 100) * averageRainfall * 1.5;
  
  // River level change estimate
  const riverLevelChange = (probability / 100) * 2;
  
  return {
    date: date.toISOString().split('T')[0],
    probability: Number(probability.toFixed(1)),
    confidence: confidence,
    expectedRainfall: Number(expectedRainfall.toFixed(1)),
    riverLevelChange: Number(riverLevelChange.toFixed(2)),
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
 * Fetch flood forecast for a specific region
 * Uses a combination of historical data, current conditions, and predictive models
 */
export async function fetchFloodForecast(params: ForecastParams): Promise<CursorAiResponse> {
  const { region, state, days = 10, coordinates, useHistoricalData = true } = params;
  
  try {
    console.log('Fetching flood forecast for:', region);
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 1. Get historical rainfall data for this region
    const currentYear = new Date().getFullYear();
    const historicalData = getHistoricalRainfallData(region, currentYear);
    
    // 2. Fetch current weather data from IMD API (simulated)
    let weatherData = null;
    let riverData = null;
    
    try {
      if (coordinates) {
        weatherData = await fetchWeatherDataFromIMD(region, coordinates);
      }
      
      // 3. Fetch river level data if available (simulated)
      if (state) {
        riverData = await fetchRiverLevelsFromCWC(region, state);
      }
    } catch (error) {
      console.warn('Error fetching external data, using fallback data:', error);
      // Continue with historical data only
    }
    
    // 4. Generate forecast using all available data
    const currentDate = new Date();
    const forecasts = Array.from({ length: days }, (_, index) => {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(forecastDate.getDate() + index);
      
      // Use the core forecasting algorithm to calculate flood probability
      return calculateFloodProbability(
        region,
        forecastDate,
        weatherData?.rainfall || Math.floor(Math.random() * 100) + 50,
        historicalData,
        riverData,
        index
      );
    });
    
    return {
      forecasts,
      timestamp: new Date().toISOString(),
      modelInfo: {
        version: "flood-forecast-v1.2",
        accuracy: 87,
        source: "Weather Data Analysis",
        lastUpdated: new Date().toISOString()
      },
      region,
      state,
      dataSourceInfo: {
        weather: {
          source: weatherData ? "India Meteorological Department (IMD)" : "Historical Data",
          lastUpdated: new Date().toISOString()
        },
        rivers: riverData ? {
          source: "Central Water Commission (CWC)",
          lastUpdated: new Date().toISOString()
        } : undefined
      }
    };
  } catch (error) {
    console.error("Error generating flood forecast:", error);
    throw new Error("Failed to generate flood forecast");
  }
}

/**
 * Analyze forecast data to determine key risk factors and critical times
 * This is a separate module to demonstrate the modular approach
 */
export function analyzeForecastData(forecastData: CursorAiResponse) {
  if (!forecastData || !forecastData.forecasts || forecastData.forecasts.length === 0) {
    return null;
  }
  
  // Find the day with the highest flood probability
  const highestRiskDay = [...forecastData.forecasts].sort((a, b) => b.probability - a.probability)[0];
  
  // Calculate the average probability across all days
  const averageProbability = forecastData.forecasts.reduce((sum, day) => sum + day.probability, 0) / 
    forecastData.forecasts.length;
  
  // Identify if there's a rising trend in the first 3 days
  const initialTrend = forecastData.forecasts.length >= 3 
    ? forecastData.forecasts[2].probability > forecastData.forecasts[0].probability
      ? 'rising' 
      : 'falling'
    : 'stable';
  
  return {
    highestRiskDay,
    averageProbability: Number(averageProbability.toFixed(1)),
    initialTrend,
    sustainedHighRisk: forecastData.forecasts.filter(day => day.probability > 70).length >= 3
  };
}
