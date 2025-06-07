
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { floodData, getFloodDataForRegion } from '../../data/floodData';
import { useToast } from '../../hooks/use-toast';
import MapControls from './MapControls';
import MapMarker from './MapMarker';
import ReservoirMarker from './ReservoirMarker';
import MapLegend from './MapLegend';
import MapAttribution from './MapAttribution';
import { createFloodAreaPolygon } from './MapUtils';
import { MapProps } from './types';
import { fetchReservoirsForState, fetchReservoirsForDistrict, getDistrictReservoirSummaries, ReservoirMapData, DistrictReservoirSummary } from '../../services/reservoirMapService';

interface ExtendedMapProps extends MapProps {
  selectedState?: string;
  selectedDistrict?: string;
}

const MapComponent: React.FC<ExtendedMapProps> = ({ selectedRegion, selectedState = "", selectedDistrict = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const layersRef = useRef<{[key: string]: L.Layer}>({});
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [reservoirMarkers, setReservoirMarkers] = useState<ReservoirMapData[]>([]);
  const [districtSummaries, setDistrictSummaries] = useState<DistrictReservoirSummary[]>([]);
  const selectedFloodData = getFloodDataForRegion(selectedRegion);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      // Fix Leaflet icon issues with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      
      // Create the Leaflet map centered on India
      map.current = L.map(mapContainer.current, {
        attributionControl: false,
        zoomControl: false
      }).setView([20.5937, 78.9629], 5);
      
      // Add the OpenStreetMap tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current);
      
      // Add flood areas layer group
      layersRef.current['floodAreas'] = L.layerGroup().addTo(map.current);
      
      // Add state boundaries layer group
      layersRef.current['stateBoundaries'] = L.layerGroup().addTo(map.current);
      
      // Add reservoir markers layer group
      layersRef.current['reservoirMarkers'] = L.layerGroup().addTo(map.current);
      
      setMapLoaded(true);
      
      const now = new Date();
      setLastUpdate(now.toLocaleString());
      
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not initialize map. Please check your connection.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Load reservoir data when state/district changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const loadReservoirData = async () => {
      try {
        // Clear existing reservoir markers
        const reservoirLayer = layersRef.current['reservoirMarkers'] as L.LayerGroup;
        if (reservoirLayer) {
          reservoirLayer.clearLayers();
        }

        if (selectedState && selectedDistrict) {
          // Load specific district reservoirs
          console.log(`🎯 Loading reservoirs for ${selectedDistrict}, ${selectedState}`);
          const reservoirs = await fetchReservoirsForDistrict(selectedState, selectedDistrict);
          setReservoirMarkers(reservoirs);
          
          if (reservoirs.length > 0) {
            // Zoom to district bounds
            const bounds = L.latLngBounds(reservoirs.map(r => r.coordinates));
            map.current?.fitBounds(bounds, { padding: [20, 20] });
          }
        } else if (selectedState) {
          // Load state summary
          console.log(`🗺️ Loading state summary for ${selectedState}`);
          const summaries = await getDistrictReservoirSummaries(selectedState);
          setDistrictSummaries(summaries);
          
          if (summaries.length > 0) {
            // Zoom to state bounds
            const bounds = L.latLngBounds(summaries.map(s => s.coordinates));
            map.current?.fitBounds(bounds, { padding: [50, 50] });
          }
        } else {
          // Default behavior - show original flood data
          setReservoirMarkers([]);
          setDistrictSummaries([]);
        }
      } catch (error) {
        console.error('Error loading reservoir data:', error);
        toast({
          title: "Data Loading Error",
          description: "Could not load reservoir data for the selected region.",
          variant: "destructive"
        });
      }
    };

    loadReservoirData();
  }, [selectedState, selectedDistrict, mapLoaded, toast]);

  // Update map when selected region changes (original flood data)
  useEffect(() => {
    if (!mapLoaded || !map.current || !selectedFloodData) return;

    // Only zoom to flood data if no state/district is selected
    if (!selectedState && !selectedDistrict) {
      map.current.flyTo(
        [selectedFloodData.coordinates[0], selectedFloodData.coordinates[1]],
        7,
        { animate: true, duration: 1 }
      );
    }

    updateFloodAreas();
    updateStateBoundary();
  }, [selectedRegion, mapLoaded, selectedFloodData, selectedState, selectedDistrict]);

  // Update flood areas on map
  const updateFloodAreas = () => {
    if (!map.current || !layersRef.current['floodAreas']) return;
    
    const floodAreasLayer = layersRef.current['floodAreas'] as L.LayerGroup;
    floodAreasLayer.clearLayers();
    
    const filteredFloodData = floodData.filter(data => data.riskLevel !== 'low');
    
    filteredFloodData.forEach(data => {
      const geoJsonPolygon = createFloodAreaPolygon(data);
      if (geoJsonPolygon) {
        const color = 
          data.riskLevel === 'severe' ? '#F44336' :
          data.riskLevel === 'high' ? '#FF9800' :
          data.riskLevel === 'medium' ? '#FFC107' : 
          '#4CAF50';
        
        const polygon = L.geoJSON(geoJsonPolygon as any, {
          style: {
            color: color,
            weight: 2,
            opacity: 1,
            fillColor: color,
            fillOpacity: 0.3
          }
        });
        
        polygon.bindPopup(`
          <div class="font-bold">${data.region}, ${data.state}</div>
          <div>Risk Level: ${data.riskLevel.toUpperCase()}</div>
          <div>Area: ${data.affectedArea} km²</div>
          <div>Population: ${data.populationAffected.toLocaleString()}</div>
        `);
        
        polygon.addTo(floodAreasLayer);
      }
    });
  };
  
  // Add state boundary highlighting for the selected region
  const updateStateBoundary = () => {
    if (!map.current || !layersRef.current['stateBoundaries'] || !selectedFloodData) return;
    
    const stateBoundariesLayer = layersRef.current['stateBoundaries'] as L.LayerGroup;
    stateBoundariesLayer.clearLayers();
    
    const stateCenter = selectedFloodData.coordinates;
    const stateRadius = Math.sqrt(selectedFloodData.affectedArea) * 500;
    
    const stateColor = 
      selectedFloodData.riskLevel === 'severe' ? '#F44336' :
      selectedFloodData.riskLevel === 'high' ? '#FF9800' :
      selectedFloodData.riskLevel === 'medium' ? '#FFC107' : 
      '#4CAF50';
    
    const stateCircle = L.circle(stateCenter, {
      radius: stateRadius,
      color: stateColor,
      weight: 2,
      opacity: 0.8,
      fill: true,
      fillColor: stateColor,
      fillOpacity: 0.15,
    }).addTo(stateBoundariesLayer);
    
    const stateName = selectedFloodData.state;
    const icon = L.divIcon({
      className: 'state-label',
      html: `<div style="background-color: white; padding: 3px 5px; border-radius: 3px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${stateName}</div>`,
      iconSize: [100, 20],
      iconAnchor: [50, 10]
    });
    
    L.marker(stateCenter, { icon: icon }).addTo(stateBoundariesLayer);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut();
  };

  const handleResetView = () => {
    if (!map.current) return;
    map.current.setView([20.5937, 78.9629], 5, { animate: true });
  };

  const toggleLayerVisibility = (layerId: string) => {
    if (!map.current || !layersRef.current[layerId]) return;
    
    const layer = layersRef.current[layerId];
    const isVisible = map.current.hasLayer(layer);
    
    if (isVisible) {
      map.current.removeLayer(layer);
    } else {
      map.current.addLayer(layer);
    }
  };

  return (
    <div className="map-container border rounded-lg overflow-hidden relative">
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: "300px" }}
      />
      
      <MapAttribution lastUpdate={lastUpdate} />
      
      <MapControls 
        map={map.current}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleResetView={handleResetView}
        toggleLayerVisibility={toggleLayerVisibility}
      />
      
      <MapLegend />
      
      {/* Render original flood markers when no state/district is selected */}
      {mapLoaded && map.current && !selectedState && !selectedDistrict && floodData.map(data => (
        <MapMarker 
          key={data.id}
          data={data}
          map={map.current!}
          selectedRegion={selectedRegion}
          popupRef={popupRef}
        />
      ))}
      
      {/* Render reservoir markers for specific district */}
      {mapLoaded && map.current && selectedState && selectedDistrict && reservoirMarkers.map(reservoir => (
        <ReservoirMarker
          key={reservoir.id}
          reservoir={reservoir}
          map={map.current!}
          isSelected={false}
        />
      ))}
      
      {/* Render district summary markers for state view */}
      {mapLoaded && map.current && selectedState && !selectedDistrict && districtSummaries.map(summary => (
        <ReservoirMarker
          key={`district-${summary.district}`}
          reservoir={{
            id: `district-${summary.district}`,
            name: `${summary.district} (${summary.reservoirCount} reservoirs)`,
            state: summary.state,
            district: summary.district,
            coordinates: summary.coordinates,
            reservoirPercentage: summary.avgReservoirPercentage,
            riskLevel: summary.riskLevel,
            inflowCusecs: summary.totalInflowCusecs,
            outflowCusecs: 0,
            lastUpdated: new Date().toISOString()
          }}
          map={map.current!}
          isSelected={false}
        />
      ))}
    </div>
  );
};

export default MapComponent;
