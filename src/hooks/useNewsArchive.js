// src/hooks/useNewsArchive.js
import { useState, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';
import { toast } from 'react-hot-toast';

export const useNewsArchive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Archiver un article
   */
  const archiveArticle = useCallback(async (newsId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.post('/api/news/archive', {
        newsId,
        reason
      }, true);
      
      toast.success('Article archivé avec succès');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'archivage';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurer un article archivé
   */
  const restoreArticle = useCallback(async (newsId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.put('/api/news/archive', {
        newsId
      }, true);
      
      toast.success('Article restauré avec succès');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la restauration';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre un article à la corbeille
   */
  const deleteArticle = useCallback(async (newsId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.post('/api/news/trash', {
        newsId,
        reason
      }, true);
      
      toast.success('Article mis à la corbeille');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurer un article de la corbeille
   */
  const restoreFromTrash = useCallback(async (newsId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.put('/api/news/trash', {
        newsId
      }, true);
      
      toast.success('Article restauré de la corbeille');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la restauration';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprimer définitivement un article
   */
  const permanentDelete = useCallback(async (newsId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.delete(`/api/news/trash?newsId=${newsId}`, true);
      
      toast.success('Article supprimé définitivement');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la suppression définitive';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les articles archivés
   */
  const getArchivedArticles = useCallback(async (page = 1, limit = 20, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const data = await secureApi.get(`/api/news/archive?${params}`, true);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération des archives';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les articles dans la corbeille
   */
  const getDeletedArticles = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.get(`/api/news/trash?page=${page}&limit=${limit}`, true);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération de la corbeille';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    archiveArticle,
    restoreArticle,
    deleteArticle,
    restoreFromTrash,
    permanentDelete,
    getArchivedArticles,
    getDeletedArticles
  };
};

/**
 * Hook pour gérer les versions d'articles
 */
export const useNewsVersions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getVersions = useCallback(async (newsId) => {
    setLoading(true);
    setError(null);

    try {
      // Pour l'instant, retourner un tableau vide
      // En attendant l'implémentation complète du versioning
      return [];
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération des versions';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getVersions
  };
};

export default useNewsArchive;