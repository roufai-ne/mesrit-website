import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Globe, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Composant pour gérer le zoom et le centrage
function MapController({ etablissements, selectedId }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId) {
      // Zoom sur l'établissement sélectionné
      const etab = etablissements.find(e => e.id === selectedId);
      if (etab) {
        map.flyTo([etab.coordinates.lat, etab.coordinates.lng], 14, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    } else if (etablissements.length > 0) {
      // Créer les bounds pour inclure tous les établissements filtrés
      const bounds = L.latLngBounds(
        etablissements.map(etab => [etab.coordinates.lat, etab.coordinates.lng])
      );
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [etablissements, selectedId, map]);

  return null;
}

const customIcon = new L.Icon({
  iconUrl: '/map/marker.webp',
  iconSize: [50, 50],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const activeIcon = new L.Icon({
  iconUrl: '/map/marker-active.png', // Version bleue du marqueur
  iconSize: [50, 50],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export default function Map({ etablissements = [], selectedId, onMarkerClick }) {
  const centerPosition = [17.6078, 8.0817];
  const popupRef = useRef({});

  return (
    <>
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          min-width: 240px;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      
      <MapContainer
        center={centerPosition}
        zoom={6}
        style={{ height: '600px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapController etablissements={etablissements} selectedId={selectedId} />
        
        {etablissements.map(etab => (
          <Marker
            key={etab.id}
            position={[etab.coordinates.lat, etab.coordinates.lng]}
            icon={etab.id === selectedId ? activeIcon : customIcon}
            eventHandlers={{
              click: () => {
                onMarkerClick(etab.id);
                if (popupRef.current[etab.id]) {
                  popupRef.current[etab.id].openPopup();
                }
              }
            }}
            ref={(ref) => {
              if (ref) {
                popupRef.current[etab.id] = ref;
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                      <img 
                        src={etab.logo} 
                        alt={etab.nom}
                        className="w-full h-full object-contain"
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
                    <span className="text-sm">{etab.ville}</span>
                  </div>
                  
                  {etab.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">{etab.phone}</span>
                    </div>
                  )}
                  
                  <a 
                    href={etab.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="text-sm">Visiter le site web</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}