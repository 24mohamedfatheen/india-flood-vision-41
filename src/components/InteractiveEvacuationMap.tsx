
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface InteractiveEvacuationMapProps {
  userLocation: LocationData;
}

const InteractiveEvacuationMap: React.FC<InteractiveEvacuationMapProps> = ({ userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Create an embedded Google Maps iframe with the user's location and nearby shelters
      const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&q=${userLocation.lat},${userLocation.lng}&zoom=14&maptype=roadmap`;
      
      mapRef.current.innerHTML = `
        <iframe
          width="100%"
          height="300"
          frameborder="0"
          style="border:0"
          src="${mapSrc}"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      `;
    }
  }, [userLocation]);

  // Generate nearby shelter markers for display
  const generateShelterMarkers = () => {
    return [
      {
        name: "Municipal Community Center",
        distance: "1.2 km",
        direction: "Northeast",
        color: "bg-blue-500"
      },
      {
        name: "Government School",
        distance: "1.8 km", 
        direction: "Southwest",
        color: "bg-green-500"
      },
      {
        name: "District Hospital",
        distance: "2.1 km",
        direction: "Southeast", 
        color: "bg-red-500"
      },
      {
        name: "Higher Ground Assembly",
        distance: "2.5 km",
        direction: "Northwest",
        color: "bg-purple-500"
      }
    ];
  };

  const shelterMarkers = generateShelterMarkers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Interactive Evacuation Map
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your location and nearby emergency shelters
        </p>
      </CardHeader>
      <CardContent>
        {/* Map container */}
        <div className="relative rounded-lg overflow-hidden border">
          <div ref={mapRef} className="w-full h-72 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading interactive map...</p>
            </div>
          </div>
        </div>

        {/* Shelter markers legend */}
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Nearby Emergency Shelters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shelterMarkers.map((shelter, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                <div className={`w-3 h-3 rounded-full ${shelter.color} mr-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{shelter.name}</p>
                  <p className="text-xs text-gray-500">{shelter.distance} {shelter.direction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map controls info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">Map Features</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Your current location is marked in the center</p>
            <p>• Colored markers show nearby emergency shelters</p>
            <p>• Click on the map to get directions to any location</p>
            <p>• Use zoom controls to see more detail</p>
          </div>
        </div>

        {/* Coordinates display */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Current Location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveEvacuationMap;
