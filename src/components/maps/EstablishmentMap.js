// src/components/maps/EstablishmentMap.js
import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-50 rounded-lg flex flex-col items-center justify-center animate-pulse">
      <MapPin className="w-12 h-12 text-gray-300 mb-4" />
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
});

export default function EstablishmentMap({ etablissements, selectedId, onMarkerClick }) {
  if (!etablissements) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Carte des établissements</h2>
        <p className="text-gray-600 mt-2">
          Visualisez la répartition géographique de nos établissements
        </p>
      </div>
      <MapWithNoSSR 
        etablissements={etablissements} 
        selectedId={selectedId}
        onMarkerClick={onMarkerClick}
      />
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{etablissements.length} établissement(s) sur la carte</span>
          <span>Cliquez sur un marqueur pour plus d'informations</span>
        </div>
      </div>
    </div>
  );
}