// src/components/maps/MapPicker.js
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { isValidLatLng } from '@/utils/mapUtils'; // Import partagé

// Correction des icônes Leaflet pour Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

const LocationMarker = ({ position, onPositionChange }) => {
  const map = useMap();
  const mapEvents = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (isValidLatLng(lat, lng)) {
        onPositionChange({ lat, lng });
        map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 });
      }
    },
  });

  useEffect(() => {
    if (position && isValidLatLng(position[0], position[1])) {
      map.flyTo(position, 13, { duration: 0.5 });
    }
  }, [position, map]);

  if (!position || !isValidLatLng(position[0], position[1])) {
    return null;
  }


  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPosition = marker.getLatLng();
          if (isValidLatLng(newPosition.lat, newPosition.lng)) {
            onPositionChange({ lat: newPosition.lat, lng: newPosition.lng });
          }
        },
      }}
    />
  );
};

const MapPicker = ({ position, onPositionChange }) => {
  const nigerCenter = [17.6078, 8.0817];
  const defaultZoom = 6;
  const selectedZoom = 13;

  const normalizedPosition = useMemo(() => {
    if (position && position.lat !== undefined && position.lng !== undefined) {
      return [position.lat, position.lng];
    }
    return null;
  }, [position]);

  const mapConfig = useMemo(() => {
    const isValidPosition = normalizedPosition && isValidLatLng(normalizedPosition[0], normalizedPosition[1]);
    return {
      center: isValidPosition ? normalizedPosition : nigerCenter,
      zoom: isValidPosition ? selectedZoom : defaultZoom,
    };
  }, [normalizedPosition]);

  return (
    <div className="relative w-full h-[400px] rounded-xl shadow-soft border border-gray-100 overflow-hidden">
      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={normalizedPosition}
          onPositionChange={(newPos) => onPositionChange(newPos)}
        />
      </MapContainer>
      {!normalizedPosition && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
          <span className="text-white text-sm bg-gray-800 bg-opacity-75 px-3 py-1 rounded-full animate-fade-in">
            Cliquez pour placer un marqueur
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MapPicker);