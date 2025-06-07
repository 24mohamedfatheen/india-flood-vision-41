import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle, MapPin, Navigation, Phone, Clock, Route, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const EvacuationPlan = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInIndia, setIsInIndia] = useState<boolean | null>(null);

  useEffect(() => {
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Check if location is in India and get location name using reverse geocoding
          checkLocationAndGetName(latitude, longitude);
        },
        error => {
          console.error("Error getting location:", error);
          setError("Unable to get your current location. Please enable location services.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  }, []);

  const checkLocationAndGetName = async (latitude: number, longitude: number) => {
    try {
      // Using reverse geocoding to get location name and country
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      // For demo purposes, we'll assume the API call worked
      // In a real app, you'd need to replace YOUR_GOOGLE_MAPS_API_KEY with an actual API key
      
      // Simulate API response for demo
      // In reality, you would parse the actual response
      const isInIndia = true; // This would be determined from the actual API response
      setIsInIndia(isInIndia);
      
      // Simulate getting location name
      // For demo, we'll use a hardcoded value
      setLocationName("Mumbai, Maharashtra");
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking location:", error);
      setError("Unable to verify your location. Please try again later.");
      setIsLoading(false);
    }
  };

  // Sample evacuation routes data
  // In a real application, this would come from an API based on the user's location
  const evacuationRoutes = [
    {
      id: 1,
      name: "Primary Route to Municipal Shelter",
      destination: "Mumbai Municipal School Shelter",
      directions: [
        "Head north on current street for 200 meters",
        "Turn right onto Main Road",
        "Continue for 1.5 km until you reach the traffic signal",
        "Turn left onto Highway 66",
        "The shelter will be on your right after 800 meters"
      ],
      googleMapsLink: "https://www.google.com/maps/dir/?api=1&destination=19.0760,72.8777&travelmode=driving",
      estimatedTime: "25 minutes",
      distance: "3.2 km",
      hazards: ["Potential flooding on Main Road after heavy rain", "Construction work near the shelter entrance"]
    },
    {
      id: 2,
      name: "Secondary Route to High Ground",
      destination: "Sanjay Gandhi National Park (Higher Elevation)",
      directions: [
        "Head south on current street for 300 meters",
        "Turn right onto Bridge Road",
        "Continue straight for 2 km",
        "Take the left fork towards the hill area",
        "Continue uphill for 1.8 km to reach the safe zone"
      ],
      googleMapsLink: "https://www.google.com/maps/dir/?api=1&destination=19.2147,72.9216&travelmode=driving",
      estimatedTime: "35 minutes",
      distance: "4.5 km",
      hazards: ["Bridge Road may be congested during evacuation", "Last segment has steep incline"]
    }
  ];

  // Sample emergency contacts
  const emergencyContacts = [
    { name: "Local Disaster Management Cell", phone: "022-2266 0000" },
    { name: "Mumbai Police Control Room", phone: "100" },
    { name: "Ambulance Services", phone: "108" },
    { name: "Municipal Helpline", phone: "1916" },
    { name: "Coast Guard", phone: "1554" }
  ];

  // Sample essential items
  const essentialItems = [
    "Drinking water (at least 3 liters per person)",
    "Non-perishable food items",
    "Medications and first aid kit",
    "Important documents in waterproof container",
    "Mobile phone with charger and power bank",
    "Battery-operated torch and extra batteries",
    "Warm clothes and blankets",
    "Cash in small denominations",
    "Whistle to signal for help"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 mr-2 text-blue-600" />
            <h1 className="text-3xl font-bold">Emergency Evacuation Plan</h1>
          </div>
          <div className="text-center p-10">
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-40 w-full mx-auto mb-6" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <p className="mt-4 text-gray-600">Getting your location and generating evacuation plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 mr-2 text-blue-600" />
            <h1 className="text-3xl font-bold">Emergency Evacuation Plan</h1>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Location Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (isInIndia === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 mr-2 text-blue-600" />
            <h1 className="text-3xl font-bold">Emergency Evacuation Plan</h1>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mr-3" />
              <div>
                <h3 className="text-yellow-800 font-medium">Location Outside Service Area</h3>
                <p className="text-yellow-700">Cannot make evacuation plan: user not in India.</p>
              </div>
            </div>
          </div>
          <p className="mb-4">
            This service is currently only available for locations within India. Please contact your local emergency services for evacuation information.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Emergency Evacuation Plan</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{locationName}</span>
                </div>
              </div>
            </div>
            <div className="bg-red-100 p-2 px-4 rounded-full flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-700">Emergency Plan - For Immediate Use</span>
            </div>
          </div>
        </div>

        {/* Reorganized layout - Content on left, Map on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column (2/3 width) - Details and evacuation plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-blue-700 text-white p-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Evacuation Routes from Your Location
                </h2>
              </div>
              
              <div className="p-6">
                {evacuationRoutes.map((route, index) => (
                  <div 
                    key={route.id}
                    className={`${index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}
                  >
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <Route className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{route.name}</h3>
                        <div className="text-gray-500 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="mr-3">{route.estimatedTime}</span>
                          <span>|</span>
                          <span className="mx-3">{route.distance}</span>
                        </div>
                        <p className="font-medium mt-1">
                          Destination: {route.destination}
                        </p>
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
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
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
              </div>
            </div>

            {/* What to do if unable to evacuate */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-red-600 text-white p-4">
                <h2 className="text-xl font-semibold">If You Cannot Evacuate</h2>
              </div>
              <div className="p-6">
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-red-700" />
                    </div>
                    <span><strong>Move to higher ground:</strong> If possible, move to the highest floor or level of your building.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-red-700" />
                    </div>
                    <span><strong>Signal for help:</strong> Use bright clothing, flashlights, or whistles to signal your location to rescuers.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-red-700" />
                    </div>
                    <span><strong>Call for emergency assistance:</strong> Contact the emergency numbers listed in this plan.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-red-700" />
                    </div>
                    <span><strong>Avoid flood waters:</strong> Never attempt to walk, swim, or drive through flood waters.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight className="h-4 w-4 text-red-700" />
                    </div>
                    <span><strong>Stay informed:</strong> Keep a battery-powered radio to receive updates and instructions.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Essential Items */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-green-600 text-white p-4">
                <h2 className="text-xl font-semibold">Essential Items to Take</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {essentialItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-purple-600 text-white p-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contacts
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <li key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="font-medium">{contact.name}</span>
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full font-semibold hover:bg-purple-200 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column (1/3 width) - Map and notes */}
          <div className="lg:col-span-1">
            {/* Map Container - SMALLER SIZE AND POSITIONED ON RIGHT */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
              <div className="bg-blue-700 text-white p-4">
                <h2 className="text-lg font-semibold">Evacuation Map</h2>
              </div>
              <div className="p-4">
                <div className="relative rounded-lg overflow-hidden">
                  <AspectRatio ratio={4/3} className="h-64">
                    {/* This would be replaced with an actual Google Maps embed */}
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                      <p className="text-blue-800 px-4 text-center">
                        Map showing evacuation routes from your location
                      </p>
                    </div>
                  </AspectRatio>
                </div>
                
                <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-md font-semibold text-blue-800 mb-3">Risk Levels</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                      <span className="text-xs">Low</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1"></span>
                      <span className="text-xs">Medium</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
                      <span className="text-xs">High</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                      <span className="text-xs">Severe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mt-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">Important Notes</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="h-4 w-4 text-blue-700" />
                  </div>
                  <span>Follow official instructions from emergency services at all times.</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="h-4 w-4 text-blue-700" />
                  </div>
                  <span>This plan is based on current information and may change based on flood conditions.</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="h-4 w-4 text-blue-700" />
                  </div>
                  <span>Help others if it is safe to do so, especially elderly and disabled people.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Print and Reload buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Print Evacuation Plan
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Refresh Location
          </Button>
        </div>

        <div className="text-center text-gray-500 text-sm mb-6">
          <p>This evacuation plan was generated based on your current location and may not reflect real-time flood conditions.</p>
          <p>Always follow instructions from local authorities and emergency services.</p>
        </div>
      </div>
    </div>
  );
};

export default EvacuationPlan;
