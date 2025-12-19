import React from 'react';
import { ExternalLink, ArrowRight, User, Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import Image from 'next/image';

export default function ServiceCard({ service, onClick }) {
  const { isDark } = useTheme();

  // Fonction pour obtenir l'icône dynamiquement (simplifiée)
  // Note: Dans une vraie appli, passez le composant icône directement si possible ou utilisez une map complète
  const renderIcon = (iconName) => {
    // Fallback simple ou map partielle si nécessaire.
    // Ici on suppose que le service contient peut-être déjà l'icône ou on affiche un placeholder
    return <span className="text-2xl">🔧</span>;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(service);
    } else if (service.url) {
      window.open(service.url, '_blank');
    }
  };

  // Mapping des couleurs de catégorie (Style subtil)
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'etudiants': return isDark ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100';
      case 'etablissements': return isDark ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-100';
      case 'recherche': return isDark ? 'bg-purple-900/30 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-100';
      case 'administration': return isDark ? 'bg-orange-900/30 text-orange-300 border-orange-800' : 'bg-orange-50 text-orange-700 border-orange-100';
      default: return isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={clsx(
        'group relative flex flex-col h-full rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border backdrop-blur-md',
        'hover:-translate-y-1 hover:shadow-xl',
        isDark
          ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/80'
          : 'bg-white/60 border-gray-200/60 hover:border-niger-orange/30 hover:bg-white/80'
      )}
    >
      {/* Badge de catégorie */}
      <div className={clsx(
        'absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border z-10',
        getCategoryStyle(service.category)
      )}>
        {service.category ? service.category.charAt(0).toUpperCase() + service.category.slice(1) : 'Service'}
      </div>

      {/* Image (Optionnelle) */}
      {service.image && (
        <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col flex-grow p-6">
        {/* Titre */}
        <h3 className={clsx(
          'text-lg font-bold mb-2 line-clamp-2 group-hover:text-niger-orange transition-colors',
          isDark ? 'text-white' : 'text-gray-900'
        )}>
          {service.title}
        </h3>

        {/* Description */}
        <p className={clsx(
          'text-sm line-clamp-3 mb-4 flex-grow',
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}>
          {service.description}
        </p>

        {/* Footer de la carte : Utilisateurs + Bouton Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {service.isPopular && <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />}
            {service.usageCount ? `${service.usageCount} utilisateurs` : ''}
          </div>

          <div
            className={clsx(
              'flex items-center text-sm font-semibold transition-colors',
              isDark ? 'text-niger-orange-light' : 'text-niger-orange'
            )}
          >
            <span className="mr-1 group-hover:underline">
              {service.isExternal ? 'Accéder' : 'Détails'}
            </span>
            {service.isExternal ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </div>
        </div>
      </div>
    </div>
  );
}
