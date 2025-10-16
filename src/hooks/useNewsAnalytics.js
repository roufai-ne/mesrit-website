// src/hooks/useNewsAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

export const useNewsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Enregistrer une vue d'article
   */
  const trackView = useCallback(async (newsId, options = {}) => {
    try {
      const { readingTime = 0, scrollDepth = 0 } = options;
      
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'view',
        readingTime,
        scrollDepth
      }, false); // Public endpoint
      
    } catch (error) {
      console.error('Erreur tracking vue:', error);
      // Ne pas propager l'erreur pour ne pas affecter l'UX
    }
  }, []);

  /**
   * Enregistrer un partage d'article
   */
  const trackShare = useCallback(async (newsId, platform) => {
    try {
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'share',
        platform
      }, false); // Public endpoint
      
    } catch (error) {
      console.error('Erreur tracking partage:', error);
      // Ne pas propager l'erreur pour ne pas affecter l'UX
    }
  }, []);

  /**
   * Récupérer les statistiques globales (admin seulement)
   */
  const getGlobalStats = useCallback(async (period = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.get(`/api/news/analytics?period=${period}`, true);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les statistiques d'un article (admin seulement)
   */
  const getNewsStats = useCallback(async (newsId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.get(`/api/news/${newsId}/analytics`, true);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    trackView,
    trackShare,
    getGlobalStats,
    getNewsStats
  };
};

/**
 * Hook pour tracker automatiquement les vues avec temps de lecture
 */
export const useViewTracking = (newsId) => {
  const { trackView } = useNewsAnalytics();
  const [startTime] = useState(Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);
  const [hasTracked, setHasTracked] = useState(false);

  // Tracker le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      setScrollDepth(Math.max(scrollDepth, scrollPercent));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepth]);

  // Tracker la vue au démontage du composant
  useEffect(() => {
    return () => {
      if (!hasTracked && newsId) {
        const readingTime = Math.round((Date.now() - startTime) / 1000);
        
        // Tracker seulement si l'utilisateur a passé au moins 5 secondes
        if (readingTime >= 5) {
          trackView(newsId, { readingTime, scrollDepth });
          setHasTracked(true);
        }
      }
    };
  }, [newsId, trackView, startTime, scrollDepth, hasTracked]);

  return { scrollDepth };
};

/**
 * Hook pour les statistiques en temps réel (admin)
 */
export const useRealTimeStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getGlobalStats } = useNewsAnalytics();

  const fetchStats = useCallback(async () => {
    try {
      const data = await getGlobalStats(30);
      setStats(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getGlobalStats]);

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

export default useNewsAnalytics;