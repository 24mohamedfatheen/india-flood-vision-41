
import React from 'react';
import { Navigation, Clock, AlertTriangle, Route, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface Shelter {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance: number;
  estimatedTime: string;
  capacity?: number;
  facilities?: string[];
}

interface EvacuationRoute {
  id: string;
  name: string;
  shelter: Shelter;
  directions: string[];
  googleMapsLink: string;
  estimatedTime: string;
  distance: string;
  hazards: string[];
  routeType: 'primary' | 'secondary';
}

interface EvacuationRouteGeneratorProps {
  userLocation: LocationData;
}

const EvacuationRouteGenerator: React.FC<EvacuationRouteGeneratorProps> = ({ userLocation }) => {
  
  // Generate shelters based on location (in a real app, this would query a database)
  const generateNearbyShelers = (location: LocationData): Shelter[] => {
    const shelters: Shelter[] = [];
    
    // Distance calculation helper
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Generate realistic shelters based on common Indian city infrastructure
    const baseShelters = [
      {
        offset: { lat: 0.02, lng: 0.01 },
        name: "Municipal Community Center",
        type: "Community Center",
        capacity: 500,
        facilities: ["Basic Medical Aid", "Clean Water", "Sanitation"]
      },
      {
        offset: { lat: -0.015, lng: 0.025 },
        name: "Government School Building",
        type: "Educational Institution",
        capacity: 300,
        facilities: ["Shelter", "Basic Supplies"]
      },
      {
        offset: { lat: 0.01, lng: -0.02 },
        name: "District Hospital",
        type: "Medical Facility",
        capacity: 200,
        facilities: ["Medical Care", "Emergency Services", "Clean Water"]
      },
      {
        offset: { lat: -0.025, lng: -0.015 },
        name: "Higher Ground Assembly Point",
        type: "Safe Zone",
        capacity: 1000,
        facilities: ["Open Space", "High Elevation"]
      }
    ];

    baseShelters.forEach((shelter, index) => {
      const shelterLat = location.lat + shelter.offset.lat;
      const shelterLng = location.lng + shelter.offset.lng;
      const distance = calculateDistance(location.lat, location.lng, shelterLat, shelterLng);
      
      shelters.push({
        id: `shelter_${index + 1}`,
        name: shelter.name,
        type: shelter.type,
        lat: shelterLat,
        lng: shelterLng,
        distance: distance,
        estimatedTime: `${Math.round(distance * 12)} minutes`, // Assuming 5 km/h walking speed
        capacity: shelter.capacity,
        facilities: shelter.facilities
      });
    });

    return shelters.sort((a, b) => a.distance - b.distance);
  };

  const generateEvacuationRoutes = (location: LocationData, shelters: Shelter[]): EvacuationRoute[] => {
    const routes: EvacuationRoute[] = [];
    
    // Primary route (closest shelter)
    if (shelters[0]) {
      const primaryShelter = shelters[0];
      routes.push({
        id: 'primary_route',
        name: `Primary Route to ${primaryShelter.name}`,
        shelter: primaryShelter,
        directions: [
          "Head towards the main road from your current location",
          `Walk ${primaryShelter.distance < 1 ? 'approximately 800 meters' : `${primaryShelter.distance.toFixed(1)} km`} towards ${primaryShelter.name}`,
          "Follow road signs for emergency shelters if available",
          "Stay on well-lit main roads when possible",
          `Arrive at ${primaryShelter.name} - look for emergency personnel`
        ],
        googleMapsLink: `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${primaryShelter.lat},${primaryShelter.lng}&travelmode=walking`,
        estimatedTime: primaryShelter.estimatedTime,
        distance: `${primaryShelter.distance.toFixed(1)} km`,
        hazards: [
          "Avoid waterlogged areas",
          "Be cautious of electrical lines and poles",
          "Stay away from construction sites"
        ],
        routeType: 'primary'
      });
    }

    // Secondary route (second closest shelter)
    if (shelters[1]) {
      const secondaryShelter = shelters[1];
      routes.push({
        id: 'secondary_route',
        name: `Secondary Route to ${secondaryShelter.name}`,
        shelter: secondaryShelter,
        directions: [
          "If primary route is blocked, use this alternative path",
          `Head ${secondaryShelter.distance < 1 ? 'approximately 1 km' : `${secondaryShelter.distance.toFixed(1)} km`} towards ${secondaryShelter.name}`,
          "Take alternative roads if main roads are congested",
          "Ask locals for directions if road signs are unclear",
          `Reach ${secondaryShelter.name} - check in with emergency coordinators`
        ],
        googleMapsLink: `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${secondaryShelter.lat},${secondaryShelter.lng}&travelmode=walking`,
        estimatedTime: secondaryShelter.estimatedTime,
        distance: `${secondaryShelter.distance.toFixed(1)} km`,
        hazards: [
          "Alternative routes may be less familiar",
          "Check for road closures",
          "Carry emergency contact numbers"
        ],
        routeType: 'secondary'
      });
    }

    return routes;
  };

  const shelters = generateNearbyShelers(userLocation);
  const routes = generateEvacuationRoutes(userLocation, shelters);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Evacuation Routes from Your Location
          </CardTitle>
          <p className="text-sm text-gray-600">
            Based on your location: {userLocation.city}, {userLocation.state}
          </p>
        </CardHeader>
        <CardContent>
          {routes.map((route, index) => (
            <div 
              key={route.id}
              className={`${index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}
            >
              <div className="flex items-start mb-4">
                <div className={`${route.routeType === 'primary' ? 'bg-blue-100' : 'bg-green-100'} rounded-full p-2 mr-3`}>
                  <Route className={`h-5 w-5 ${route.routeType === 'primary' ? 'text-blue-700' : 'text-green-700'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{route.name}</h3>
                  <div className="text-gray-500 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-3">{route.estimatedTime}</span>
                    <span>|</span>
                    <span className="mx-3">{route.distance}</span>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">Destination: {route.shelter.name}</p>
                    <p className="text-sm text-gray-600">Type: {route.shelter.type}</p>
                    {route.shelter.capacity && (
                      <p className="text-sm text-gray-600">Capacity: {route.shelter.capacity} people</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Directions */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Directions:</h4>
                <ol className="space-y-2 pl-6 list-decimal">
                  {route.directions.map((step, idx) => (
                    <li key={idx} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Hazards */}
              {route.hazards && route.hazards.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-4">
                  <h4 className="font-semibold text-yellow-800 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Potential Hazards:
                  </h4>
                  <ul className="space-y-1 pl-6 list-disc text-yellow-800">
                    {route.hazards.map((hazard, idx) => (
                      <li key={idx}>{hazard}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Shelter facilities */}
              {route.shelter.facilities && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Available Facilities:</h4>
                  <ul className="space-y-1 pl-6 list-disc text-blue-800">
                    {route.shelter.facilities.map((facility, idx) => (
                      <li key={idx}>{facility}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Google Maps link */}
              <div className="mt-4">
                <a 
                  href={route.googleMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvacuationRouteGenerator;
