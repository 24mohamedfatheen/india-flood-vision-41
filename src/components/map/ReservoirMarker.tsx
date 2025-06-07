
import React, { useEffect } from 'react';
import L from 'leaflet';
import { ReservoirMapData } from '../../services/reservoirMapService';

interface ReservoirMarkerProps {
  reservoir: ReservoirMapData;
  map: L.Map;
  isSelected?: boolean;
}

const ReservoirMarker: React.FC<ReservoirMarkerProps> = ({ reservoir, map, isSelected }) => {
  useEffect(() => {
    if (!map) return;

    // Set marker color based on risk level
    const color = 
      reservoir.riskLevel === 'severe' ? '#EF4444' :
      reservoir.riskLevel === 'high' ? '#F97316' :
      reservoir.riskLevel === 'medium' ? '#EAB308' : 
      '#22C55E';
    
    // Create custom reservoir icon
    const reservoirIcon = L.divIcon({
      html: `
        <div class="reservoir-marker ${isSelected ? 'selected' : ''}" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="${color}" stroke-width="2" fill="white" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
      `,
      className: reservoir.riskLevel === 'severe' || reservoir.riskLevel === 'high' ? 'animate-pulse' : '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    // Create and add marker
    const marker = L.marker(reservoir.coordinates, {
      icon: reservoirIcon
    }).addTo(map);
    
    // Create popup with detailed info
    const popupContent = `
      <div class="reservoir-tooltip">
        <div class="font-bold text-sm">${reservoir.name}</div>
        <div class="text-xs text-gray-600">${reservoir.district}, ${reservoir.state}</div>
        <div class="mt-2 space-y-1">
          <div class="flex justify-between">
            <span>Risk Level:</span>
            <span class="font-semibold ${
              reservoir.riskLevel === 'severe' ? 'text-red-600' :
              reservoir.riskLevel === 'high' ? 'text-orange-500' :
              reservoir.riskLevel === 'medium' ? 'text-amber-500' :
              'text-green-600'
            }">${reservoir.riskLevel.toUpperCase()}</span>
          </div>
          <div class="flex justify-between">
            <span>Capacity:</span>
            <span>${reservoir.reservoirPercentage.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span>Inflow:</span>
            <span>${reservoir.inflowCusecs.toLocaleString()} cusecs</span>
          </div>
          <div class="flex justify-between">
            <span>Outflow:</span>
            <span>${reservoir.outflowCusecs.toLocaleString()} cusecs</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Updated: ${new Date(reservoir.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
    
    // Add popup to marker
    const popup = L.popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: 250
    }).setContent(popupContent);
    
    marker.bindPopup(popup);
    
    // Show popup on click
    marker.on('click', () => {
      marker.openPopup();
    });
    
    // Highlight selected marker
    if (isSelected) {
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'z-50');
      }
      marker.openPopup();
    }

    return () => {
      map.removeLayer(marker);
    };
  }, [reservoir, map, isSelected]);

  return null;
};

export default ReservoirMarker;
