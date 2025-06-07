
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Shield, AlertTriangle, MapPin, Navigation, Phone, Clock, Route, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const EvacuationPlan = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedDistrict, setDetectedDistrict] = useState<string>('');

  // Safe locations by district/region
  const safeLocationsByDistrict: { [key: string]: { name: string; lat: number; lng: number } } = {
    'mumbai': { name: 'Bandra-Kurla Complex Emergency Center', lat: 19.0596, lng: 72.8656 },
    'delhi': { name: 'Red Fort Grounds', lat: 28.6562, lng: 77.2410 },
    'chennai': { name: 'Marina Beach High Ground', lat: 13.0499, lng: 80.2824 },
    'kolkata': { name: 'Salt Lake Stadium', lat: 22.5626, lng: 88.3732 },
    'pune': { name: 'Shaniwar Wada', lat: 18.5195, lng: 73.8553 },
    'hyderabad': { name: 'Hussain Sagar Tank Bund', lat: 17.4239, lng: 78.4738 },
    'bangalore': { name: 'Cubbon Park', lat: 12.9762, lng: 77.5929 }
  };

  useEffect(() => {
    // Immediately prompt for geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Determine district based on coordinates
          detectDistrictFromCoordinates(latitude, longitude);
        },
        error => {
          console.error("Geolocation error:", error);
          setError("Unable to access your location. Please enable location services and refresh the page.");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  }, []);

  const detectDistrictFromCoordinates = (latitude: number, longitude: number) => {
    // Simple district detection based on coordinate ranges
    // In a real app, you'd use reverse geocoding API
    if (latitude >= 18.8 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.0) {
      setDetectedDistrict('mumbai');
      setLocationName('Mumbai, Maharashtra');
    } else if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.5) {
      setDetectedDistrict('delhi');
      setLocationName('Delhi');
    } else if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 80.1 && longitude <= 80.3) {
      setDetectedDistrict('chennai');
      setLocationName('Chennai, Tamil Nadu');
    } else if (latitude >= 22.4 && latitude <= 22.7 && longitude >= 88.2 && longitude <= 88.5) {
      setDetectedDistrict('kolkata');
      setLocationName('Kolkata, West Bengal');
    } else {
      // Default to nearest major city
      setDetectedDistrict('mumbai');
      setLocationName('Unknown Location (using Mumbai as fallback)');
    }
    
    setIsLoading(false);
  };

  const generateEvacuationPlan = () => {
    const safeLocation = safeLocationsByDistrict[detectedDistrict] || safeLocationsByDistrict['mumbai'];
    
    return {
      safeLocation,
      estimatedTime: "15-30 minutes",
      distance: "2-5 km",
      routes: [
        {
          name: "Primary Route",
          steps: [
            "Head to the nearest main road",
            "Follow signs to city center/government buildings",
            `Navigate to ${safeLocation.name}`,
            "Look for emergency personnel and follow their instructions"
          ]
        }
      ]
    };
  };

  const evacPlan = userLocation ? generateEvacuationPlan() : null;

  const generateGoogleMapsUrl = () => {
    if (!userLocation || !evacPlan) return '';
    
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${evacPlan.safeLocation.lat},${evacPlan.safeLocation.lng}&travelmode=driving`;
  };

  // Emergency contacts
  const emergencyContacts = [
    { name: "National Emergency Helpline", phone: "112" },
    { name: "Disaster Management", phone: "1078" },
    { name: "Police", phone: "100" },
    { name: "Fire Department", phone: "101" },
    { name: "Ambulance", phone: "108" }
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
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Detecting your location...</p>
            <p className="text-sm text-muted-foreground mt-2">Please allow location access when prompted</p>
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
                <h3 className="text-red-800 font-medium">Location Access Required</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => window.location.reload()}>
            <Navigation className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
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
            <div className="bg-red-100 p-3 px-4 rounded-full flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-700">Location Detected - Plan Generated</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Evacuation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Evacuation Route */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-700 text-white p-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Your Evacuation Route
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Route className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Route to Safety</h3>
                    <div className="text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-3">{evacPlan?.estimatedTime}</span>
                      <span>|</span>
                      <span className="mx-3">{evacPlan?.distance}</span>
                    </div>
                    <p className="font-medium mt-1">
                      Destination: {evacPlan?.safeLocation.name}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Directions:</h4>
                  <ol className="space-y-2 pl-6 list-decimal">
                    {evacPlan?.routes[0].steps.map((step, idx) => (
                      <li key={idx} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4">
                  <a 
                    href={generateGoogleMapsUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Open Evacuation Route in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-red-600 text-white p-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contacts
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="font-medium">{contact.name}</span>
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="bg-red-100 text-red-800 py-2 px-4 rounded-full font-semibold hover:bg-red-200 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map and Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
              <div className="bg-green-600 text-white p-4">
                <h2 className="text-lg font-semibold">Location & Route</h2>
              </div>
              <div className="p-4">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-800 mb-2">Your Current Location</h3>
                  <p className="text-sm text-green-700">
                    Lat: {userLocation?.lat.toFixed(4)}<br/>
                    Lng: {userLocation?.lng.toFixed(4)}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Safe Destination</h3>
                  <p className="text-sm text-blue-700 font-medium">
                    {evacPlan?.safeLocation.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    A secure location with emergency services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Print Evacuation Plan
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="lg"
          >
            Update Location
          </Button>
          <a 
            href={generateGoogleMapsUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
          >
            <Button className="bg-green-600 hover:bg-green-700" size="lg">
              <Navigation className="h-4 w-4 mr-2" />
              Navigate Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EvacuationPlan;
