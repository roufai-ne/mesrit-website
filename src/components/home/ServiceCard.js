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
        'group relative overflow-hidden rounded-3xl border transition-all duration-500 transform hover:-translate-y-2 cursor-pointer',
        'backdrop-blur-md shadow-xl hover:shadow-2xl',
        isDark
          ? 'bg-gradient-to-br from-niger-white-glass/20 to-niger-white-glass/10 border-niger-orange/20 hover:border-niger-orange/50 hover:from-niger-white-glass/30 hover:to-niger-white-glass/20'
          : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200 hover:border-niger-orange/40 hover:shadow-niger-orange/10'
      )}
      onClick={handleCardClick}
    >
      {/* Badge de catégorie - Repositionné */}
      <div className={clsx(
        'absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-sm z-10',
        'shadow-lg',
        getCategoryColor(service.category)
      )}>
        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
      </div>

      {/* Badge populaire - Style amélioré */}
      {service.isPopular && (
        <div className="absolute top-4 left-4 z-10">
          <div className="relative">
            <Star className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse" />
          </div>
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
        <div className="flex items-start space-x-4 mb-5">
          <div className={clsx(
            'flex-shrink-0 p-4 rounded-2xl text-3xl border-2 shadow-lg transition-all duration-300',
            'group-hover:scale-110 group-hover:rotate-3',
            isDark
              ? 'bg-gradient-to-br from-niger-orange/20 to-niger-green/20 border-niger-orange/40'
              : 'bg-gradient-to-br from-niger-orange/10 to-niger-green/10 border-niger-orange/30'
          )}>
            {getIcon(service.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={clsx(
              'text-xl font-bold mb-2 line-clamp-2 group-hover:text-niger-orange transition-colors',
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
        <div className={clsx(
          'flex items-center justify-between mb-5 text-xs p-3 rounded-xl',
          isDark ? 'bg-gray-800/30' : 'bg-gray-50'
        )}>
          <div className="flex items-center space-x-2">
            <Users className={clsx(
              'w-4 h-4',
              isDark ? 'text-niger-orange-light' : 'text-niger-orange'
            )} />
            <span className={clsx(
              'font-medium',
              isDark ? 'text-gray-300' : 'text-gray-700'
            )}>
              {service.usageCount || 0} utilisateurs
            </span>
          </div>
          {service.isExternal && (
            <div className="flex items-center space-x-1">
              <ExternalLink className={clsx(
                'w-4 h-4',
                isDark ? 'text-blue-400' : 'text-blue-600'
              )} />
              <span className={clsx(
                'font-medium',
                isDark ? 'text-blue-400' : 'text-blue-600'
              )}>
                Externe
              </span>
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

        {/* Bouton d'action - Style moderne */}
        <div className="relative">
          <div className={clsx(
            'flex items-center justify-between p-4 rounded-2xl transition-all duration-300',
            'border-2 shadow-md group-hover:shadow-xl',
            isDark
              ? 'bg-gradient-to-r from-niger-orange/20 to-niger-green/20 border-niger-orange/40 group-hover:from-niger-orange/30 group-hover:to-niger-green/30 group-hover:border-niger-orange/60'
              : 'bg-gradient-to-r from-niger-orange/10 to-niger-green/10 border-niger-orange/30 group-hover:from-niger-orange/20 group-hover:to-niger-green/20 group-hover:border-niger-orange/50'
          )}>
            <span className={clsx(
              'text-sm font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {service.isExternal ? 'Accéder au service' : 'Voir les détails'}
            </span>
            <div className="flex items-center gap-2">
              {service.isExternal && (
                <ExternalLink className={clsx(
                  'w-4 h-4',
                  isDark ? 'text-niger-orange-light' : 'text-niger-orange'
                )} />
              )}
              <ArrowRight className={clsx(
                'w-5 h-5 transition-all duration-300',
                isDark ? 'text-niger-orange-light' : 'text-niger-orange',
                'group-hover:translate-x-2 group-hover:scale-110'
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Effet de brillance au hover - Amélioré */}
      <div className={clsx(
        'absolute inset-0 opacity-0 transition-opacity duration-700 pointer-events-none',
        'bg-gradient-to-r from-transparent via-white/20 to-transparent',
        'group-hover:opacity-100 group-hover:animate-shimmer'
      )} />

      {/* Effet de bordure animée */}
      <div className={clsx(
        'absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500',
        'bg-gradient-to-r from-niger-orange via-niger-green to-niger-orange bg-[length:200%_100%]',
        'group-hover:opacity-20 group-hover:animate-gradient'
      )} style={{ padding: '2px', margin: '-2px' }} />
    </div>
  );
}
