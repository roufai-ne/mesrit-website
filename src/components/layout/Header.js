// src/components/layout/Header.js
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GlobeIcon, SearchIcon, UserCircleIcon, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import NotificationBell from '@/components/communication/NotificationBell';

export default function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    // Obtenir le chemin actuel sans la locale
    const path = router.asPath;
    // Rediriger vers la même page avec la nouvelle locale
    router.push(path, path, { locale: newLocale });
  };

  // Direction du texte pour l'arabe
  const isRTL = router.locale === 'ar';
  // Fonction de recherche avec debounce
  // Dans votre Header.js
const searchContent = useCallback(
  debounce(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300),
  []
);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchContent(value);
  };

  const handleResultClick = (result) => {
    // Rediriger vers la page appropriée selon le type de résultat
    switch (result.type) {
      case 'news':
        router.push(`/actualites/${result._id}`);
        break;
      case 'document':
        router.push(`/documents/${result._id}`);
        break;
      default:
        router.push(result.url);
    }
    closeSearch();
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white relative">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <GlobeIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              <select className="bg-transparent text-sm focus:outline-none cursor-pointer group-hover:text-blue-200 transition-colors">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`transition-all duration-300 relative ${isSearchOpen ? 'w-64' : 'w-0'}`}>
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full bg-blue-700/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                  isSearchOpen ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-30">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      {result.type === 'news' && <SearchIcon className="w-4 h-4 text-blue-600" />}
                      {result.type === 'document' && <SearchIcon className="w-4 h-4 text-purple-600" />}
                      <div>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-gray-500">{result.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <SearchIcon className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Connexion</span>
            </button>
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}