
import React, { useState } from 'react';
import { Shield, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import LocationDetection from '@/components/LocationDetection';
import EvacuationRouteGenerator from '@/components/EvacuationRouteGenerator';
import LocalEmergencyContacts from '@/components/LocalEmergencyContacts';
import InteractiveEvacuationMap from '@/components/InteractiveEvacuationMap';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

const EvacuationPlan = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationDetected = (location: LocationData) => {
    console.log('Location detected:', location);
    
    // Check if location is in India
    if (location.country.toLowerCase() !== 'india' && location.country.toLowerCase() !== 'भारत') {
      setError(`This service is currently only available for locations within India. Your detected location: ${location.country}`);
      return;
    }
    
    setUserLocation(location);
    setError(null);
  };

  const handleLocationError = (errorMessage: string) => {
    setError(errorMessage);
    setUserLocation(null);
  };

  // Essential items - constant regardless of location
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

  if (!userLocation && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Emergency Evacuation Plan</h1>
                <p className="text-gray-600 mt-1">Generating personalized evacuation plan...</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <LocationDetection 
              onLocationDetected={handleLocationDetected}
              onError={handleLocationError}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold">Emergency Evacuation Plan</h1>
            </div>
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
          
          <div className="flex justify-center">
            <LocationDetection 
              onLocationDetected={handleLocationDetected}
              onError={handleLocationError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Emergency Evacuation Plan</h1>
                <div className="text-gray-600 mt-1">
                  <p>📍 {userLocation!.address}</p>
                  <p className="text-sm">Generated for: {userLocation!.city}, {userLocation!.state}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-100 p-2 px-4 rounded-full flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-700">Emergency Plan - For Immediate Use</span>
            </div>
          </div>
        </div>

        {/* Main content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column (2/3 width) - Evacuation routes and instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dynamic evacuation routes */}
            <EvacuationRouteGenerator userLocation={userLocation!} />

            {/* If unable to evacuate */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
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

            {/* Local Emergency Contacts */}
            <LocalEmergencyContacts userLocation={userLocation!} />
          </div>

          {/* Right column (1/3 width) - Map and notes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interactive Map */}
            <InteractiveEvacuationMap userLocation={userLocation!} />

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
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
                  <span>This plan is based on your current location and may change based on flood conditions.</span>
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

        {/* Action buttons */}
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
            Update Location
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-gray-500 text-sm mb-6">
          <p>This evacuation plan was generated based on your current location and may not reflect real-time flood conditions.</p>
          <p>Always follow instructions from local authorities and emergency services.</p>
        </div>
      </div>
    </div>
  );
};

export default EvacuationPlan;
