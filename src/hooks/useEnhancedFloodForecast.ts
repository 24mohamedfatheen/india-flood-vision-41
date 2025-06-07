
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { fetchEnhancedFloodForecast, EnhancedForecastParams, EnhancedForecastResponse } from '../services/enhancedFloodForecastService';

interface UseEnhancedFloodForecastOptions {
  region: string;
  state?: string;
  district?: string;
  coordinates?: [number, number];
  enabled?: boolean;
}

export function useEnhancedFloodForecast({
  region,
  state,
  district,
  coordinates,
  enabled = true
}: UseEnhancedFloodForecastOptions) {
  const [data, setData] = useState<EnhancedForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchForecast = useCallback(async () => {
    if (!enabled || !region) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: EnhancedForecastParams = {
        region,
        state,
        district,
        coordinates,
        days: 10
      };

      console.log('🔮 Fetching enhanced forecast with params:', params);
      const response = await fetchEnhancedFloodForecast(params);
      
      setData(response);
      
      toast({
        title: "Forecast Updated",
        description: `Enhanced forecast loaded for ${district || state || region}`,
        variant: "default"
      });
    } catch (err) {
      console.error('❌ Error fetching enhanced forecast:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch forecast'));
      toast({
        title: "Forecast Error",
        description: "Could not load enhanced forecast data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [region, state, district, coordinates, enabled, toast]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchForecast
  };
}
