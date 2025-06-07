
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { fetchUniqueStates, fetchDistrictsForState } from '../services/imdApiService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  onStateChange?: (state: string) => void;
  onDistrictChange?: (district: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  selectedRegion, 
  onRegionChange,
  onStateChange,
  onDistrictChange
}) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState<boolean>(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  
  // Fetch states on component mount
  useEffect(() => {
    const loadStates = async () => {
      setIsLoadingStates(true);
      try {
        const states = await fetchUniqueStates();
        setAvailableStates(states);
        console.log('✅ States loaded:', states.length);
      } catch (error) {
        console.error('❌ Error loading states:', error);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      const loadDistricts = async () => {
        setIsLoadingDistricts(true);
        try {
          const districts = await fetchDistrictsForState(selectedState);
          setAvailableDistricts(districts);
          console.log(`✅ Districts loaded for ${selectedState}:`, districts.length);
        } catch (error) {
          console.error('❌ Error loading districts:', error);
        } finally {
          setIsLoadingDistricts(false);
        }
      };

      loadDistricts();
      setSelectedDistrict(""); // Reset district selection
    }
  }, [selectedState]);

  // Handle state selection
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    if (onStateChange) onStateChange(value);
    
    // Update region to state for now
    onRegionChange(value);
  };
  
  // Handle district selection
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    if (onDistrictChange) onDistrictChange(value);
    
    // Update region to district
    onRegionChange(value);
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <MapPin className="mr-2 h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Location</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Selection */}
        <div>
          <label htmlFor="state-select" className="block text-sm font-medium mb-2 text-muted-foreground">
            Select State:
          </label>
          <Select value={selectedState} onValueChange={handleStateChange} disabled={isLoadingStates}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingStates ? "Loading states..." : "Choose a state"} />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* District Selection */}
        <div>
          <label htmlFor="district-select" className="block text-sm font-medium mb-2 text-muted-foreground">
            Select District:
          </label>
          <Select 
            value={selectedDistrict} 
            onValueChange={handleDistrictChange}
            disabled={!selectedState || isLoadingDistricts}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                !selectedState 
                  ? "Select state first"
                  : isLoadingDistricts 
                    ? "Loading districts..." 
                    : "Choose a district"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Selection Summary */}
      {(selectedState || selectedDistrict) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            Selected: {selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Showing flood data and forecasts for this location
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-center md:justify-end mt-4">
        <div className="flex items-center mr-4">
          <span className="inline-block w-3 h-3 rounded-full bg-flood-safe mr-2"></span>
          <span className="text-xs">Low Risk</span>
        </div>
        <div className="flex items-center mr-4">
          <span className="inline-block w-3 h-3 rounded-full bg-flood-warning mr-2"></span>
          <span className="text-xs">Medium Risk</span>
        </div>
        <div className="flex items-center mr-4">
          <span className="inline-block w-3 h-3 rounded-full bg-flood-danger mr-2"></span>
          <span className="text-xs">High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
