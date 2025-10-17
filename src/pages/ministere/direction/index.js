import { React, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Users, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Award,
  Building,
  Loader,
  RefreshCw,
  Download,
  Share2,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { secureApi } from '@/lib/secureApi';
import toast from 'react-hot-toast';


export default function DirectionPage() {
  const [loading, setLoading] = useState(true);
  const [ministre, setMinistre] = useState(null);
  const [sg, setSg] = useState(null);
  const [sga, setSga] = useState(null);
  const [dgs, setDgs] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [sousDirections, setSousDirections] = useState({});
  const [error, setError] = useState(null);
  
  // Nouvelles fonctionnalités
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [allDirectors, setAllDirectors] = useState([]);
  const [showContactInfo, setShowContactInfo] = useState({});

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      // Utiliser secureApi sans authentification (endpoint public)
      const data = await secureApi.get('/api/directors', false);

      if (Array.isArray(data)) {
        setAllDirectors(data);
        setMinistre(data.find(d => d.titre === "Ministre"));
        setSg(data.find(d => d.key === "SG"));
        setSga(data.find(d => d.key === "SGA"));
        setDgs(data.filter(d => ["DGES", "DGR"].includes(d.key)));
        
        const sousDir = data.reduce((acc, curr) => {
          if (curr.direction) {
            if (!acc[curr.direction]) {
              acc[curr.direction] = [];
            }
            acc[curr.direction].push(curr);
          }
          return acc;
        }, {});
        
        setSousDirections(sousDir);
        toast.success('Équipe dirigeante chargée avec succès');
      } else {
        setError('Format de données invalide');
        toast.error('Erreur de format des données');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de filtrage et recherche
  const filteredDirectors = allDirectors.filter(director => {
    const matchesSearch = !searchTerm || 
      director.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      director.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      director.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'cabinet' && ['ministre', 'sg', 'sga'].includes(director.key?.toLowerCase())) ||
      (filterType === 'dg' && ['dges', 'dgr'].includes(director.key?.toLowerCase())) ||
      (filterType === 'direction' && director.direction);
    
    return matchesSearch && matchesFilter;
  });

  // Fonction pour basculer l'affichage des informations de contact
  const toggleContactInfo = (directorId) => {
    setShowContactInfo(prev => ({
      ...prev,
      [directorId]: !prev[directorId]
    }));
  };

  // Fonction d'export
  const exportOrganigramme = () => {
    toast.success('Export de l\'organigramme en cours...');
    // Export PDF sera implémenté avec react-pdf ou puppeteer
  };

  // Fonction de partage
  const shareDirectory = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Équipe dirigeante - MESRIT',
        text: 'Découvrez l\'équipe dirigeante du Ministère de l\'Enseignement Supérieur',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  const renderMinisterSection = () => {
    if (!ministre) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-[500px]">
          <Image
            src={ministre.photo || '/images/dir/default.jpg'}
            alt={ministre.nom}
            fill
            className="object-cover object-top brightness-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{ministre.titre}</h2>
            <p className="text-xl text-niger-cream">{ministre.nom}</p>
            
            {/* Informations de contact */}
            <div className="mt-4 space-y-2">
              {ministre.email && (
                <div className="flex items-center gap-2 text-niger-cream/90">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{ministre.email}</span>
                </div>
              )}
              {ministre.telephone && (
                <div className="flex items-center gap-2 text-niger-cream/90">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{ministre.telephone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-8 flex flex-col">
          <div className="bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-lg p-8 mb-6 flex-grow border border-niger-orange/20">
            <h3 className="text-2xl font-semibold text-niger-orange dark:text-niger-orange-light mb-6">Message du Ministre</h3>
            <p className="text-readable-muted dark:text-muted-foreground italic leading-relaxed text-lg text-justify">
              {ministre.message || "Message du ministre non disponible"}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleContactInfo(ministre._id)}
              className="flex-1 bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Plus d'infos
            </button>
            <button
              onClick={shareDirectory}
              className="bg-white dark:bg-secondary-700 border border-niger-orange/30 text-niger-orange px-4 py-2 rounded-lg hover:bg-niger-orange/10 transition-all duration-300 flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDirectionCard = (data, showDirections = false) => {
    if (!data) return null;
    
    const showContact = showContactInfo[data._id];
    
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="relative w-32 h-32">
            <Image
              src={data.photo || '/images/dir/default.jpg'}
              alt={data.nom}
              fill
              className="rounded-full object-cover border-4 border-niger-orange/20"
              sizes="128px"
            />
            {data.key && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-niger-orange to-niger-green p-2 rounded-full shadow-lg">
                <Building className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-grow ml-8">
            <div className="bg-gradient-to-r from-niger-orange to-niger-green inline-block px-4 py-2 rounded-full mb-3 shadow-sm">
              <span className="text-white text-sm font-medium">{data.key || "Direction"}</span>
            </div>
            <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-2">{data.titre}</h2>
            <p className="text-xl text-readable dark:text-foreground mb-2">{data.nom}</p>
            
            {/* Mission si disponible */}
            {data.mission && (
              <p className="text-sm text-readable-muted dark:text-muted-foreground italic">
                {data.mission}
              </p>
            )}
          </div>
        </div>
        
        {/* Informations de contact (conditionnelles) */}
        {showContact && (data.email || data.telephone) && (
          <div className="mt-4 p-4 bg-niger-cream/20 dark:bg-secondary-700 rounded-lg border border-niger-orange/20">
            <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">Contact</h4>
            <div className="space-y-2">
              {data.email && (
                <div className="flex items-center gap-2 text-readable-muted dark:text-muted-foreground">
                  <Mail className="w-4 h-4 text-niger-orange" />
                  <span className="text-sm">{data.email}</span>
                </div>
              )}
              {data.telephone && (
                <div className="flex items-center gap-2 text-readable-muted dark:text-muted-foreground">
                  <Phone className="w-4 h-4 text-niger-orange" />
                  <span className="text-sm">{data.telephone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {(data.email || data.telephone) && (
            <button
              onClick={() => toggleContactInfo(data._id)}
              className="flex-1 bg-niger-orange/10 dark:bg-niger-orange/20 text-niger-orange px-3 py-2 rounded-lg hover:bg-niger-orange/20 transition-all duration-300 text-sm font-medium"
            >
              {showContact ? 'Masquer contact' : 'Voir contact'}
            </button>
          )}
        </div>
        
        {showDirections && sousDirections[data.key]?.length > 0 && (
          <button 
            onClick={() => setCurrentSection(data)}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-b-xl font-medium hover:shadow-lg"
          >
            <Users className="w-5 h-5" />
            <span>Voir les directions ({sousDirections[data.key].length})</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const renderSgaCard = (data) => {
    if (!data) return null;

    return (
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="relative w-20 h-20">
            <Image
              src={data.photo || '/images/dir/default.jpg'}
              alt={data.nom}
              fill
              className="rounded-full object-cover border-2 border-niger-green/30"
              sizes="80px"
            />
          </div>
          <div className="flex-grow ml-4">
            <div className="bg-gradient-to-r from-niger-green to-niger-orange inline-block px-3 py-1 rounded-full mb-2">
              <span className="text-white text-sm font-medium">{data.key || "Direction"}</span>
            </div>
            <h3 className="text-lg font-semibold text-niger-orange dark:text-niger-orange-light">{data.titre}</h3>
            <p className="text-readable dark:text-foreground">{data.nom}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSgSection = () => {
    if (!sg) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderDirectionCard(sg, true)}
        </div>
        <div>
          {renderSgaCard(sga)}
        </div>
      </div>
    );
  };

  const renderDirectionList = (directions) => {
    if (!directions?.length) {
      return (
        <div className="text-center py-8 text-readable-muted dark:text-muted-foreground">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune direction disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {directions.map((direction, index) => (
          <div 
            key={direction.id || index}
            onClick={() => setCurrentDirection(direction)}
            className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 dark:from-niger-orange/30 dark:to-niger-green/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-niger-orange dark:text-niger-orange-light" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-niger-green dark:text-niger-green-light">
                    {direction.nomComplet || direction.titre}
                  </h3>
                  {direction.responsable && (
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Responsable: {direction.responsable}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-niger-orange opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {direction.mission && (
              <div className="mt-4 p-3 bg-niger-cream/20 dark:bg-secondary-700 rounded-lg">
                <p className="text-sm text-readable-muted dark:text-muted-foreground italic">
                  {direction.mission}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Nouvelle fonction pour afficher les résultats de recherche
  const renderSearchResults = () => {
    if (!searchTerm && filterType === 'all') return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
            Résultats de recherche
          </h2>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="text-niger-orange hover:text-niger-orange-dark transition-colors text-sm"
          >
            Effacer les filtres
          </button>
        </div>
        
        {filteredDirectors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
            <Search className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
            <p className="text-readable-muted dark:text-muted-foreground">
              Aucun résultat pour "{searchTerm}" avec le filtre "{filterType}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDirectors.map((director, index) => (
              <div key={director._id || index} className="transform hover:scale-105 transition-transform">
                {renderDirectionCard(director, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-niger-orange/10 dark:bg-secondary-700 rounded-xl"></div>
            <div className="h-[400px] bg-niger-green/10 dark:bg-secondary-700 rounded-xl"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-48 bg-niger-orange/5 dark:bg-secondary-700 rounded-xl"></div>
            <div className="h-48 bg-niger-green/5 dark:bg-secondary-700 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-48 bg-niger-orange/5 dark:bg-secondary-700 rounded-xl"></div>
            <div className="h-48 bg-niger-green/5 dark:bg-secondary-700 rounded-xl"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">
            Erreur de chargement
          </h3>
          <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
          <button 
            onClick={fetchDirectors}
            className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg hover:from-niger-orange-dark hover:to-niger-green-dark transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      );
    }

    if (!ministre && !sg && dgs.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
          <Users className="w-16 h-16 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-readable-muted dark:text-muted-foreground mb-4">
            L'équipe dirigeante n'est pas encore configurée.
          </p>
          <button 
            onClick={fetchDirectors}
            className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* Section Ministre */}
        {ministre && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                Cabinet du Ministre
              </h2>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Haute direction
              </div>
            </div>
            {renderMinisterSection()}
          </div>
        )}
        
        {/* Section Secrétariat Général */}
        {sg && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                Secrétariat Général
              </h2>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Administration centrale
              </div>
            </div>
            {renderSgSection()}
          </div>
        )}
        
        {/* Section Directions Générales */}
        {dgs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                Directions Générales
              </h2>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                {dgs.length} direction(s) générale(s)
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {dgs.map((dg, index) => (
                <div key={dg._id || index}>
                  {renderDirectionCard(dg, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Composant de recherche et filtres
  const renderSearchAndFilters = () => (
    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, titre ou direction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
          />
        </div>
        
        {/* Filtres */}
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
          >
            <option value="all">Tous</option>
            <option value="cabinet">Cabinet</option>
            <option value="dg">Directions Générales</option>
            <option value="direction">Directions</option>
          </select>
          
          <button
            onClick={exportOrganigramme}
            className="px-4 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={fetchDirectors}
            disabled={loading}
            className="px-4 py-3 bg-white dark:bg-secondary-700 border border-niger-orange/30 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-all duration-300 flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>
      
      {/* Statistiques */}
      {filteredDirectors.length !== allDirectors.length && (
        <div className="mt-4 text-sm text-readable-muted dark:text-muted-foreground">
          {filteredDirectors.length} résultat(s) sur {allDirectors.length} membres
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 min-h-screen transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center text-sm text-readable-muted dark:text-muted-foreground">
              <Link href="/" className="hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors">Accueil</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link href="/ministere" className="hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors">Le Ministère</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-niger-green dark:text-niger-green-light font-medium">Direction</span>
            </div>
            
            {/* Titre avec statistiques */}
            <div className="text-right">
              <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-1">
                Équipe Dirigeante
              </h1>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">
                {allDirectors.length} membres au total
              </p>
            </div>
          </div>
          
          {/* Recherche et filtres */}
          {!currentDirection && !currentSection && renderSearchAndFilters()}

          {currentDirection ? (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentDirection(null)}
                className="flex items-center text-niger-orange dark:text-niger-orange-light mb-6 hover:text-niger-orange-dark dark:hover:text-niger-orange transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              {renderDirectionCard(currentDirection)}
            </div>
          ) : currentSection ? (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentSection(null)}
                className="flex items-center text-niger-orange dark:text-niger-orange-light mb-6 hover:text-niger-orange-dark dark:hover:text-niger-orange transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  Directions sous {currentSection.titre}
                </h2>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">
                  {sousDirections[currentSection.key]?.length || 0} direction(s)
                </div>
              </div>
              {renderDirectionList(sousDirections[currentSection.key])}
            </div>
          ) : (
            <div>
              {/* Résultats de recherche */}
              {(searchTerm || filterType !== 'all') && renderSearchResults()}
              
              {/* Contenu principal (si pas de recherche active) */}
              {(!searchTerm && filterType === 'all') && renderMainContent()}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}