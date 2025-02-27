'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import EstablishmentMap from '@/components/maps/EstablishmentMap';
import Image from 'next/image';

import { 
  Building2, 
  MapPin, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  School,
  BookOpen,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { secureApi, useApiAction } from '@/lib/secureApi';

const REGIONS_NIGER = [
  'Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'
];

const TYPE_ICONS = {
  'Université': <GraduationCap className="w-5 h-5" />,
  'Institut': <School className="w-5 h-5" />,
  'École': <BookOpen className="w-5 h-5" />
};

const Toast = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out animate-slide-in z-50">
    {message}
  </div>
);

 const Etablissements= () => {
  // États
  const [establishments, setEstablishments] = useState([]);
  const [activeTab, setActiveTab] = useState("public");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { execute, loading, error } = useApiAction();

  const itemsPerPage = 6;

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Effet pour charger les données
  useEffect(() => {
    fetchEstablishments();
  }, [activeTab, selectedRegion, selectedType]);

  const fetchEstablishments = async () => {
    try {
      await execute(async () => {
        // Construire l'URL avec des paramètres de requête si nécessaire
        let url = '/api/establishments';
        const params = new URLSearchParams();
        
        if (activeTab !== 'all') params.append('statut', activeTab);
        if (selectedRegion !== 'all') params.append('region', selectedRegion);
        if (selectedType !== 'all') params.append('type', selectedType);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        // Utiliser secureApi pour les requêtes (endpoint public)
        const data = await secureApi.get(url, false);
        setEstablishments(data);
      });
    } catch (err) {
      displayToast('Erreur lors du chargement des établissements');
    }
  };

  // Filtrage des établissements
  const filteredEstablishments = establishments.filter(etab => {
    const matchesSearch = etab.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (etab.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || etab.type === selectedType;
    const matchesRegion = selectedRegion === 'all' || etab.region === selectedRegion;
    const matchesStatus = etab.statut === activeTab;

    return matchesSearch && matchesType && matchesRegion && matchesStatus;
  });

  // Groupement par région
  const establishmentsByRegion = filteredEstablishments.reduce((acc, curr) => {
    if (!acc[curr.region]) {
      acc[curr.region] = [];
    }
    acc[curr.region].push(curr);
    return acc;
  }, {});

  const displayedItems = activeTab === 'public' 
    ? filteredEstablishments.slice(startIndex, startIndex + itemsPerPage)
    : filteredEstablishments;

  const types = [...new Set(establishments.map(etab => etab.type))];

  // Handlers
  const handleMarkerClick = (id) => {
    setSelectedEstablishment(id);
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterChange = (type) => {
    setSelectedType(type);
    setStartIndex(0);
    displayToast(`Filtrage par : ${type === 'all' ? 'Tous les types' : type}`);
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setStartIndex(0);
    displayToast(`Région sélectionnée : ${region === 'all' ? 'Toutes les régions' : region}`);
  };
  
  // Loading state
  if (loading && establishments.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse space-y-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Établissements</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Nos Établissements</h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Découvrez notre réseau d'établissements d'enseignement supérieur à travers le Niger
              </p>
              <p className="text-blue-100 mt-2">
                {filteredEstablishments.length} établissement{filteredEstablishments.length > 1 ? 's' : ''} trouvé{filteredEstablishments.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <button 
                onClick={() => setShowMap(!showMap)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>{showMap ? 'Masquer la carte' : 'Voir la carte'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-white shadow-lg relative -mt-8 rounded-xl mx-auto container px-6">
        <div className="p-6">
          {/* Tabs and Filters */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => {
                    setActiveTab('public');
                    setStartIndex(0);
                    displayToast('Affichage des établissements publics');
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'public' ? 'bg-blue-600 text-white' : 'text-gray-700'
                  }`}
                >
                  Établissements Publics
                </button>
                <button
                  onClick={() => {
                    setActiveTab('privé');
                    setStartIndex(0);
                    displayToast('Affichage des établissements privés');
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'privé' ? 'bg-blue-600 text-white' : 'text-gray-700'
                  }`}
                >
                  Établissements Privés
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setStartIndex(0);
                  }}
                  placeholder="Rechercher un établissement..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              
              <select 
                value={selectedType}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">Tous les types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select 
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">Toutes les régions</option>
                {REGIONS_NIGER.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg my-6">
              {error}
            </div>
          )}
          {/* Map Section */}
          {showMap && (
            <div 
              id="map-section" 
              className="mt-6 rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 500 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EstablishmentMap 
                etablissements={filteredEstablishments}
                selectedId={selectedEstablishment}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          )}

          {/* Content Sections */}
          <div className="mt-6">
            {activeTab === 'public' ? (
              // Section établissements publics
              <div className="space-y-8">
                {displayedItems.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      Aucun établissement trouvé
                    </h3>
                    <p className="text-gray-500">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedItems.map((etab) => (
                        <div
                          key={etab._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-6">
                            <div className="flex items-start space-x-4">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg p-4 flex-shrink-0">
  <Image
    src={etab.logo || '/images/logos/default.webp'}
    alt={`Logo ${etab.nom}`}
    width={64}  // 24 (w-24) - 2*4 (p-4) = 64px
    height={64} // 24 (h-24) - 2*4 (p-4) = 64px
    className="object-contain"
  />
</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
                                  {etab.nom}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {etab.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    {TYPE_ICONS[etab.type]}
                                    <span className="ml-2 truncate">{etab.type}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span className="ml-2 truncate">{etab.ville}</span>
                                  </div>
                                </div>

                                {etab.website && (
                                  <a 
                                    href={etab.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => displayToast('Ouverture du site web')}
                                    className="mt-4 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm group"
                                  >
                                    <Globe className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Visiter le site
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {filteredEstablishments.length > itemsPerPage && (
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setStartIndex(prev => Math.max(0, prev - itemsPerPage))}
                          disabled={startIndex === 0}
                          className={`p-3 rounded-lg transition-colors ${
                            startIndex === 0 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setStartIndex(prev => Math.min(filteredEstablishments.length - itemsPerPage, prev + itemsPerPage))}
                          disabled={startIndex + itemsPerPage >= filteredEstablishments.length}
                          className={`p-3 rounded-lg transition-colors ${
                            startIndex + itemsPerPage >= filteredEstablishments.length 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
        // Section établissements privés
        <div className="space-y-8">
  {Object.entries(establishmentsByRegion).length === 0 ? (
    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-600 mb-2">
        Aucun établissement trouvé
      </h3>
      <p className="text-gray-500">
        Essayez de modifier vos critères de recherche
      </p>
    </div>
  ) : (
    // Tri des régions par ordre alphabétique
    Object.entries(establishmentsByRegion)
      .sort(([regionA], [regionB]) => regionA.localeCompare(regionB))
      .map(([region, etabs]) => (
        <div
          key={region}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              Région de {region}
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({etabs.length} établissement{etabs.length > 1 ? 's' : ''})
              </span>
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tri des établissements par ordre alphabétique */}
              {etabs
                .sort((a, b) => a.nom.localeCompare(b.nom))
                .map((etab) => (
                  <div
                    key={etab._id}
                    onClick={() => setSelectedEstablishment(etab._id === selectedEstablishment ? null : etab._id)}
                    className={`group relative bg-white rounded-lg border transition-all duration-300 
                      ${etab._id === selectedEstablishment 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 p-2 mr-3">
                          <Image
                            src={etab.logo || '/images/logos/default.webp'}
                            alt={`Logo ${etab.nom}`}
                            width={40}  // 12 (w-12) - 2*2 (p-2) = 40px
                            height={40} // 12 (h-12) - 2*2 (p-2) = 40px
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${etab._id === selectedEstablishment ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>
                            {etab.nom}
                          </h4>
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            {TYPE_ICONS[etab.type]}
                            <span className="ml-2">{etab.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Détails de l'établissement (visible au clic) */}
                      {etab._id === selectedEstablishment && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
                          <p className="text-sm text-gray-600">
                            {etab.description || "Aucune description disponible."}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="ml-2">{etab.ville}, {etab.region}</span>
                            </div>
                            
                            {etab.dateOuverture && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Ouverture :</span> {new Date(etab.dateOuverture).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long'
                                })}
                              </div>
                            )}
                            
                            {etab.website && (
                              <a 
                                href={etab.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  displayToast('Ouverture du site web');
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                              >
                                <Globe className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Visiter le site
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))
  )}
</div>
    )}
  </div>
</div>
</div>
{loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-md flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span>Chargement en cours...</span>
          </div>
        </div>
      )}

{/* Toast Notifications */}
{showToast && <Toast message={toastMessage} />}
</MainLayout>
);
}

export default Etablissements;