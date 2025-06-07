import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle, MapPin, Navigation, Phone, Clock, Route, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const EvacuationPlan = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [nearestSafeLandmark, setNearestSafeLandmark] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInIndia, setIsInIndia] = useState<boolean | null>(null);

  // Safe landmarks database for different states/regions
  const safeLandmarks: Record<string, string[]> = {
    'Maharashtra': ['Sanjay Gandhi National Park', 'Mumbai University Campus', 'Shivaji Park', 'MMRDA Grounds'],
    'Tamil Nadu': ['Marina Beach Higher Ground', 'Anna University Campus', 'Guindy National Park', 'Chennai Trade Centre'],
    'Karnataka': ['Cubbon Park', 'Bangalore University', 'Lalbagh Botanical Garden', 'ISKCON Temple Complex'],
    'Delhi': ['India Gate Complex', 'Rajpath Area', 'Delhi University', 'Red Fort Area'],
    'West Bengal': ['Victoria Memorial Area', 'Maidan Ground', 'Kolkata University', 'Salt Lake Stadium'],
    'Gujarat': ['Sabarmati Riverfront', 'Gujarat University', 'Kankaria Lake Area', 'Sardar Patel Stadium'],
    'Rajasthan': ['Central Park Jaipur', 'Amber Fort Area', 'Jaipur University', 'Nahargarh Fort'],
    'Kerala': ['Marine Drive Kochi', 'Willingdon Island', 'Kochi University', 'Hill Palace Museum'],
    'Uttar Pradesh': ['Lucknow University', 'Ambedkar Park', 'Gomti Riverfront', 'La Martiniere College'],
    'Bihar': ['Patna University', 'Gandhi Maidan', 'Eco Park Patna', 'Rajendra Nagar'],
    'Madhya Pradesh': ['Lal Bagh Palace Area', 'Indore University', 'Rajwada Complex', 'Central Park Indore'],
    'Assam': ['Guwahati University', 'Kamakhya Temple Hill', 'Brahmaputra Riverfront', 'Umananda Island']
  };

  useEffect(() => {
    // Prompt for geolocation immediately when component loads
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Check if location is in India and get location details
          checkLocationAndGeneratePlan(latitude, longitude);
        },
        error => {
          console.error("Error getting location:", error);
          setError("Location access denied. Please enable location services to generate your evacuation plan.");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  }, []);

  const checkLocationAndGeneratePlan = async (latitude: number, longitude: number) => {
    try {
      // Simple India bounds check (approximate)
      const isInIndiaBounds = 
        latitude >= 6.0 && latitude <= 37.0 && 
        longitude >= 68.0 && longitude <= 97.0;
      
      setIsInIndia(isInIndiaBounds);
      
      if (!isInIndiaBounds) {
        setError("Location is outside India. This service is only available within India.");
        setIsLoading(false);
        return;
      }

      // Generate location name and safe landmark based on coordinates
      const { locationName, stateName, landmark } = generateLocationInfo(latitude, longitude);
      
      setLocationName(locationName);
      setNearestSafeLandmark(landmark);
      
      // Generate Google Maps URL
      const mapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${landmark.replace(/\s+/g, '+')}/@${latitude},${longitude},13z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x0:0x0!2m2!1d${longitude}!2d${latitude}`;
      setGoogleMapsUrl(mapsUrl);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking location:", error);
      setError("Unable to process your location. Please try again.");
      setIsLoading(false);
    }
  };

  const generateLocationInfo = (lat: number, lng: number) => {
    // Simple state detection based on coordinate ranges (approximations)
    let stateName = 'Unknown';
    let locationName = 'Unknown Location';
    
    if (lat >= 18.0 && lat <= 20.5 && lng >= 72.0 && lng <= 77.0) {
      stateName = 'Maharashtra';
      locationName = 'Mumbai/Pune Area, Maharashtra';
    } else if (lat >= 12.0 && lat <= 14.0 && lng >= 79.0 && lng <= 82.0) {
      stateName = 'Tamil Nadu';
      locationName = 'Chennai Area, Tamil Nadu';
    } else if (lat >= 12.0 && lat <= 14.0 && lng >= 74.0 && lng <= 78.0) {
      stateName = 'Karnataka';
      locationName = 'Bangalore Area, Karnataka';
    } else if (lat >= 28.0 && lat <= 29.0 && lng >= 76.0 && lng <= 78.0) {
      stateName = 'Delhi';
      locationName = 'Delhi/NCR Area';
    } else if (lat >= 22.0 && lat <= 24.0 && lng >= 87.0 && lng <= 89.0) {
      stateName = 'West Bengal';
      locationName = 'Kolkata Area, West Bengal';
    } else if (lat >= 22.0 && lat <= 24.5 && lng >= 70.0 && lng <= 74.0) {
      stateName = 'Gujarat';
      locationName = 'Ahmedabad/Surat Area, Gujarat';
    } else if (lat >= 26.0 && lat <= 28.0 && lng >= 74.0 && lng <= 76.0) {
      stateName = 'Rajasthan';
      locationName = 'Jaipur Area, Rajasthan';
    } else if (lat >= 9.0 && lat <= 11.0 && lng >= 75.0 && lng <= 77.0) {
      stateName = 'Kerala';
      locationName = 'Kochi Area, Kerala';
    } else if (lat >= 26.0 && lat <= 27.0 && lng >= 80.0 && lng <= 82.0) {
      stateName = 'Uttar Pradesh';
      locationName = 'Lucknow Area, Uttar Pradesh';
    } else if (lat >= 25.0 && lat <= 26.0 && lng >= 85.0 && lng <= 86.0) {
      stateName = 'Bihar';
      locationName = 'Patna Area, Bihar';
    } else if (lat >= 22.0 && lat <= 23.0 && lng >= 75.0 && lng <= 76.0) {
      stateName = 'Madhya Pradesh';
      locationName = 'Indore Area, Madhya Pradesh';
    } else if (lat >= 26.0 && lat <= 27.0 && lng >= 91.0 && lng <= 92.0) {
      stateName = 'Assam';
      locationName = 'Guwahati Area, Assam';
    }
    
    // Get random safe landmark for the state
    const landmarks = safeLandmarks[stateName] || ['Nearest Police Station', 'Local Government Office', 'Community Center', 'School/College Campus'];
    const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    
    return { locationName, stateName, landmark };
  };

  // Sample evacuation routes adapted to user location
  const evacuationRoutes = [
    {
      id: 1,
      name: "Primary Route to Safe Zone",
      destination: nearestSafeLandmark,
      directions: [
        "Exit your current building safely",
        "Head towards the nearest main road",
        "Follow evacuation signs if available",
        "Move to higher ground if possible",
        `Navigate to ${nearestSafeLandmark}`,
        "Wait for further instructions from authorities"
      ],
      googleMapsLink: googleMapsUrl,
      estimatedTime: "20-30 minutes",
      distance: "2-5 km",
      hazards: ["Possible road flooding", "Heavy traffic during evacuation", "Blocked routes due to water logging"]
    },
    {
      id: 2,
      name: "Alternative Route",
      destination: "Nearest Government Building/School",
      directions: [
        "If primary route is blocked, head towards local government building",
        "Stay on higher elevation roads",
        "Avoid low-lying areas and underpasses",
        "Look for community shelters",
        "Contact emergency services if needed"
      ],
      googleMapsLink: `https://www.google.com/maps/search/government+building+near+${userLocation?.lat},${userLocation?.lng}`,
      estimatedTime: "25-40 minutes",
      distance: "3-7 km",
      hazards: ["Longer route may take more time", "Possible congestion at government buildings"]
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
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
            <p className="text-gray-600">Getting your location and generating evacuation plan...</p>
            <p className="text-sm text-gray-500 mt-2">Please allow location access when prompted</p>
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
                <p className="text-yellow-700">This service is currently only available for locations within India.</p>
              </div>
            </div>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Header with detected location */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Emergency Evacuation Plan</h1>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{locationName}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-100 p-2 px-3 rounded-full flex items-center text-sm">
              <Check className="h-4 w-4 text-green-600 mr-1" />
              <span className="font-medium text-green-700">Location Detected</span>
            </div>
          </div>
        </div>

        {/* Compact layout for evacuation plan */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Main evacuation content */}
          <div className="lg:col-span-3">
            {/* Evacuation Routes */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="bg-blue-700 text-white p-3">
                <h2 className="font-semibold flex items-center">
                  <Navigation className="h-4 w-4 mr-2" />
                  Evacuation Routes from Your Location
                </h2>
              </div>
              
              <div className="p-4">
                {evacuationRoutes.map((route, index) => (
                  <div 
                    key={route.id}
                    className={`${index > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}`}
                  >
                    <div className="flex items-start mb-3">
                      <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                        <Route className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-bold">{route.name}</h3>
                        <div className="text-gray-500 flex items-center text-sm mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="mr-2">{route.estimatedTime}</span>
                          <span>|</span>
                          <span className="mx-2">{route.distance}</span>
                        </div>
                        <p className="font-medium text-sm mt-1">
                          Destination: {route.destination}
                        </p>
                      </div>
                    </div>

                    {/* Compact directions */}
                    <div className="mb-3">
                      <ol className="space-y-1 pl-4 list-decimal text-sm">
                        {route.directions.map((step, idx) => (
                          <li key={idx} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Hazards */}
                    {route.hazards && route.hazards.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 mb-3">
                        <h4 className="font-semibold text-yellow-800 flex items-center text-sm mb-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Potential Hazards:
                        </h4>
                        <ul className="space-y-1 pl-4 list-disc text-xs text-yellow-800">
                          {route.hazards.map((hazard, idx) => (
                            <li key={idx}>{hazard}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Google Maps link */}
                    <div>
                      <a 
                        href={route.googleMapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded text-sm shadow-md hover:bg-blue-700 transition-colors"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to do if unable to evacuate */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="bg-red-600 text-white p-3">
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="bg-green-600 text-white p-3">
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
              <div className="bg-purple-600 text-white p-3">
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

          {/* Sidebar with map and status */}
          <div className="lg:col-span-1">
            {/* Map placeholder */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="bg-blue-700 text-white p-3">
                <h2 className="font-semibold text-sm">Your Location</h2>
              </div>
              <div className="p-3">
                <AspectRatio ratio={1} className="bg-blue-50 rounded flex items-center justify-center">
                  <div className="text-center p-3">
                    <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-blue-800">
                      Lat: {userLocation?.lat.toFixed(4)}<br/>
                      Lng: {userLocation?.lng.toFixed(4)}
                    </p>
                  </div>
                </AspectRatio>
                
                <div className="mt-3 space-y-2">
                  <div className="bg-green-50 p-2 rounded text-xs">
                    <strong className="text-green-800">Safe Destination:</strong>
                    <br/>
                    {nearestSafeLandmark}
                  </div>
                  
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    <Navigation className="h-3 w-3 inline mr-1" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Status info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-800 text-sm mb-2">Plan Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  <span>Location detected</span>
                </div>
                <div className="flex items-center text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  <span>Routes calculated</span>
                </div>
                <div className="flex items-center text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  <span>Safe destination identified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Print Plan
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Refresh Location
          </Button>
        </div>

        {/* Footer disclaimer */}
        <div className="text-center text-gray-500 text-xs">
          <p>Plan generated based on your detected location: {locationName}</p>
          <p>Always follow instructions from local authorities and emergency services.</p>
        </div>
      </div>
    </div>
  );
};

export default EvacuationPlan;
