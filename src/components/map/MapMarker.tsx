
import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapMarkerProps } from './types';

const MapMarker = ({ data, map, selectedRegion, popupRef }: MapMarkerProps) => {
  useEffect(() => {
    if (!map) return;

    // Set marker color based on risk level
    const color = 
      data.riskLevel === 'severe' ? '#F44336' :
      data.riskLevel === 'high' ? '#FF9800' :
      data.riskLevel === 'medium' ? '#FFC107' : 
      '#4CAF50';
    
    // Create custom marker icon
    const customIcon = L.divIcon({
      html: `
        <div class="flood-marker" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="${color}" stroke-width="3" fill="white" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      className: data.riskLevel === 'severe' || data.riskLevel === 'high' ? 'animate-pulse' : '',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });
    
    // Create and add marker with correct coordinates
    const marker = L.marker([data.coordinates[0], data.coordinates[1]], {
      icon: customIcon
    }).addTo(map);
    
    // Create popup with info
    const popupContent = `
      <div class="map-tooltip">
        <div class="font-bold text-sm">${data.region.charAt(0).toUpperCase() + data.region.slice(1)}, ${data.state}</div>
        <div class="mt-1">
          <div class="flex justify-between">
            <span>Risk Level:</span>
            <span class="font-semibold ${
              data.riskLevel === 'severe' ? 'text-red-600' :
              data.riskLevel === 'high' ? 'text-orange-500' :
              data.riskLevel === 'medium' ? 'text-amber-500' :
              'text-green-600'
            }">${data.riskLevel.toUpperCase()}</span>
          </div>
          <div class="flex justify-between">
            <span>Affected Area:</span>
            <span>${data.affectedArea} km²</span>
          </div>
          <div class="flex justify-between">
            <span>Population:</span>
            <span>${data.populationAffected.toLocaleString()}</span>
          </div>
          ${data.predictedFlood ? `
            <div class="mt-2 pt-1 border-t border-gray-200">
              <div class="font-medium">Flood Prediction</div>
              <div class="flex justify-between">
                <span>Probability:</span>
                <span class="${
                  data.predictedFlood.probabilityPercentage > 75 ? 'text-red-600' :
                  data.predictedFlood.probabilityPercentage > 50 ? 'text-orange-500' :
                  'text-amber-500'
                }">${data.predictedFlood.probabilityPercentage}%</span>
              </div>
              <div class="flex justify-between">
                <span>Expected Date:</span>
                <span>${new Date(data.predictedFlood.date).toLocaleDateString()}</span>
              </div>
              ${data.predictedFlood.source ? `
                <div class="mt-1 text-xs flex items-center">
                  <span>Source: </span>
                  <a href="${data.predictedFlood.source.url}" target="_blank" class="text-blue-600 ml-1 hover:underline">
                    ${data.predictedFlood.source.name}
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Add popup to marker
    const popup = L.popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: 300
    }).setContent(popupContent);
    
    // Show popup on marker click
    marker.bindPopup(popup);
    marker.on('click', () => {
      if (popupRef.current) {
        popupRef.current.close();
      }
      marker.openPopup();
      popupRef.current = popup;
    });
    
    // Highlight the marker if it's the selected region
    if (data.region === selectedRegion) {
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'z-50');
      }
      // Open the popup if this is the selected region
      marker.openPopup();
    }

    return () => {
      map.removeLayer(marker);
    };
  }, [data, map, selectedRegion, popupRef]);

  return null; // This component doesn't render anything directly
};

export default MapMarker;
