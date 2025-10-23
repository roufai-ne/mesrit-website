import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import ServiceCard from './ServiceCard';

import { secureApi, useApiAction } from '@/lib/secureApi';
import { Button } from '@/components/ui/button';

export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  
  const { isDark } = useTheme();
  const { execute } = useApiAction();

  const categories = [
    { value: '', label: 'Toutes', color: 'bg-gray-500' },
    { value: 'etudiants', label: 'Étudiants', color: 'bg-blue-500' },
    { value: 'etablissements', label: 'Établissements', color: 'bg-green-500' },
    { value: 'recherche', label: 'Recherche', color: 'bg-purple-500' },
    { value: 'administration', label: 'Administration', color: 'bg-orange-500' },
    { value: 'formation', label: 'Formation', color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      await execute(async () => {
        const data = await secureApi.get('/api/services', false);
        
        if (data && data.services) {
          setServices(data.services);
        } else {
          throw new Error('Format de données invalide');
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      setError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (showPopularOnly) {
      filtered = filtered.filter(service => service.isPopular);
    }
    
    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, showPopularOnly]);

  const handleServiceClick = (service) => {
    if (service.url) {
      window.open(service.url, '_blank');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowPopularOnly(false);
  };

  const retry = () => {
    setError(null);
    fetchServices();
  };

  if (error) {
    return (
      <section className={clsx(
        'py-20',
        isDark 
          ? 'bg-gradient-to-b from-niger-green-glass to-niger-orange-glass' 
          : 'bg-gray-50'
      )}>
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="w-16 h-16 mx-auto" />
          </div>
          <h3 className={clsx(
            'text-xl font-semibold mb-2',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Erreur de chargement</h3>
          <p className={clsx(
            'mb-4',
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>{error}</p>
          <Button onClick={retry} variant="outline">
            Réessayer
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 lg:px-6">
        {/* En-tête de la section */}
        <div className="text-center mb-12">
          <h2 className={clsx(
            'text-4xl font-bold mb-4',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Nos Services
          </h2>
          <p className={clsx(
            'text-lg max-w-3xl mx-auto',
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>
            Découvrez tous les services mis à votre disposition par le ministère
          </p>
        </div>

        {/* Filtres et recherche - Redesign moderne */}
        <div className={clsx(
          'mb-8 rounded-3xl border backdrop-blur-md overflow-hidden shadow-xl',
          isDark
            ? 'bg-gradient-to-br from-niger-white-glass/10 to-niger-white-glass/5 border-niger-orange/20'
            : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200'
        )}>
          {/* Barre de recherche principale */}
          <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="relative max-w-2xl mx-auto">
              <Search className={clsx(
                'absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5',
                isDark ? 'text-niger-orange-light' : 'text-niger-orange'
              )} />
              <input
                type="text"
                placeholder="Rechercher un service par nom, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={clsx(
                  'w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 text-base',
                  'focus:outline-none focus:ring-4 focus:ring-niger-orange/20',
                  isDark
                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-niger-orange focus:bg-gray-800/70'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-niger-orange focus:bg-white shadow-sm'
                )}
              />
            </div>
          </div>

          {/* Section des filtres */}
          <div className="p-5 space-y-3">
            {/* Titre de section */}
            <div className="flex items-center justify-between mb-2">
              <h4 className={clsx(
                'text-sm font-semibold uppercase tracking-wide',
                isDark ? 'text-gray-400' : 'text-gray-600'
              )}>
                <Filter className="w-4 h-4 inline mr-2" />
                Filtrer par catégorie
              </h4>
              {(searchTerm || selectedCategory || showPopularOnly) && (
                <button
                  onClick={resetFilters}
                  className={clsx(
                    'text-xs font-medium px-3 py-1 rounded-full transition-all duration-300',
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Filtres de catégorie - Layout mobile-first */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={clsx(
                    'group relative px-3 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300',
                    'border-2 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap',
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-niger-orange to-niger-orange-dark text-white border-niger-orange shadow-lg scale-105'
                      : isDark
                        ? 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/60 hover:border-niger-orange/50 hover:scale-105'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-niger-orange/40 hover:shadow-md hover:scale-105'
                  )}
                >
                  <span className={clsx(
                    'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all flex-shrink-0',
                    selectedCategory === category.value
                      ? 'bg-white'
                      : category.color
                  )} />
                  <span className="truncate">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Bouton Populaires */}
            <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 mt-1">
              <button
                onClick={() => setShowPopularOnly(!showPopularOnly)}
                className={clsx(
                  'group px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300',
                  'border-2 flex items-center justify-center gap-2 w-full sm:w-auto',
                  showPopularOnly
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-500 shadow-lg'
                    : isDark
                      ? 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/60 hover:border-yellow-500/50'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:shadow-md'
                )}
              >
                <Star className={clsx(
                  'w-4 h-4 transition-transform group-hover:rotate-12 flex-shrink-0',
                  showPopularOnly && 'fill-current'
                )} />
                <span>Services populaires</span>
                {showPopularOnly && filteredServices.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {filteredServices.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Grille des services */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={clsx(
                  'rounded-3xl h-96 backdrop-blur-md border shadow-xl',
                  isDark
                    ? 'bg-gradient-to-br from-niger-white-glass/20 to-niger-white-glass/10 border-niger-orange/20'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-200'
                )} />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className={clsx(
            'text-center py-20 rounded-3xl border backdrop-blur-md',
            isDark
              ? 'bg-niger-white-glass/10 border-niger-orange/20'
              : 'bg-gray-50 border-gray-200'
          )}>
            <div className={clsx(
              'text-6xl mb-6',
              isDark ? 'text-gray-600' : 'text-gray-300'
            )}>🔍</div>
            <h3 className={clsx(
              'text-2xl font-bold mb-3',
              isDark ? 'text-white' : 'text-gray-900'
            )}>Aucun service trouvé</h3>
            <p className={clsx(
              'mb-6 text-lg max-w-md mx-auto',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}>
              Essayez de modifier vos critères de recherche ou de réinitialiser les filtres
            </p>
            <Button
              onClick={resetFilters}
              className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onClick={handleServiceClick}
              />
            ))}
          </div>
        )}

        {/* Call-to-action */}
        <div className="text-center mt-16">
          <p className={clsx(
            'text-lg mb-6',
            isDark ? 'text-white/80' : 'text-gray-600'
          )}>
            Vous ne trouvez pas le service que vous cherchez ?
          </p>
          <Button
            onClick={() => window.location.href = '/contact'}
            size="lg"
            className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #228b22 100%)'
            }}
          >
            Contactez-nous
          </Button>
        </div>
      </div>
    </section>
  );
}
