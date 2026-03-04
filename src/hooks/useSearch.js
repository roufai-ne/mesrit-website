// hooks/useSearch.js
// Logique de recherche extraite de Header.js — réutilisable dans SearchBar et CommandPalette
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

const fallbackSearchData = [];

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
