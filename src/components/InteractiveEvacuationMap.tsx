
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Fix Leaflet icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Create the Leaflet map
    leafletMapRef.current = L.map(mapRef.current, {
      attributionControl: true,
      zoomControl: true
    }).setView([userLocation.lat, userLocation.lng], 14);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapRef.current);

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-location-icon',
      html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(`<strong>Your Location</strong><br>${userLocation.address}`)
      .openPopup();

    // Add shelter markers
    const shelters = generateShelterMarkers();
    shelters.forEach((shelter, index) => {
      const shelterLat = userLocation.lat + (Math.random() - 0.5) * 0.02;
      const shelterLng = userLocation.lng + (Math.random() - 0.5) * 0.02;
      
      const shelterIcon = L.divIcon({
        className: 'shelter-icon',
        html: `<div style="background-color: ${shelter.color.replace('bg-', '')}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([shelterLat, shelterLng], { icon: shelterIcon })
        .addTo(leafletMapRef.current!)
        .bindPopup(`
          <strong>${shelter.name}</strong><br>
          Distance: ${shelter.distance}<br>
          Direction: ${shelter.direction}
        `);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
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
          <div ref={mapRef} className="w-full h-72 bg-gray-100"></div>
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
            <p>• Your current location is marked with a blue dot</p>
            <p>• Colored markers show nearby emergency shelters</p>
            <p>• Click on markers for more information</p>
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
