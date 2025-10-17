// src/hooks/useNewsV2.js
import { useState, useEffect, useCallback, useRef } from 'react';
// Only import on server side to avoid MongoDB client-side issues
const isServer = typeof window === 'undefined';
import { secureApi } from '@/lib/secureApi';

/**
 * Hook pour la gestion des actualités V2 avec analytics et SEO intégrés
 */
export function useNewsV2() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * Charger les actualités avec cache intelligent
   */
  const loadNews = useCallback(async (options = {}) => {
    const {
      page = 1,
      limit = 10,
      category = null,
      status = 'published',
      search = null,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await secureApi.get(`/api/news?${params}`);

      setNews(response.news || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      });

    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des actualités');
      console.error('Erreur chargement actualités:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Charger une actualité spécifique avec analytics
   */
  const loadNewsItem = useCallback(async (newsId) => {
    try {
      const response = await secureApi.get(`/api/news/${newsId}`);
      return response;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors du chargement de l\'actualité');
    }
  }, []);

  /**
   * Créer une nouvelle actualité avec SEO automatique
   */
  const createNews = useCallback(async (newsData) => {
    try {
      setLoading(true);

      // Créer l'actualité
      const newNews = await secureApi.post('/api/news', newsData);

      return newNews;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la création de l\'actualité');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour une actualité
   */
  const updateNews = useCallback(async (newsId, updateData) => {
    try {
      setLoading(true);

      const updatedNews = await secureApi.put(`/api/news/${newsId}`, updateData);

      return updatedNews;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la mise à jour de l\'actualité');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprimer une actualité
   */
  const deleteNews = useCallback(async (newsId) => {
    try {
      setLoading(true);
      await secureApi.delete(`/api/news/${newsId}`);

      return true;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la suppression de l\'actualité');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    news,
    loading,
    error,
    pagination,
    loadNews,
    loadNewsItem,
    createNews,
    updateNews,
    deleteNews
  };
}

/**
 * Hook pour le tracking analytics optimisé
 */
export function useNewsAnalyticsV2() {
  const trackingRef = useRef(new Set());

  /**
   * Tracker une vue d'article de manière optimisée
   */
  const trackView = useCallback(async (newsId, viewData = {}) => {
    // Éviter le double tracking
    const trackingKey = `${newsId}_${Date.now()}`;
    if (trackingRef.current.has(trackingKey)) {
      return;
    }
    trackingRef.current.add(trackingKey);

    try {
      // Données de vue par défaut
      const defaultViewData = {
        sessionId: getSessionId(),
        ip: await getClientIP(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        readingTime: 0,
        scrollDepth: 0,
        ...viewData
      };

      // Use API call instead of direct service call
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'view',
        ...defaultViewData
      });

    } catch (error) {
      console.error('Erreur tracking vue:', error);
    } finally {
      // Nettoyer après 1 minute
      setTimeout(() => {
        trackingRef.current.delete(trackingKey);
      }, 60000);
    }
  }, []);

  /**
   * Tracker un partage d'article
   */
  const trackShare = useCallback(async (newsId, platform, shareData = {}) => {
    try {
      const defaultShareData = {
        platform,
        sessionId: getSessionId(),
        ip: await getClientIP(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        shareUrl: window.location.href,
        ...shareData
      };

      // Use API call instead of direct service call
      await secureApi.post('/api/news/analytics', {
        newsId,
        eventType: 'share',
        ...defaultShareData
      });

    } catch (error) {
      console.error('Erreur tracking partage:', error);
    }
  }, []);

  /**
   * Obtenir les statistiques d'un article
   */
  const getNewsStats = useCallback(async (newsId, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      return await secureApi.get(`/api/news/${newsId}/analytics?${params}`);
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      throw error;
    }
  }, []);

  /**
   * Obtenir les statistiques globales
   */
  const getGlobalStats = useCallback(async (period = 30) => {
    try {
      return await secureApi.get(`/api/news/analytics?period=${period}`);
    } catch (error) {
      console.error('Erreur récupération stats globales:', error);
      throw error;
    }
  }, []);

  return {
    trackView,
    trackShare,
    getNewsStats,
    getGlobalStats
  };
}

/**
 * Hook pour le tracking automatique des vues avec scroll et temps de lecture
 */
export function useViewTracking(newsId, options = {}) {
  const {
    enabled = true,
    trackScrollDepth = true,
    trackReadingTime = true,
    scrollThreshold = 10, // pourcentage minimum avant tracking
    timeThreshold = 5000   // temps minimum en ms avant tracking
  } = options;

  const [viewData, setViewData] = useState({
    scrollDepth: 0,
    readingTime: 0,
    hasTracked: false
  });

  const { trackView } = useNewsAnalyticsV2();
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const trackedRef = useRef(false);

  // Tracking du scroll
  useEffect(() => {
    if (!enabled || !trackScrollDepth) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);

      setViewData(prev => ({
        ...prev,
        scrollDepth: Math.round(maxScrollRef.current)
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, trackScrollDepth]);

  // Tracking du temps de lecture
  useEffect(() => {
    if (!enabled || !trackReadingTime) return;

    const interval = setInterval(() => {
      const readingTime = Date.now() - startTimeRef.current;
      setViewData(prev => ({
        ...prev,
        readingTime: Math.round(readingTime / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, trackReadingTime]);

  // Envoi du tracking quand les seuils sont atteints
  useEffect(() => {
    if (!enabled || !newsId || trackedRef.current) return;

    const shouldTrack =
      (viewData.scrollDepth >= scrollThreshold) ||
      (viewData.readingTime * 1000 >= timeThreshold);

    if (shouldTrack) {
      trackedRef.current = true;
      trackView(newsId, {
        scrollDepth: viewData.scrollDepth,
        readingTime: viewData.readingTime
      });

      setViewData(prev => ({
        ...prev,
        hasTracked: true
      }));
    }
  }, [newsId, enabled, viewData.scrollDepth, viewData.readingTime, scrollThreshold, timeThreshold, trackView]);

  // Tracking de sortie de page
  useEffect(() => {
    if (!enabled || !newsId) return;

    const handleBeforeUnload = () => {
      if (!trackedRef.current) {
        // Tracking final avant fermeture
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            '/api/news/analytics',
            JSON.stringify({
              newsId,
              eventType: 'view',
              readingTime: Math.round((Date.now() - startTimeRef.current) / 1000),
              scrollDepth: Math.round(maxScrollRef.current)
            })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [newsId, enabled]);

  return viewData;
}

// Utilitaires
function getSessionId() {
  let sessionId = sessionStorage.getItem('newsSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('newsSessionId', sessionId);
  }
  return sessionId;
}

async function getClientIP() {
  try {
    // En production, vous devriez récupérer l'IP côté serveur
    return 'client';
  } catch {
    return 'unknown';
  }
}