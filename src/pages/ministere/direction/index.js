// src/pages/ministere/direction/index.js
import { React, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Users, ChevronRight, ArrowLeft, Search, Mail, Phone,
  Building, Loader, RefreshCw, Download, Share2, Eye, Quote
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapDirector } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [allDirectors, setAllDirectors] = useState([]);
  const [showContactInfo, setShowContactInfo] = useState({});

  useEffect(() => { fetchDirectors(); }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.directors, {
        pagination: { limit: 100 },
        populate: ['photo']
      });
      const data = mapStrapiList(response, mapDirector);
      if (Array.isArray(data)) {
        setAllDirectors(data);
        setMinistre(data.find(d => d.key === 'Ministre'));
        setSg(data.find(d => d.key === 'SG'));
        setSga(data.find(d => d.key === 'SGA'));
        setDgs(data.filter(d => ['DGES', 'DGR'].includes(d.key)));
        const sousDir = data.reduce((acc, curr) => {
          if (curr.direction) {
            if (!acc[curr.direction]) acc[curr.direction] = [];
            acc[curr.direction].push(curr);
          }
          return acc;
        }, {});
        setSousDirections(sousDir);
      } else {
        setError('Format de données invalide');
        toast.error('Erreur de format des données');
      }
    } catch (error) {
      setError(error.message || 'Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleContactInfo = (directorId) => {
    setShowContactInfo(prev => ({ ...prev, [directorId]: !prev[directorId] }));
  };

  const shareDirectory = () => {
    if (navigator.share) {
      navigator.share({ title: 'Équipe dirigeante - MESRIT', text: "Découvrez l'équipe dirigeante du Ministère de l'Enseignement Supérieur", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  /* ── Minister Section ─────────────────────────────────────────────── */
  const renderMinisterSection = () => {
    if (!ministre) return null;
    return (
      <div className="rounded-2xl overflow-hidden shadow-2xl">
        {/* Photo as full-width background */}
        <div className="relative min-h-[480px] sm:min-h-[540px]">
          <Image
            src={ministre.photo || '/images/dir/default.jpeg'}
            alt={ministre.nom}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Content over photo */}
          <div className="relative z-10 h-full flex flex-col md:flex-row items-end md:items-center gap-8 p-6 sm:p-10 md:p-14">

            {/* Left: identity card */}
            <div className="flex-shrink-0">
              {/* Portrait badge */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-niger-orange shadow-2xl mx-auto md:mx-0">
                <Image
                  src={ministre.photo || '/images/dir/default.jpeg'}
                  alt={ministre.nom}
                  fill
                  className="object-cover object-top"
                  sizes="192px"
                />
              </div>
              <div className="mt-4 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-niger-orange text-white text-xs font-semibold mb-2">
                  Ministre
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{ministre.titre}</h2>
                <p className="text-niger-cream/90 font-medium mt-1">{ministre.nom}</p>
                {(ministre.email || ministre.telephone) && (
                  <div className="mt-3 space-y-1">
                    {ministre.email && (
                      <div className="flex items-center gap-2 text-white/70 text-sm justify-center md:justify-start">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{ministre.email}</span>
                      </div>
                    )}
                    {ministre.telephone && (
                      <div className="flex items-center gap-2 text-white/70 text-sm justify-center md:justify-start">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{ministre.telephone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: message */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-niger-orange/90 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Quote className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Message du Ministre</h3>
              </div>
              <blockquote className="text-white/90 italic leading-relaxed text-base sm:text-lg text-justify">
                {ministre.message || "Message du ministre non disponible pour le moment. Veuillez consulter ultérieurement."}
              </blockquote>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => toggleContactInfo(ministre._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange/90 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  {showContactInfo[ministre._id] ? 'Masquer' : 'Contact'}
                </button>
                <button
                  onClick={shareDirectory}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm border border-white/30"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Direction cards ────────────────────────────────────────────── */
  const renderDirectionCard = (data, showDirections = false) => {
    if (!data) return null;
    const showContact = showContactInfo[data._id];
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image src={data.photo || '/images/dir/default.jpeg'} alt={data.nom} fill
              className="rounded-full object-cover border-4 border-niger-orange/20" sizes="128px" />
            {data.key && (
              <div className="absolute -top-2 -right-2 bg-niger-orange p-2 rounded-full shadow-lg">
                <Building className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-grow ml-8">
            <div className="bg-niger-orange inline-block px-4 py-2 rounded-full mb-3 shadow-sm">
              <span className="text-white text-sm font-medium">{data.key || 'Direction'}</span>
            </div>
            <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-2">{data.titre}</h2>
            <p className="text-xl text-readable dark:text-foreground mb-2">{data.nom}</p>
            {data.mission && (
              <p className="text-sm text-readable-muted dark:text-muted-foreground italic">{data.mission}</p>
            )}
          </div>
        </div>
        {showContact && (data.email || data.telephone) && (
          <div className="mt-4 p-4 bg-niger-orange/5 dark:bg-secondary-700 rounded-lg border border-niger-orange/20">
            <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">Contact</h4>
            <div className="space-y-2">
              {data.email && (
                <div className="flex items-center gap-2 text-readable-muted dark:text-muted-foreground">
                  <Mail className="w-4 h-4 text-niger-orange" /><span className="text-sm">{data.email}</span>
                </div>
              )}
              {data.telephone && (
                <div className="flex items-center gap-2 text-readable-muted dark:text-muted-foreground">
                  <Phone className="w-4 h-4 text-niger-orange" /><span className="text-sm">{data.telephone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {(data.email || data.telephone) && (
            <button onClick={() => toggleContactInfo(data._id)}
              className="flex-1 bg-niger-orange/10 dark:bg-niger-orange/20 text-niger-orange px-3 py-2 rounded-lg hover:bg-niger-orange/20 transition-all duration-300 text-sm font-medium">
              {showContact ? 'Masquer contact' : 'Voir contact'}
            </button>
          )}
        </div>
        {showDirections && sousDirections[data.key]?.length > 0 && (
          <button onClick={() => setCurrentSection(data)}
            className="absolute bottom-0 left-0 right-0 bg-niger-orange text-white px-6 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-b-xl font-medium hover:bg-niger-orange-dark">
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
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image src={data.photo || '/images/dir/default.jpeg'} alt={data.nom} fill
              className="rounded-full object-cover border-2 border-niger-orange/30" sizes="80px" />
          </div>
          <div className="flex-grow ml-4">
            <div className="bg-niger-orange/90 inline-block px-3 py-1 rounded-full mb-2">
              <span className="text-white text-sm font-medium">{data.key || 'Direction'}</span>
            </div>
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">{data.titre}</h3>
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
        <div className="md:col-span-2">{renderDirectionCard(sg, true)}</div>
        <div>{renderSgaCard(sga)}</div>
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
          <div key={direction.id || index} onClick={() => setCurrentDirection(direction)}
            className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-niger-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-niger-green dark:text-niger-green-light">
                    {direction.nomComplet || direction.titre}
                  </h3>
                  {direction.responsable && (
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">Responsable: {direction.responsable}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-niger-orange" />
            </div>
            {direction.mission && (
              <div className="mt-4 p-3 bg-niger-orange/5 dark:bg-secondary-700 rounded-lg">
                <p className="text-sm text-readable-muted dark:text-muted-foreground italic">{direction.mission}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!searchTerm && filterType === 'all') return null;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Résultats de recherche</h2>
          <button onClick={() => { setSearchTerm(''); setFilterType('all'); }}
            className="text-niger-orange hover:text-niger-orange-dark transition-colors text-sm">
            Effacer les filtres
          </button>
        </div>
        {filteredDirectors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
            <Search className="w-12 h-12 mx-auto mb-4 text-readable-muted opacity-50" />
            <p className="text-readable-muted dark:text-muted-foreground">Aucun résultat pour "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDirectors.map((director, index) => (
              <div key={director._id || index}>{renderDirectionCard(director, false)}</div>
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
            <div className="h-[400px] bg-niger-orange/10 dark:bg-secondary-700 rounded-xl" />
            <div className="h-[400px] bg-niger-green/10 dark:bg-secondary-700 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-48 bg-niger-orange/5 dark:bg-secondary-700 rounded-xl" />
            <div className="h-48 bg-niger-green/5 dark:bg-secondary-700 rounded-xl" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
          <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">Erreur de chargement</h3>
          <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
          <button onClick={fetchDirectors}
            className="bg-niger-orange text-white px-6 py-3 rounded-lg hover:bg-niger-orange-dark transition-all duration-300 shadow-lg font-medium flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      );
    }

    if (!ministre && !sg && dgs.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
          <Users className="w-16 h-16 mx-auto mb-4 text-readable-muted opacity-50" />
          <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">Aucune donnée disponible</h3>
          <p className="text-readable-muted dark:text-muted-foreground mb-4">L'équipe dirigeante n'est pas encore configurée.</p>
          <button onClick={fetchDirectors}
            className="bg-niger-orange text-white px-6 py-3 rounded-lg hover:bg-niger-orange-dark transition-all duration-300 font-medium flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {ministre && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Cabinet du Ministre</h2>
              <span className="text-sm text-readable-muted dark:text-muted-foreground">Haute direction</span>
            </div>
            {renderMinisterSection()}
          </div>
        )}
        {sg && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Secrétariat Général</h2>
              <span className="text-sm text-readable-muted dark:text-muted-foreground">Administration centrale</span>
            </div>
            {renderSgSection()}
          </div>
        )}
        {dgs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Directions Générales</h2>
              <span className="text-sm text-readable-muted dark:text-muted-foreground">{dgs.length} direction(s) générale(s)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {dgs.map((dg, index) => <div key={dg._id || index}>{renderDirectionCard(dg, true)}</div>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSearchAndFilters = () => (
    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-niger-orange w-5 h-5" />
          <input type="text" placeholder="Rechercher par nom, titre ou direction..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground" />
        </div>
        <div className="flex gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground">
            <option value="all">Tous</option>
            <option value="cabinet">Cabinet</option>
            <option value="dg">Directions Générales</option>
            <option value="direction">Directions</option>
          </select>
          <button onClick={fetchDirectors} disabled={loading}
            className="px-4 py-3 bg-white dark:bg-secondary-700 border border-niger-orange/30 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-all duration-300 flex items-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>
      {filteredDirectors.length !== allDirectors.length && (
        <div className="mt-4 text-sm text-readable-muted dark:text-muted-foreground">
          {filteredDirectors.length} résultat(s) sur {allDirectors.length} membres
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <SeoHead title="Direction et encadrement" description="Présentation de la direction et des cadres du Ministère de l'Enseignement Supérieur du Niger." url="/ministere/direction" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/ministere" className="hover:opacity-100 transition-opacity">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Direction</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Équipe Dirigeante</h1>
              <p className="text-white/80 mt-1">
                {allDirectors.length > 0 ? `${allDirectors.length} membre${allDirectors.length > 1 ? 's' : ''} de l'équipe` : "Direction du Ministère de l'Enseignement Supérieur"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-4">
          {!currentDirection && !currentSection && renderSearchAndFilters()}

          {currentDirection ? (
            <div className="space-y-6">
              <button onClick={() => setCurrentDirection(null)}
                className="flex items-center text-niger-orange hover:text-niger-orange-dark transition-colors font-medium mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              {renderDirectionCard(currentDirection)}
            </div>
          ) : currentSection ? (
            <div className="space-y-6">
              <button onClick={() => setCurrentSection(null)}
                className="flex items-center text-niger-orange hover:text-niger-orange-dark transition-colors font-medium mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  Directions sous {currentSection.titre}
                </h2>
                <span className="text-sm text-readable-muted dark:text-muted-foreground">
                  {sousDirections[currentSection.key]?.length || 0} direction(s)
                </span>
              </div>
              {renderDirectionList(sousDirections[currentSection.key])}
            </div>
          ) : (
            <div>
              {(searchTerm || filterType !== 'all') && renderSearchResults()}
              {(!searchTerm && filterType === 'all') && renderMainContent()}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}
