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
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* En-tête de la section */}
        <div className="text-center mb-16">
          <h2 className={clsx(
            'text-4xl font-bold mb-4',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Nos Services</h2>
          <p className={clsx(
            'text-lg max-w-3xl mx-auto mb-6',
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>
            Découvrez tous les services mis à votre disposition par le ministère
          </p>
          

        </div>

        {/* Filtres et recherche */}
        <div className={clsx(
          'mb-8 p-6 rounded-2xl border-2 backdrop-blur-md',
          isDark 
            ? 'bg-niger-white-glass/20 border-niger-orange/20' 
            : 'bg-gray-50 border-gray-200'
        )}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Barre de recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className={clsx(
                  'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )} />
                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clsx(
                    'w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300',
                    'focus:outline-none focus:ring-4',
                    isDark 
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-niger-orange focus:ring-niger-orange/20' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-niger-orange focus:ring-niger-orange/20'
                  )}
                />
              </div>
            </div>

            {/* Filtres de catégorie */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-2',
                    selectedCategory === category.value
                      ? 'bg-niger-orange text-white border-niger-orange shadow-lg'
                      : isDark
                        ? 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowPopularOnly(!showPopularOnly)}
                variant={showPopularOnly ? "default" : "outline"}
                size="sm"
                className={clsx(
                  'flex items-center space-x-2',
                  showPopularOnly && 'bg-niger-orange hover:bg-niger-orange/90'
                )}
              >
                <Star className="w-4 h-4" />
                <span>Populaires</span>
              </Button>
            </div>
          </div>

          {/* Bouton de réinitialisation */}
          {(searchTerm || selectedCategory || showPopularOnly) && (
            <div className="mt-4 text-center">
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
                className={clsx(
                  'text-sm',
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Grille des services */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={clsx(
                  'rounded-2xl h-80 backdrop-blur-md border-2',
                  isDark 
                    ? 'bg-niger-white-glass/30 border-niger-orange/20' 
                    : 'bg-gray-100 border-gray-200'
                )} />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className={clsx(
              'text-6xl mb-4',
              isDark ? 'text-gray-600' : 'text-gray-300'
            )}>🔍</div>
            <h3 className={clsx(
              'text-xl font-semibold mb-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}>Aucun service trouvé</h3>
            <p className={clsx(
              'mb-4',
              isDark ? 'text-white/70' : 'text-gray-500'
            )}>
              Essayez de modifier vos critères de recherche ou de réinitialiser les filtres
            </p>
            <Button onClick={resetFilters} variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
