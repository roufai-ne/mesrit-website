// src/hooks/useNewsAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';

/**
 * Générer ou récupérer le sessionId
 */
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useNewsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Enregistrer une vue d'article
   */
  const trackView = useCallback(async (newsId, options = {}) => {
    if (!newsId) {
      console.warn('[Analytics] trackView: newsId manquant');
      return;
    }

    try {
      const { readingTime = 0, scrollDepth = 0 } = options;
      
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'view',
        readingTime,
        scrollDepth,
        sessionId: getOrCreateSessionId()
      }, false); // Public endpoint
      
      console.log('[Analytics] Vue trackée avec succès:', newsId);
      
    } catch (error) {
      console.error('[Analytics] Erreur tracking vue:', error);
      // Ne pas propager l'erreur pour ne pas affecter l'UX
    }
  }, []);

  /**
   * Enregistrer un partage d'article
   */
  const trackShare = useCallback(async (newsId, platform) => {
    if (!newsId) {
      console.warn('[Analytics] trackShare: newsId manquant');
      return;
    }

    if (!platform) {
      console.warn('[Analytics] trackShare: platform manquante');
      return;
    }

    try {
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'share',
        platform,
        sessionId: getOrCreateSessionId()
      }, false); // Public endpoint
      
      console.log('[Analytics] Partage tracké avec succès:', { newsId, platform });
      
    } catch (error) {
      console.error('[Analytics] Erreur tracking partage:', error);
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
      console.log('[Analytics] Récupération stats globales, période:', period);
      const data = await secureApi.get(`/api/news/analytics?period=${period}`, true);
      console.log('[Analytics] Stats globales récupérées:', data);
      return data;
    } catch (error) {
      console.error('[Analytics] Erreur récupération stats globales:', error);
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
    if (!newsId) {
      throw new Error('newsId est requis');
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[Analytics] Récupération stats article:', newsId);
      const data = await secureApi.get(`/api/news/${newsId}/analytics`, true);
      console.log('[Analytics] Stats article récupérées:', data);
      return data;
    } catch (error) {
      console.error('[Analytics] Erreur récupération stats article:', error);
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

  // Vérifier l'initialisation
  useEffect(() => {
    if (!newsId) {
      console.log('[ViewTracking] Pas de newsId, tracking désactivé');
      return;
    }
    console.log('[ViewTracking] Initialisation tracking pour:', newsId);
  }, [newsId]);

  // Tracker le scroll
  useEffect(() => {
    if (!newsId) return; // Ne pas tracker si pas de newsId

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      
      setScrollDepth(Math.max(scrollDepth, Math.min(scrollPercent, 100)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepth, newsId]);

  // Tracker la vue au démontage du composant
  useEffect(() => {
    if (!newsId) {
      console.log('[ViewTracking] Pas de newsId, pas de tracking au démontage');
      return;
    }

    return () => {
      if (!hasTracked) {
        const readingTime = Math.round((Date.now() - startTime) / 1000);
        
        // Tracker seulement si l'utilisateur a passé au moins 5 secondes
        if (readingTime >= 5) {
          console.log('[ViewTracking] Tracking vue au démontage:', {
            newsId,
            readingTime,
            scrollDepth
          });
          trackView(newsId, { readingTime, scrollDepth });
          setHasTracked(true);
        } else {
          console.log('[ViewTracking] Temps de lecture trop court:', readingTime, 's');
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
      console.log('[RealTimeStats] Récupération des stats...');
      const data = await getGlobalStats(30);
      setStats(data);
      setError(null);
      console.log('[RealTimeStats] Stats mises à jour');
    } catch (error) {
      console.error('[RealTimeStats] Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getGlobalStats]);

  useEffect(() => {
    fetchStats();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

export default useNewsAnalytics;