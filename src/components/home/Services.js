import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import ServiceCard from './ServiceCard';

import { Button } from '@/components/ui/button';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapService } from '@/utils/strapiMapper';

export default function Services() {
  // Refactored with transparency and background pattern
  const { isDark } = useTheme();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'Tous' },
    { value: 'etudiants', label: 'Étudiants' },
    { value: 'etablissements', label: 'Établissements' },
    { value: 'recherche', label: 'Recherche' },
    { value: 'administration', label: 'Administration' },
    { value: 'formation', label: 'Formation' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.services, {
        sort: ['priority:desc', 'title:asc'],
        pagination: { limit: 100 }
      });
      const data = mapStrapiList(response, mapService);
      setServices(data);
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

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory]);

  const handleServiceClick = (service) => {
    if (service.url) {
      window.open(service.url, '_blank');
    }
  };

  const retry = () => {
    setError(null);
    fetchServices();
  };

  if (error) {
    return (
      <section className="py-12 text-center">
        <div className="container mx-auto px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={retry} variant="outline">Réessayer</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Arrière-plan avec gradient et motif (Inspiré de StatsSection) */}
      {/* Arrière-plan avec gradient et motif (Inspiré de StatsSection) - Très transparent */}
      <div
        className={clsx(
          'absolute inset-0',
          isDark
            ? 'bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-900/80'
            : 'bg-gradient-to-br from-blue-50/30 via-transparent to-orange-50/30'
        )}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header Section - Centré */}
        <div className="flex flex-col items-center text-center mb-12 gap-8">
          <div className="max-w-3xl">
            <h2 className={clsx(
              'text-3xl md:text-5xl font-bold mb-4',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Nos Services
            </h2>
            <p className={clsx(
              'text-lg md:text-xl',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}>
              Accédez aux outils et services du ministère pour faciliter vos démarches.
            </p>
          </div>

          {/* Search Bar - Centered */}
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={clsx(
                'h-5 w-5',
                isDark ? 'text-gray-500' : 'text-gray-400'
              )} />
            </div>
            <input
              type="text"
              className={clsx(
                'block w-full pl-12 pr-4 py-3 rounded-full border-2 text-base focus:outline-none transition-all backdrop-blur-md shadow-lg',
                isDark
                  ? 'bg-gray-800/40 border-gray-700/50 text-white placeholder-gray-500 focus:border-niger-orange/50 focus:bg-gray-800/60'
                  : 'bg-white/40 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:border-niger-orange focus:bg-white/60'
              )}
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Tabs - Clean Horizontal Scroll - Centered */}
        <div className="mb-12 flex justify-center">
          <div className="overflow-x-auto pb-2 scrollbar-hide max-w-full">
            <div className="flex space-x-2 px-4">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all backdrop-blur-sm',
                    selectedCategory === category.value
                      ? 'bg-niger-orange text-white shadow-md'
                      : isDark
                        ? 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                        : 'bg-white/60 text-gray-600 hover:bg-white/90 hover:text-gray-900 border border-gray-200/50'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={clsx(
                'h-64 rounded-2xl animate-pulse',
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              )} />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={handleServiceClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className={clsx('text-lg', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Aucun service ne correspond à votre recherche.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
              className="mt-4 text-niger-orange font-medium hover:underline"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
