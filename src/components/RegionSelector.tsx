
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { regions } from '../data/floodData';
import { indiaStatesAndDistricts, getDistrictsForState, getDistrictFullData } from '../data/indiaStatesDistricts';
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
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onRegionChange }) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [availableDistricts, setAvailableDistricts] = useState<{ value: string; label: string }[]>([]);
  
  // When a state is selected, update the available districts
  useEffect(() => {
    if (selectedState) {
      const districts = getDistrictsForState(selectedState);
      setAvailableDistricts(districts);
      
      // Reset district selection when state changes
      setSelectedDistrict("");
    }
  }, [selectedState]);

  // Handle state selection
  const handleStateChange = (value: string) => {
    setSelectedState(value);
  };
  
  // Handle district selection
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    
    // Find the matching region in the flood data if possible
    // In a real app, you would probably map districts to regions more precisely
    const matchingRegion = regions.find(region => 
      region.label.toLowerCase().includes(value) || 
      value.includes(region.label.toLowerCase())
    );
    
    if (matchingRegion) {
      onRegionChange(matchingRegion.value);
    } else {
      // If no direct match in regions data, use the district value as region
      onRegionChange(value);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <MapPin className="mr-2 h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Region</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Selection */}
        <div>
          <label htmlFor="state-select" className="block text-sm font-medium mb-2 text-muted-foreground">
            Select a state in India:
          </label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {indiaStatesAndDistricts.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* District Selection - only shown if a state is selected */}
        {selectedState && (
          <div>
            <label htmlFor="district-select" className="block text-sm font-medium mb-2 text-muted-foreground">
              Select a district:
            </label>
            <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district.value} value={district.value}>
                    {district.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Original Region Selection - keep for compatibility */}
        <div className="md:col-span-2 mt-4">
          <label htmlFor="region-select" className="block text-sm font-medium mb-2 text-muted-foreground">
            Or select a location with flood data:
          </label>
          <select
            id="region-select"
            className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}, {region.state}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-center md:justify-end md:col-span-2 mt-4">
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
    </div>
  );
};

export default RegionSelector;
