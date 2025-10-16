// hooks/useNewsCache.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNewsCache = () => {
  const [cache, setCache] = useState(() => {
    if (typeof window === 'undefined') return {};
    
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
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const newCache = Object.fromEntries(
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

  const getCacheKey = useCallback((filter, page, search, status = 'published') => 
    `${filter}-${page}-${search}-${status}`, []);

  const fetchNews = useCallback(async (filter = 'all', page = 1, search = '', status = 'published') => {
    const cacheKey = getCacheKey(filter, page, search, status);

    // Vérifier le cache avant de faire la requête (avec protection contre race condition)
    const cachedEntry = cache[cacheKey];
    if (cachedEntry?.timestamp > Date.now() - CACHE_DURATION && !loading) {
      return cachedEntry.data;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 6,
        category: filter !== 'all' ? filter : '',
        search,
        status
      });

      // Utiliser secureApi à la place de fetch
      const data = await secureApi.get(`/api/news?${params}`, false); // public endpoint

      // Mise à jour du cache
      if (typeof window !== 'undefined') {
        const newCacheEntry = {
          data,
          timestamp: Date.now()
        };

        setCache(prevCache => {
          const newCache = { ...prevCache, [cacheKey]: newCacheEntry };
          localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
          return newCache;
        });
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cache, getCacheKey]);

  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    setCache({});
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const getCachedData = useCallback((filter, page, search, status = 'published') => {
    const cacheKey = getCacheKey(filter, page, search, status);
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