// src/components/search/NewsFilters.js
import React, { useState } from 'react';
import { Calendar, Tag, Filter, X, ChevronDown } from 'lucide-react';

export default function NewsFilters({ 
  categories = [], 
  selectedCategory, 
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  showAdvanced = false,
  onToggleAdvanced
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateRangeChange = (type, value) => {
    onDateRangeChange({
      ...dateRange,
      [type]: value
    });
  };

  const clearFilters = () => {
    onCategoryChange('all');
    onDateRangeChange({ from: '', to: '' });
  };

  const hasActiveFilters = selectedCategory !== 'all' || dateRange.from || dateRange.to;

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-niger-orange" />
          <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
            Filtres de recherche
          </h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-niger-orange transition-colors"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>
      
      {/* Filtres par catégorie */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-niger-green" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégories</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                : 'bg-gray-100 dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 text-niger-green dark:text-niger-green-light'
            }`}
          >
            Toutes
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 text-niger-green dark:text-niger-green-light'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-secondary-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-niger-green" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Période</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Du
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Au
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour afficher/masquer les filtres avancés */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-secondary-700">
        <button
          onClick={onToggleAdvanced}
          className="flex items-center gap-2 text-sm text-niger-orange hover:text-niger-orange-dark transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          {showAdvanced ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés'}
        </button>
      </div>
    </div>
  );
}