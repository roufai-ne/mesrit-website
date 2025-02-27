// src/components/maps/Map.js
import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { MapPin, Globe, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';

// Correction des icônes Leaflet pour Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/map/marker.webp',
  iconUrl: '/map/marker.webp',
  shadowUrl: null,
});

const customIcon = new L.Icon({
  iconUrl: '/map/marker.webp',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const activeIcon = new L.Icon({
  iconUrl: '/map/marker-active.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const isValidLatLng = (lat, lng) => {
  return (
    lat !== undefined &&
    lng !== undefined &&
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

function MapController({ etablissements, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!etablissements || etablissements.length === 0) return;

    const validEtablissements = etablissements.filter((e) =>
      isValidLatLng(e.coordinates?.lat, e.coordinates?.lng)
    );

    if (selectedId) {
      const etab = validEtablissements.find((e) => e._id === selectedId);
      if (etab) {
        map.flyTo([etab.coordinates.lat, etab.coordinates.lng], 14, {
          duration: 1,
          easeLinearity: 0.25,
        });
      }
    } else if (validEtablissements.length > 0) {
      const bounds = L.latLngBounds(
        validEtablissements.map((etab) => [etab.coordinates.lat, etab.coordinates.lng])
      );
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
      }
    }
  }, [etablissements, selectedId, map]);

  return null;
}

const EstablishmentMarker = React.memo(
  function EstablishmentMarker({ etab, isSelected, onMarkerClick }) {
    const markerRef = useRef(null);

    if (!isValidLatLng(etab.coordinates?.lat, etab.coordinates?.lng)) {
      return null;
    }

    return (
      <Marker
        position={[etab.coordinates.lat, etab.coordinates.lng]}
        icon={isSelected ? activeIcon : customIcon}
        eventHandlers={{
          click: () => {
            onMarkerClick(etab._id);
            if (markerRef.current) markerRef.current.openPopup();
          },
        }}
        ref={markerRef}
      >
        <Tooltip direction="top" offset={[0, -40]} opacity={0.9}>
          <div className="text-sm font-medium text-gray-900">{etab.nom}</div>
          <div className="text-xs text-gray-600">{etab.ville}</div>
        </Tooltip>
        <Popup className="custom-popup">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                  <Image
                    src={etab.logo || '/placeholder.png'}
                    alt={etab.nom}
                    width={40}  // 12 (w-12) - 2*2 (p-2) = 40px
                    height={40} // 12 (h-12) - 2*2 (p-2) = 40px
                    className="object-contain"
                    onError={(e) => {
                      e.target.srcset = ''; // Évite les erreurs de cache
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{etab.nom}</h3>
                  <p className="text-sm text-gray-600">{etab.type}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{etab.ville}, {etab.region}</span>
              </div>
              {etab.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{etab.phone}</span>
                </div>
              )}
              {etab.website && (
                <a
                  href={etab.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="text-sm">Visiter le site web</span>
                </a>
              )}
              <div className="text-sm text-gray-500">
                Ouvert depuis : {new Date(etab.dateOuverture).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.etab._id === nextProps.etab._id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onMarkerClick === nextProps.onMarkerClick
    );
  }
);

EstablishmentMarker.displayName = 'EstablishmentMarker';

const Map = ({ etablissements = [], selectedId, onMarkerClick }) => {
  const centerPosition = [17.6078, 8.0817];

  const validEtablissements = useMemo(() => {
    return etablissements.filter(
      (etab) =>
        etab._id &&
        etab.coordinates?.lat !== undefined &&
        etab.coordinates?.lng !== undefined &&
        isValidLatLng(etab.coordinates.lat, etab.coordinates.lng)
    );
  }, [etablissements]);

  if (!validEtablissements.length) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-xl shadow-soft">
        <p className="text-gray-500 text-lg animate-fade-in">
          Aucun établissement valide à afficher sur la carte.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl shadow-soft overflow-hidden border border-gray-100">
      <MapContainer
        center={centerPosition}
        zoom={6}
        className="w-full h-full"
        scrollWheelZoom={false}
        aria-label="Carte interactive des établissements"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController etablissements={validEtablissements} selectedId={selectedId} />
        {validEtablissements.map((etab) => (
          <EstablishmentMarker
            key={etab._id}
            etab={etab}
            isSelected={etab._id === selectedId}
            onMarkerClick={onMarkerClick}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;