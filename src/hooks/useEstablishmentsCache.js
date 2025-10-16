// hooks/useEstablishmentsCache.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

const CACHE_KEY = 'establishments_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (les établissements changent rarement)

export const useEstablishmentsCache = () => {
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

  const getCacheKey = useCallback((region, type, search) => 
    `${region || 'all'}-${type || 'all'}-${search || ''}`, []);

  const fetchEstablishments = useCallback(async (region = '', type = '', search = '') => {
    const cacheKey = getCacheKey(region, type, search);

    // Vérifier le cache avant de faire la requête
    if (cache[cacheKey]?.timestamp > Date.now() - CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (region) params.append('region', region);
      if (type) params.append('type', type);
      if (search) params.append('search', search);

      // Utiliser secureApi pour les établissements publics
      const data = await secureApi.get(`/api/establishments?${params}`, false); // public endpoint

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

  const getCachedData = useCallback((region, type, search) => {
    const cacheKey = getCacheKey(region, type, search);
    return cache[cacheKey]?.data;
  }, [cache, getCacheKey]);

  // Fonction pour invalider le cache lors de modifications
  const invalidateCache = useCallback((region = null) => {
    if (typeof window === 'undefined') return;
    
    if (region) {
      // Invalider seulement les entrées de cette région
      const newCache = Object.fromEntries(
        Object.entries(cache).filter(([key]) => !key.startsWith(region))
      );
      setCache(newCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    } else {
      // Invalider tout le cache
      clearCache();
    }
  }, [cache, clearCache]);

  // Fonction spéciale pour récupérer un établissement par ID
  const fetchEstablishmentById = useCallback(async (id) => {
    const cacheKey = `single_${id}`;

    // Vérifier le cache avant de faire la requête
    if (cache[cacheKey]?.timestamp > Date.now() - CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    setLoading(true);
    try {
      const data = await secureApi.get(`/api/establishments/${id}`, false);

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
  }, [cache]);

  return {
    fetchEstablishments,
    fetchEstablishmentById,
    clearCache,
    getCachedData,
    invalidateCache,
    loading,
    error
  };
};