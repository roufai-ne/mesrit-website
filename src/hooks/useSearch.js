// hooks/useSearch.js
// Logique de recherche extraite de Header.js — réutilisable dans SearchBar et CommandPalette
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

export const fallbackSearchData = [
  {
    _id: '1',
    title: "Bourses d'études 2024-2025",
    type: 'document',
    category: 'Bourses',
    url: '/bourses/2024-2025',
    description: "Informations sur les bourses disponibles pour l'année académique 2024-2025",
  },
  {
    _id: '2',
    title: 'Inscription en Master',
    type: 'news',
    category: 'Formations',
    url: '/formations/master',
    description: "Procédures d'inscription pour les programmes de Master",
  },
  {
    _id: '3',
    title: 'Résultats examens Licence',
    type: 'document',
    category: 'Résultats',
    url: '/resultats/licence',
    description: 'Publication des résultats des examens de Licence',
  },
  {
    _id: '4',
    title: "Programme de recherche en IA",
    type: 'news',
    category: 'Recherche',
    url: '/recherche/ia',
    description: 'Nouveau programme de recherche en Intelligence Artificielle',
  },
  {
    _id: '5',
    title: "Conférence internationale sur l'innovation",
    type: 'news',
    category: 'Événements',
    url: '/events/conference-innovation',
    description: "Conférence sur l'innovation technologique et la recherche",
  },
];

/**
 * Hook de recherche réutilisable.
 * @param {string} query        — terme de recherche
 * @param {number} [debounce]   — délai debounce en ms (défaut 300)
 * @returns {{ results, isSearching }}
 */
export function useSearch(query, debounce = 300) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performLocalSearch = useCallback((q) => {
    const lower = q.toLowerCase();
    setResults(
      fallbackSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.category.toLowerCase().includes(lower) ||
          item.description?.toLowerCase().includes(lower)
      )
    );
  }, []);

  const performSearch = useCallback(async (q) => {
    setIsSearching(true);
    try {
      const data = await secureApi.get(
        `/api/search?q=${encodeURIComponent(q)}&type=all&limit=8`,
        false
      );
      setResults(data.results || []);
    } catch {
      performLocalSearch(q);
    } finally {
      setIsSearching(false);
    }
  }, [performLocalSearch]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => performSearch(query), debounce);
    return () => clearTimeout(timer);
  }, [query, debounce, performSearch]);

  return { results, isSearching };
}
