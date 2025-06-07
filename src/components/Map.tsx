
import React, { useState } from 'react';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import ErrorBoundary from './ErrorBoundary';

const MapComponent = lazy(() => 
  import('./map/Map').catch(error => {
    console.error('Failed to load Map component:', error);
    return { default: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">Map failed to load</div> };
  })
);

const Map: React.FC<{ 
  selectedRegion: string; 
  className?: string;
  aspectRatio?: number;
}> = ({ 
  selectedRegion, 
  className = "",
  aspectRatio = 16/9
}) => {
  const [mapError, setMapError] = useState(false);

  console.log('Map component rendering for region:', selectedRegion);

  if (mapError) {
    return (
      <div className={`relative w-full ${className}`}>
        <AspectRatio ratio={aspectRatio} className="w-full">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Map failed to load</p>
              <Button 
                onClick={() => setMapError(false)} 
                variant="outline" 
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <AspectRatio ratio={aspectRatio} className="w-full">
        <ErrorBoundary
          fallback={
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Map error occurred</p>
                <Button 
                  onClick={() => setMapError(true)} 
                  variant="outline" 
                  size="sm"
                >
                  Reload
                </Button>
              </div>
            </div>
          }
        >
          <Suspense fallback={
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading map...</span>
            </div>
          }>
            <div className="w-full h-full">
              <MapComponent selectedRegion={selectedRegion} />
            </div>
          </Suspense>
        </ErrorBoundary>
      </AspectRatio>
      
      <div className="absolute bottom-4 right-4 z-10">
        <Link to="/evacuation-plan">
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
            <Navigation className="mr-2 h-4 w-4" />
            Emergency Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Map;
