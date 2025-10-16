'use client';
import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import EstablishmentMap from '@/components/maps/EstablishmentMap';
import Image from 'next/image';
import EstablishmentCard from '@/components/ui/establishment-card';
import EstablishmentListItem from '@/components/ui/establishment-list-item';
import Pagination from '@/components/ui/Pagination';

import { 
  Building2, 
  MapPin, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  School,
  BookOpen,
  Search,
  Filter,
  Users,
  Grid3X3,
  List,
  Settings
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
  <div className="fixed bottom-4 right-4 bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out animate-slide-in z-50">
    {message}
  </div>
);

 const Etablissements= () => {
  // États
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // public, privé, all
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Nouveaux états pour pagination et vue
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const { execute, loading, error } = useApiAction();

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Effet pour charger les données
  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      await execute(async () => {
        // Charger tous les établissements sans filtrage par statut
        const data = await secureApi.get('/api/establishments', false);
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
    const matchesStatus = selectedStatus === 'all' || etab.statut === selectedStatus;

    return matchesSearch && matchesType && matchesRegion && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEstablishments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEstablishments = filteredEstablishments.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRegion, selectedStatus]);

  // Statistiques par catégorie avec useMemo pour recalcul automatique
  const statistics = useMemo(() => {
    return {
      total: establishments.length,
      public: establishments.filter(e => e.statut === 'public').length,
      prive: establishments.filter(e => e.statut === 'privé').length,
      universite: establishments.filter(e => e.type === 'Université').length,
      institut: establishments.filter(e => e.type === 'Institut').length,
      ecole: establishments.filter(e => e.type === 'École').length
    };
  }, [establishments]);
  const types = useMemo(() => {
    return [...new Set(establishments.map(etab => etab.type))];
  }, [establishments]);

  // Handlers
  const handleMarkerClick = (id) => {
    setSelectedEstablishment(id);
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterChange = (type, value) => {
    switch(type) {
      case 'type':
        setSelectedType(value);
        displayToast(`Filtrage par type : ${value === 'all' ? 'Tous les types' : value}`);
        break;
      case 'region':
        setSelectedRegion(value);
        displayToast(`Région sélectionnée : ${value === 'all' ? 'Toutes les régions' : value}`);
        break;
      case 'status':
        setSelectedStatus(value);
        displayToast(`Statut sélectionné : ${value === 'all' ? 'Tous' : value === 'public' ? 'Public' : 'Privé'}`);
        break;
      default:
        break;
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Ajuster le nombre d'éléments par page selon la vue
    if (mode === 'list') {
      setItemsPerPage(25); // Plus d'éléments pour la vue liste compacte
    } else {
      setItemsPerPage(12);
    }
    setCurrentPage(1);
    displayToast(`Vue ${mode === 'cards' ? 'cartes' : 'liste'} activée`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll vers le haut de la liste
    const contentElement = document.getElementById('establishments-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
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
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Établissements</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Building2 className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Nos Établissements</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Réseau National d'Enseignement Supérieur</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed">
                Découvrez notre réseau d'établissements d'enseignement supérieur à travers le Niger. 
                Des universités aux instituts spécialisés, explorez la diversité de notre offre éducative avec 
                des filtres avancés par région, type et statut.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setShowMap(!showMap)}
                className="px-8 py-4 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-3 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <MapPin className="w-6 h-6" />
                <span>{showMap ? 'Masquer la carte' : 'Voir la carte'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Comprehensive Filters */}
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedStatus === 'all'
                    ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20'
                }`}
              >
                <div className="text-2xl font-bold mb-1">{statistics.total}</div>
                <div className="text-sm font-medium">Total</div>
              </button>
              
              <button
                onClick={() => handleFilterChange('status', 'public')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedStatus === 'public'
                    ? 'bg-gradient-to-r from-niger-green to-niger-green-dark text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-green/10 dark:hover:bg-niger-green/20 shadow-md border border-niger-green/20'
                }`}
              >
                <div className="text-2xl font-bold mb-1">{statistics.public}</div>
                <div className="text-sm font-medium">Publics</div>
              </button>
              
              <button
                onClick={() => handleFilterChange('status', 'privé')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedStatus === 'privé'
                    ? 'bg-gradient-to-r from-niger-orange-dark to-niger-orange text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20'
                }`}
              >
                <div className="text-2xl font-bold mb-1">{statistics.prive}</div>
                <div className="text-sm font-medium">Privés</div>
              </button>
              
              <button
                onClick={() => handleFilterChange('type', 'Université')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedType === 'Université'
                    ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20'
                }`}
              >
                <GraduationCap className="w-6 h-6 mx-auto mb-1 text-niger-orange" />
                <div className="text-lg font-bold mb-1">{statistics.universite}</div>
                <div className="text-xs font-medium">Universités</div>
              </button>
              
              <button
                onClick={() => handleFilterChange('type', 'Institut')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedType === 'Institut'
                    ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20'
                }`}
              >
                <School className="w-6 h-6 mx-auto mb-1 text-niger-green" />
                <div className="text-lg font-bold mb-1">{statistics.institut}</div>
                <div className="text-xs font-medium">Instituts</div>
              </button>
              
              <button
                onClick={() => handleFilterChange('type', 'École')}
                className={`p-4 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                  selectedType === 'École'
                    ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-1 text-niger-orange-dark" />
                <div className="text-lg font-bold mb-1">{statistics.ecole}</div>
                <div className="text-xs font-medium">Écoles</div>
              </button>
            </div>

            {/* Search and Advanced Filters */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-niger-orange" />
                  <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Filtres avancés</h3>
                </div>
                
                {/* Contrôles de vue et paramètres */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-niger-cream dark:bg-secondary-700 rounded-lg p-1">
                    <button
                      onClick={() => handleViewModeChange('cards')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'cards'
                          ? 'bg-niger-orange text-white shadow-md'
                          : 'text-niger-orange hover:bg-niger-orange/10'
                      }`}
                      title="Vue cartes"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewModeChange('list')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'list'
                          ? 'bg-niger-orange text-white shadow-md'
                          : 'text-niger-orange hover:bg-niger-orange/10'
                      }`}
                      title="Vue liste"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground text-sm"
                  >
                    <option value={viewMode === 'list' ? 15 : 6}>{viewMode === 'list' ? 15 : 6} par page</option>
                    <option value={viewMode === 'list' ? 25 : 12}>{viewMode === 'list' ? 25 : 12} par page</option>
                    <option value={viewMode === 'list' ? 50 : 24}>{viewMode === 'list' ? 50 : 24} par page</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un établissement..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-niger-orange w-5 h-5" />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                >
                  <option value="all">Tous les types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedRegion}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                >
                  <option value="all">Toutes les régions</option>
                  {REGIONS_NIGER.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="public">Public</option>
                  <option value="privé">Privé</option>
                </select>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg my-6 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          {/* Map Section */}
          {showMap && (
            <div 
              id="map-section" 
              className="mt-8 rounded-2xl overflow-hidden shadow-xl border border-niger-orange/20"
            >
              <EstablishmentMap 
                etablissements={filteredEstablishments}
                selectedId={selectedEstablishment}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          )}

          {/* Establishments Content */}
          <div id="establishments-content" className="mt-8">
            {filteredEstablishments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-niger-orange/10">
                <Building2 className="w-20 h-20 text-niger-orange/60 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-4">
                  Aucun établissement trouvé
                </h3>
                <p className="text-readable-muted dark:text-muted-foreground max-w-md mx-auto">
                  Essayez de modifier vos critères de recherche ou supprimez certains filtres pour voir plus de résultats.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedRegion('all');
                    setSelectedStatus('all');
                  }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Résultats et informations */}
                <div className="flex items-center justify-between bg-white dark:bg-secondary-800 rounded-xl p-4 border border-niger-orange/10">
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    <span className="font-medium text-niger-green dark:text-niger-green-light">
                      {filteredEstablishments.length}
                    </span> établissement{filteredEstablishments.length > 1 ? 's' : ''} trouvé{filteredEstablishments.length > 1 ? 's' : ''}
                    {(searchTerm || selectedType !== 'all' || selectedRegion !== 'all' || selectedStatus !== 'all') && (
                      <span> avec les filtres appliqués</span>
                    )}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Vue {viewMode === 'cards' ? 'cartes' : 'liste'} • Page {currentPage} sur {totalPages}
                  </div>
                </div>

                {/* Grille ou Liste des établissements */}
                {viewMode === 'cards' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedEstablishments.map((establishment) => (
                      <EstablishmentCard
                        key={establishment._id}
                        establishment={establishment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedEstablishments.map((establishment) => (
                      <EstablishmentListItem
                        key={establishment._id}
                        establishment={establishment}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredEstablishments.length}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-2xl flex items-center border border-niger-orange/20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-niger-orange border-t-transparent mr-4"></div>
            <span className="text-lg font-medium text-niger-green dark:text-niger-green-light">Chargement en cours...</span>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {showToast && <Toast message={toastMessage} />}
    </MainLayout>
  );
}

export default Etablissements;