// hooks/useNewsCache.js
import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNewsCache = () => {
  const [cache, setCache] = useState(() => {
    try {
      const savedCache = localStorage.getItem(CACHE_KEY);
      return savedCache ? JSON.parse(savedCache) : {};
    } catch {
      return {};
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nettoyage du cache en une seule fois au montage
  useEffect(() => {
    const now = Date.now();
    const newCache = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(cache).filter(([_, { timestamp }]) => 
        timestamp > now - CACHE_DURATION
      )
    );

    const hasChanged = Object.keys(newCache).length !== Object.keys(cache).length;
  
    if (hasChanged) {
      setCache(newCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    }
  }, []); // Only runs on mount

  const getCacheKey = useCallback((filter, page, search) => 
    `${filter}-${page}-${search}`, []);

  const fetchNews = useCallback(async (filter = 'all', page = 1, search = '') => {
    const cacheKey = getCacheKey(filter, page, search);

    // Vérifier le cache avant de faire la requête
    if (cache[cacheKey]?.timestamp > Date.now() - CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 6,
        category: filter !== 'all' ? filter : '',
        search
      });

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des actualités');

      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);

      // Mise à jour du cache
      const newCacheEntry = {
        data,
        timestamp: Date.now()
      };

      setCache(prevCache => {
        const newCache = { ...prevCache, [cacheKey]: newCacheEntry };
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
        return newCache;
      });

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cache, getCacheKey]);

  const clearCache = useCallback(() => {
    setCache({});
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const getCachedData = useCallback((filter, page, search) => {
    const cacheKey = getCacheKey(filter, page, search);
    return cache[cacheKey]?.data;
  }, [cache, getCacheKey]);

  return {
    fetchNews,
    clearCache,
    getCachedData,
    loading,
    error
  };
};