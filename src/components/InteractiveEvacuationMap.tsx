
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  userLocation?: LocationData;
}

const InteractiveEvacuationMap: React.FC<InteractiveEvacuationMapProps> = ({ userLocation: propLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(propLocation || null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const detectLocation = () => {
    setIsDetecting(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const locationData: LocationData = {
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude}, ${longitude}`,
              city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
              state: data.address?.state || 'Unknown',
              country: data.address?.country || 'Unknown'
            };
            setCurrentLocation(locationData);
          } else {
            throw new Error('Geocoding failed');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude}, ${longitude}`,
            city: 'Unknown',
            state: 'Unknown',
            country: 'Unknown'
          });
        }
        
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    if (!currentLocation) {
      detectLocation();
      return;
    }

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
    }).setView([currentLocation.lat, currentLocation.lng], 14);

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

    L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(`<strong>Your Location</strong><br>${currentLocation.address}`)
      .openPopup();

    // Add shelter markers
    const shelters = generateShelterMarkers();
    shelters.forEach((shelter, index) => {
      const shelterLat = currentLocation.lat + (Math.random() - 0.5) * 0.02;
      const shelterLng = currentLocation.lng + (Math.random() - 0.5) * 0.02;
      
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
  }, [currentLocation]);

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

  if (!currentLocation && (isDetecting || locationError)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Interactive Evacuation Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDetecting && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Detecting your location...</span>
            </div>
          )}
          
          {locationError && (
            <div className="space-y-4">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{locationError}</span>
              </div>
              <Button onClick={detectLocation} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
        {currentLocation && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </div>
        )}

        {/* Refresh location button */}
        <div className="mt-3 text-center">
          <Button variant="outline" size="sm" onClick={detectLocation} disabled={isDetecting}>
            <MapPin className="h-3 w-3 mr-1" />
            {isDetecting ? 'Detecting...' : 'Update Location'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveEvacuationMap;
