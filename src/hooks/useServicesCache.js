// hooks/useServicesCache.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

const CACHE_KEY = 'services_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (plus long car les services changent moins souvent)

export const useServicesCache = () => {
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

  const getCacheKey = useCallback((category, search, popular) => 
    `${category || 'all'}-${search || ''}-${popular || false}`, []);

  const fetchServices = useCallback(async (category = '', search = '', popular = false) => {
    const cacheKey = getCacheKey(category, search, popular);

    // Vérifier le cache avant de faire la requête
    if (cache[cacheKey]?.timestamp > Date.now() - CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (popular) params.append('popular', 'true');

      // Utiliser secureApi pour les services publics
      const data = await secureApi.get(`/api/services?${params}`, false); // public endpoint

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

  const getCachedData = useCallback((category, search, popular) => {
    const cacheKey = getCacheKey(category, search, popular);
    return cache[cacheKey]?.data;
  }, [cache, getCacheKey]);

  // Fonction pour invalider le cache lors de modifications
  const invalidateCache = useCallback((category = null) => {
    if (typeof window === 'undefined') return;
    
    if (category) {
      // Invalider seulement les entrées de cette catégorie
      const newCache = Object.fromEntries(
        Object.entries(cache).filter(([key]) => !key.startsWith(category))
      );
      setCache(newCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    } else {
      // Invalider tout le cache
      clearCache();
    }
  }, [cache, clearCache]);

  return {
    fetchServices,
    clearCache,
    getCachedData,
    invalidateCache,
    loading,
    error
  };
};