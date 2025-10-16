// src/hooks/useMinisterContent.js
import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';
import toast from 'react-hot-toast';

export const useMinisterContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchContent = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const data = await secureApi.get('/api/ministere/content', false);
      
      if (data.success) {
        setContent(data.data);
        setLastUpdated(new Date());
        setError(null);
        
        if (!silent && !data.cached) {
          toast.success('Contenu mis à jour');
        }
      } else {
        throw new Error(data.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Error fetching minister content:', err);
      setError(err.message);
      
      if (!silent) {
        toast.error('Erreur lors du chargement du contenu');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    
    // Actualisation automatique toutes les 10 minutes
    const interval = setInterval(() => {
      fetchContent(true);
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchContent]);

  const refresh = useCallback(() => {
    fetchContent(false);
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > 30 * 60 * 1000 // 30 minutes
  };
};

export const useMinisterMissions = () => {
  const [missions, setMissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMissions = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const data = await secureApi.get('/api/ministere/missions', false);
      
      if (data.success) {
        setMissions(data.data);
        setLastUpdated(new Date());
        setError(null);
        
        if (!silent && !data.cached) {
          toast.success('Missions mises à jour');
        }
      } else {
        throw new Error(data.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Error fetching minister missions:', err);
      setError(err.message);
      
      if (!silent) {
        toast.error('Erreur lors du chargement des missions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
    
    // Actualisation automatique toutes les 15 minutes
    const interval = setInterval(() => {
      fetchMissions(true);
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchMissions]);

  const refresh = useCallback(() => {
    fetchMissions(false);
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > 45 * 60 * 1000 // 45 minutes
  };
};