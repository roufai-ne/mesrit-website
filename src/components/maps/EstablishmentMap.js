// src/components/maps/EstablishmentMap.js
import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-50 rounded-xl flex flex-col items-center justify-center animate-pulse">
      <MapPin className="w-12 h-12 text-gray-300 mb-4" />
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
});

const REGIONS_NIGER = ['Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'];
const TYPES_ETABLISSEMENT = ['Université', 'Institut', 'École'];

export default function EstablishmentMap({ etablissements = [], selectedId, onMarkerClick }) {
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleMarkerClick = useCallback(
    (id) => {
      if (onMarkerClick) onMarkerClick(id);
    },
    [onMarkerClick]
  );

  // Filtrer les établissements
  const filteredEtablissements = useMemo(() => {
    return etablissements.filter((etab) => {
      const matchesRegion = filterRegion === 'all' || etab.region === filterRegion;
      const matchesType = filterType === 'all' || etab.type === filterType;
      return matchesRegion && matchesType;
    });
  }, [etablissements, filterRegion, filterType]);

  if (!etablissements || !Array.isArray(etablissements)) {
    return (
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900">Carte des établissements</h2>
        <p className="text-gray-600 mt-2 animate-fade-in">
          Aucune donnée d'établissement disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Carte des établissements</h2>
        <p className="text-gray-600 mt-2">
          Visualisez la répartition géographique de nos établissements
        </p>
        <div className="mt-4 flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="input"
            >
              <option value="all">Toutes les régions</option>
              {REGIONS_NIGER.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">Tous les types</option>
              {TYPES_ETABLISSEMENT.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <MapWithNoSSR
        etablissements={filteredEtablissements}
        selectedId={selectedId}
        onMarkerClick={handleMarkerClick}
      />
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredEtablissements.length} établissement(s) sur la carte</span>
          <span>Cliquez sur un marqueur pour plus d'informations</span>
        </div>
      </div>
    </div>
  );
}