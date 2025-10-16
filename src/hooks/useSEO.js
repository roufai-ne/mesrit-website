// src/hooks/useSEO.js
import { useState, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';
import { toast } from 'react-hot-toast';

export const useSEO = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analyser le SEO d'un article
   */
  const analyzeSEO = useCallback(async (articleId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.get(`/api/news/seo?id=${articleId}`, true);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'analyse SEO';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Optimiser un article pour le SEO
   */
  const optimizeArticle = useCallback(async (articleId, seoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.post('/api/news/seo', {
        articleId,
        seoData
      }, true);
      
      toast.success('Article optimisé pour le SEO');
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'optimisation SEO';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les statistiques SEO
   */
  const getSEOStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await secureApi.get('/api/news/seo/stats', true);
      return data;
    } catch (error) {
      console.error('Erreur getSEOStats hook:', error);
      const errorMessage = error.message || 'Erreur lors de la récupération des statistiques SEO';
      setError(errorMessage);
      
      // Retourner des données par défaut en cas d'erreur
      return {
        totalArticles: 0,
        withSlug: 0,
        withMetaTitle: 0,
        withMetaDescription: 0,
        withImage: 0,
        slugPercentage: 0,
        metaTitlePercentage: 0,
        metaDescriptionPercentage: 0,
        imagePercentage: 0
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    analyzeSEO,
    optimizeArticle,
    getSEOStats
  };
};

/**
 * Hook pour la génération de slugs
 */
export const useSlugGenerator = () => {
  const [loading, setLoading] = useState(false);

  const generateSlug = useCallback(async (title) => {
    setLoading(true);
    
    try {
      // Génération côté client pour aperçu immédiat
      let slug = title
        .toLowerCase()
        .trim()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (slug.length > 60) {
        slug = slug.substring(0, 60).replace(/-[^-]*$/, '');
      }
      
      return slug;
    } catch (error) {
      console.error('Erreur génération slug:', error);
      return `article-${Date.now()}`;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    generateSlug
  };
};

/**
 * Hook pour les meta tags
 */
export const useMetaTags = () => {
  const generateMetaTags = useCallback((article) => {
    const metaTags = {};
    
    // Meta title
    if (article.title) {
      metaTags.metaTitle = article.title.length > 60 
        ? `${article.title.substring(0, 57)}...`
        : article.title;
    }
    
    // Meta description
    let description = '';
    if (article.summary) {
      description = article.summary;
    } else if (article.content) {
      const textContent = article.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      description = textContent;
    }
    
    if (description.length > 160) {
      description = `${description.substring(0, 157)}...`;
    }
    
    metaTags.metaDescription = description;
    
    return metaTags;
  }, []);

  return {
    generateMetaTags
  };
};

export default useSEO;