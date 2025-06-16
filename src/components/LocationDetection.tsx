
import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface LocationDetectionProps {
  onLocationDetected: (location: LocationData) => void;
  onError: (error: string) => void;
}

const LocationDetection: React.FC<LocationDetectionProps> = ({ onLocationDetected, onError }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData | null> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      return {
        lat,
        lng,
        address: data.display_name || `${lat}, ${lng}`,
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        state: data.address?.state || 'Unknown',
        country: data.address?.country || 'Unknown'
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        lat,
        lng,
        address: `${lat}, ${lng}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }
  };

  const geocodeAddress = async (address: string): Promise<LocationData | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Address not found');
      }
      
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
        state: result.address?.state || 'Unknown',
        country: result.address?.country || 'Unknown'
      };
    } catch (error) {
      console.error('Address geocoding failed:', error);
      return null;
    }
  };

  const detectLocation = async () => {
    setIsDetecting(true);
    
    if (!navigator.geolocation) {
      onError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      setShowManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = await reverseGeocode(latitude, longitude);
        
        if (locationData) {
          onLocationDetected(locationData);
        } else {
          onError("Unable to determine your address from coordinates");
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
        
        onError(errorMessage);
        setIsDetecting(false);
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleManualSubmit = async () => {
    if (!manualAddress.trim()) {
      onError("Please enter an address");
      return;
    }

    setIsDetecting(true);
    const locationData = await geocodeAddress(manualAddress);
    
    if (locationData) {
      onLocationDetected(locationData);
    } else {
      onError("Unable to find the address you entered. Please try a different address.");
    }
    setIsDetecting(false);
  };

  useEffect(() => {
    // Auto-detect location on component mount
    detectLocation();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Detecting Your Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDetecting && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Getting your location...</span>
          </div>
        )}
        
        {showManualInput && !isDetecting && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter your address or a nearby landmark:
            </p>
            <Input
              type="text"
              placeholder="e.g., MG Road, Bangalore or Connaught Place, Delhi"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button 
              onClick={handleManualSubmit} 
              className="w-full"
              disabled={!manualAddress.trim()}
            >
              Generate Evacuation Plan
            </Button>
          </div>
        )}
        
        {!showManualInput && !isDetecting && (
          <div className="space-y-3">
            <Button onClick={detectLocation} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Retry Location Detection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowManualInput(true)}
              className="w-full"
            >
              Enter Address Manually
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationDetection;
