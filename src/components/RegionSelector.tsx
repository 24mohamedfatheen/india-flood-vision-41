
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { regions } from '../data/floodData';
import { indiaStatesAndDistricts, getDistrictsForState } from '../data/indiaStatesDistricts';
import { supabase } from '../integrations/supabase/client';
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
  onStateDistrictChange?: (state: string, district: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  selectedRegion, 
  onRegionChange, 
  onStateDistrictChange 
}) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [availableDistricts, setAvailableDistricts] = useState<{ value: string; label: string }[]>([]);
  const [dynamicStates, setDynamicStates] = useState<string[]>([]);
  const [dynamicDistricts, setDynamicDistricts] = useState<string[]>([]);
  
  // Fetch unique states from Supabase
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from('indian_reservoir_levels')
          .select('state')
          .not('state', 'is', null);

        if (error) {
          console.error('Error fetching states:', error);
          return;
        }

        const uniqueStates = [...new Set(data?.map(row => row.state).filter(Boolean))].sort();
        setDynamicStates(uniqueStates);
      } catch (error) {
        console.error('Error fetching unique states:', error);
      }
    };

    fetchStates();
  }, []);

  // Fetch districts for selected state
  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async () => {
        try {
          const { data, error } = await supabase
            .from('indian_reservoir_levels')
            .select('district')
            .eq('state', selectedState)
            .not('district', 'is', null);

          if (error) {
            console.error('Error fetching districts:', error);
            return;
          }

          const uniqueDistricts = [...new Set(data?.map(row => row.district).filter(Boolean))].sort();
          setDynamicDistricts(uniqueDistricts);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };

      fetchDistricts();
      setSelectedDistrict("");
    }
  }, [selectedState]);

  // When a state is selected, update the available districts from static data
  useEffect(() => {
    if (selectedState) {
      const districts = getDistrictsForState(selectedState);
      setAvailableDistricts(districts);
      setSelectedDistrict("");
    }
  }, [selectedState]);

  // Handle state selection
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    if (onStateDistrictChange) {
      onStateDistrictChange(value, "");
    }
  };
  
  // Handle district selection
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    
    if (onStateDistrictChange) {
      onStateDistrictChange(selectedState, value);
    }
    
    // Find matching region in the flood data
    const matchingRegion = regions.find(region => 
      region.label.toLowerCase().includes(value.toLowerCase()) || 
      value.toLowerCase().includes(region.label.toLowerCase())
    );
    
    if (matchingRegion) {
      onRegionChange(matchingRegion.value);
    } else {
      onRegionChange(value.toLowerCase().replace(/\s+/g, ''));
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <MapPin className="mr-2 h-4 w-4 text-primary" />
        <h2 className="font-semibold">Select Region</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dynamic State Selection */}
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">
            State (Live Data):
          </label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {dynamicStates.map((state) => (
                <SelectItem key={state} value={state} className="text-xs">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Dynamic District Selection */}
        {selectedState && (
          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">
              District (Live Data):
            </label>
            <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {dynamicDistricts.map((district) => (
                  <SelectItem key={district} value={district} className="text-xs">
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Original Region Selection */}
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">
            Quick Select:
          </label>
          <select
            className="w-full h-8 px-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div>
      
      {/* Risk Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1"></span>
          <span className="text-xs">High</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
          <span className="text-xs">Severe</span>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
