// src/components/search/NewsSearchBar.js
import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Tag } from 'lucide-react';
import { secureApi } from '@/lib/secureApi';

export default function NewsSearchBar({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Rechercher une actualité...",
  enableSuggestions = true,
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce pour les suggestions
  useEffect(() => {
    if (!value || value.length < 2 || !enableSuggestions) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await secureApi.get(`/api/search/autocomplete?q=${encodeURIComponent(value)}&type=news`, false);
        setSuggestions(response.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur autocomplétion:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, enableSuggestions]);

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    if (onSearch) {
      onSearch('');
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'title':
        return <Calendar className="w-4 h-4 text-niger-orange" />;
      case 'category':
        return <Tag className="w-4 h-4 text-niger-green" />;
      case 'content':
        return <Search className="w-4 h-4 text-gray-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={searchRef}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full pl-12 pr-16 py-4 rounded-xl border border-niger-white/20 focus:ring-2 focus:ring-niger-white focus:border-niger-white transition-all duration-300 bg-niger-white/10 backdrop-blur-sm text-white placeholder-niger-cream/70 text-lg"
          autoComplete="off"
        />
        
        {/* Icône de recherche */}
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-niger-cream w-5 h-5" />
        
        {/* Indicateur de chargement ou bouton clear */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-niger-cream"></div>
          ) : value ? (
            <button
              onClick={clearSearch}
              className="text-niger-cream hover:text-white transition-colors"
              title="Effacer la recherche"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-gray-200 dark:border-secondary-600 z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-100 dark:border-secondary-700">
              Suggestions de recherche
            </div>
            
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors text-left"
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.context && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.context}
                    </div>
                  )}
                </div>
                {suggestion.count && (
                  <div className="text-xs text-gray-400 bg-gray-100 dark:bg-secondary-600 px-2 py-1 rounded-full">
                    {suggestion.count}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}