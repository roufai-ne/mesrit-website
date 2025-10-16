import React from 'react';
import { ExternalLink, ArrowRight, Star, Users, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import Image from 'next/image';

export default function ServiceCard({ service, onClick, showFeatures = false }) {
  const { isDark } = useTheme();
  
  // Fonction pour obtenir l'icône dynamiquement
  const getIcon = (iconName) => {
    // Import dynamique des icônes Lucide
    const iconMap = {
      'Settings': '⚙️',
      'GraduationCap': '🎓',
      'Users': '👥',
      'FileText': '📄',
      'Search': '🔍',
      'BookOpen': '📚',
      'Award': '🏆',
      'Calendar': '📅',
      'Mail': '✉️',
      'Phone': '📞',
      'MapPin': '📍',
      'Globe': '🌐',
      'Database': '💾',
      'Shield': '🛡️',
      'TrendingUp': '📈',
      'Lightbulb': '💡'
    };
    
    return iconMap[iconName] || '🔧';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(service);
    } else if (service.url) {
      window.open(service.url, '_blank');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      etudiants: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
      etablissements: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      recherche: isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200',
      administration: isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200',
      formation: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[category] || colors.administration;
  };

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer',
        'backdrop-blur-md shadow-lg hover:shadow-2xl',
        isDark 
          ? 'bg-niger-white-glass/30 border-niger-orange/20 hover:border-niger-orange/40 hover:bg-niger-white-glass/50' 
          : 'bg-white border-gray-200 hover:border-niger-orange/30 hover:shadow-xl'
      )}
      onClick={handleCardClick}
    >
      {/* Badge de catégorie */}
      <div className={clsx(
        'absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border',
        getCategoryColor(service.category)
      )}>
        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
      </div>

      {/* Badge populaire */}
      {service.isPopular && (
        <div className="absolute top-4 left-4">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
        </div>
      )}

      {/* Image du service */}
      {service.image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className={clsx(
            'absolute inset-0 bg-gradient-to-t',
            isDark ? 'from-black/60 to-transparent' : 'from-black/40 to-transparent'
          )} />
        </div>
      )}

      {/* Contenu du service */}
      <div className="p-6">
        {/* Icône et titre */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={clsx(
            'flex-shrink-0 p-3 rounded-xl text-2xl border-2',
            isDark 
              ? 'bg-niger-white-glass/50 border-niger-orange/30' 
              : 'bg-gray-50 border-gray-200'
          )}>
            {getIcon(service.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={clsx(
              'text-xl font-bold mb-2 line-clamp-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {service.title}
            </h3>
            <p className={clsx(
              'text-sm leading-relaxed line-clamp-3',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}>
              {service.description}
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{service.usageCount || 0} utilisateurs</span>
          </div>
          {service.isExternal && (
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>Externe</span>
            </div>
          )}
        </div>

        {/* Features (si demandées) */}
        {showFeatures && service.features && service.features.length > 0 && (
          <div className="mb-4">
            <h4 className={clsx(
              'text-sm font-semibold mb-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Fonctionnalités :
            </h4>
            <div className="space-y-2">
              {service.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-niger-orange mt-2 flex-shrink-0" />
                  <div>
                    <div className={clsx(
                      'text-xs font-medium',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {feature.title}
                    </div>
                    <div className={clsx(
                      'text-xs',
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <div className={clsx(
          'flex items-center justify-between p-3 rounded-xl transition-all duration-300',
          isDark 
            ? 'bg-niger-orange/20 border border-niger-orange/30 group-hover:bg-niger-orange/30' 
            : 'bg-gray-50 border border-gray-200 group-hover:bg-niger-orange/10 group-hover:border-niger-orange/30'
        )}>
          <span className={clsx(
            'text-sm font-semibold',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            {service.isExternal ? 'Accéder au service' : 'Voir les détails'}
          </span>
          <ArrowRight className={clsx(
            'w-4 h-4 transition-transform duration-300',
            isDark ? 'text-niger-orange-light' : 'text-niger-orange',
            'group-hover:translate-x-1'
          )} />
        </div>
      </div>

      {/* Effet de brillance au hover */}
      <div className={clsx(
        'absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none',
        'bg-gradient-to-r from-transparent via-white/10 to-transparent',
        'group-hover:opacity-100'
      )} />
    </div>
  );
}
