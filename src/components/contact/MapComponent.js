// src/components/contact/MapComponent.js
import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Phone, Mail } from 'lucide-react';

export default function MapComponent() {
  const mapRef = useRef(null);

  // Coordonnées exactes du ministère
  const ministryLocation = {
    lat: 13.515949432071622,
    lng: 2.10207413963038,
    name: "Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique",
    address: "Niamey, Niger"
  };

  const openInMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ministryLocation.lat},${ministryLocation.lng}&query_place_id=ChIJtVJWoQ8uARgRQg-Yg4Q1V1s`;
    window.open(googleMapsUrl, '_blank');
  };

  const openInAppleMaps = () => {
    const appleMapsUrl = `maps://maps.apple.com/?q=${ministryLocation.lat},${ministryLocation.lng}`;
    window.open(appleMapsUrl, '_blank');
  };

  useEffect(() => {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') return;

    let map;
    let leaflet;

    const initMap = async () => {
      try {
        // Charger Leaflet dynamiquement
        leaflet = await import('leaflet');

        // Vérifier si le conteneur existe et n'est pas déjà initialisé
        if (!mapRef.current) return;

        // Nettoyer le conteneur si il a déjà été initialisé
        if (mapRef.current._leaflet_id) {
          mapRef.current._leaflet_id = null;
        }

        // Vider le conteneur
        mapRef.current.innerHTML = '';

        // Créer la carte
        map = leaflet.map(mapRef.current, {
          center: [ministryLocation.lat, ministryLocation.lng],
          zoom: 17,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          boxZoom: true
        });

        // Ajouter les tuiles OpenStreetMap
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Créer une icône personnalisée pour le marqueur
        const customIcon = leaflet.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative">
              <div class="w-8 h-8 bg-niger-orange rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-niger-orange"></div>
            </div>
          `,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40]
        });

        // Ajouter le marqueur
        const marker = leaflet.marker([ministryLocation.lat, ministryLocation.lng], {
          icon: customIcon
        }).addTo(map);

        // Ajouter une popup
        marker.bindPopup(`
          <div class="text-center p-2">
            <h3 class="font-bold text-niger-green mb-2">${ministryLocation.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${ministryLocation.address}</p>
            <div class="flex gap-2">
              <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${ministryLocation.lat},${ministryLocation.lng}', '_blank')" class="px-3 py-1 bg-niger-orange text-white text-xs rounded hover:bg-niger-orange-dark transition-colors">
                Google Maps
              </button>
              <button onclick="window.open('maps://maps.apple.com/?q=${ministryLocation.lat},${ministryLocation.lng}', '_blank')" class="px-3 py-1 bg-niger-green text-white text-xs rounded hover:bg-niger-green-dark transition-colors">
                Apple Maps
              </button>
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        // Ouvrir automatiquement la popup
        marker.openPopup();

        // Ajuster la taille de la carte après le rendu initial
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 250);

      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);

        // Afficher un message d'erreur dans le conteneur de la carte
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-secondary-700 rounded-lg">
              <MapPin class="w-12 h-12 text-niger-orange mb-4" />
              <p class="text-gray-600 dark:text-gray-300 text-center">
                Impossible de charger la carte interactive.<br>
                Veuillez réessayer plus tard.
              </p>
            </div>
          `;
        }
      }
    };

    initMap();

    // Nettoyage
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-niger-orange" />
          <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Notre localisation</h2>
        </div>
        <button
          onClick={openInMaps}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-niger-orange/10 text-niger-orange rounded-lg hover:bg-niger-orange/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir dans Maps
        </button>
      </div>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        className="w-full h-80 md:h-96 rounded-xl overflow-hidden border border-niger-orange/20 bg-gray-100 dark:bg-secondary-700"
        style={{ minHeight: '320px' }}
      />

      {/* Informations de contact */}
      <div className="mt-6 space-y-4">
        <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
          <MapPin className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Adresse</h3>
            <span className="text-readable-muted dark:text-muted-foreground">
              Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique<br/>
              Niamey, Niger
            </span>
          </div>
        </div>

        <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
          <Phone className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Téléphone</h3>
            <span className="text-readable-muted dark:text-muted-foreground">+227 XX XX XX XX</span>
          </div>
        </div>

        <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
          <Mail className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Email</h3>
            <span className="text-readable-muted dark:text-muted-foreground">contact@mesrit.ne</span>
          </div>
        </div>
      </div>

      {/* CSS pour les styles personnalisés de Leaflet */}
      <style jsx global>{`
        .leaflet-container {
          border-radius: 0.75rem;
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        /* Styles pour les couleurs Niger */
        .bg-niger-orange { background-color: #ff8c00; }
        .bg-niger-orange-dark { background-color: #e67e00; }
        .bg-niger-green { background-color: #228b22; }
        .bg-niger-green-dark { background-color: #1e7b1e; }
        .text-niger-green { color: #228b22; }
        .border-niger-orange { border-color: #ff8c00; }
      `}</style>
    </div>
  );
}