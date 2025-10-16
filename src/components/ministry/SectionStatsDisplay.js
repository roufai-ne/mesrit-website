import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function SectionStatsDisplay({ sectionKey, stats, className = '' }) {
  // Ne rien afficher si pas de stats ou section désactivée
  if (!stats || !stats.enabled || !stats.stats || stats.stats.length === 0) {
    return null;
  }

  // Trier les statistiques par ordre
  const sortedStats = [...stats.stats].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Formater les valeurs numériques
  const formatValue = (value, unit = '') => {
    if (typeof value !== 'number') return value;
    
    let formattedValue;
    if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(1) + 'k';
    } else {
      formattedValue = value.toLocaleString('fr-FR');
    }
    
    return formattedValue + unit;
  };

  return (
    <div className={`mt-4 ${className}`}>
      <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-niger-cream/10 to-niger-orange/5 dark:from-secondary-700/50 dark:to-secondary-600/30 rounded-lg border border-niger-orange/10 dark:border-secondary-600">
        {sortedStats.slice(0, 3).map((stat) => (
          <div key={stat.id} className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-3 h-3 text-niger-orange mr-1" />
              <div className="text-lg font-bold text-niger-orange dark:text-niger-orange-light">
                {formatValue(stat.value, stat.unit)}
              </div>
            </div>
            <div className="text-xs text-readable-muted dark:text-muted-foreground font-medium capitalize leading-tight">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant d'exemple pour le développement
const SectionStatsExample = () => {
  const exampleStats = {
    enabled: true,
    stats: [
      { id: 'programs', label: 'Programmes', value: 25, unit: '', order: 1 },
      { id: 'partnerships', label: 'Partenariats', value: 12, unit: '', order: 2 },
      { id: 'initiatives', label: 'Initiatives', value: 8, unit: '', order: 3 }
    ]
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Exemple de statistiques</h3>
      <SectionStatsDisplay 
        sectionKey="mission" 
        stats={exampleStats} 
      />
    </div>
  );
};

SectionStatsExample.displayName = 'SectionStatsExample';
SectionStatsDisplay.Example = SectionStatsExample;