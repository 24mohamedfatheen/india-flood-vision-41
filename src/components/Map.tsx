
import React from 'react';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// We're using lazy loading to ensure Leaflet only loads in the browser
const MapComponent = lazy(() => import('./map/Map'));

const Map: React.FC<{ 
  selectedRegion: string; 
  className?: string;
  aspectRatio?: number;
}> = ({ 
  selectedRegion, 
  className = "",
  aspectRatio = 16/9
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <AspectRatio ratio={aspectRatio} className="w-full">
        <Suspense fallback={<div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">Loading map...</div>}>
          <div className="w-full h-full">
            <MapComponent selectedRegion={selectedRegion} />
          </div>
        </Suspense>
      </AspectRatio>
      
      <div className="absolute bottom-4 right-4 z-10">
        <Link to="/evacuation-plan">
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
            <Navigation className="mr-2 h-4 w-4" />
            Emergency Evacuation Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Map;
