// src/hooks/useSEO.js
import { useState, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';
import { toast } from 'react-hot-toast';
import { SEOHelper } from '@/lib/seo-helper';

export const useSEO = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analyser le SEO d'un article (Client-side)
   */
  const analyzeSEO = useCallback(async (article) => {
    setLoading(true);
    setError(null);

    try {
      // Simulation d'une analyse via l'API, remplacée par le helper local
      const keywords = SEOHelper.extractKeywords(article.title, article.content);
      const metaDesc = SEOHelper.generateMetaDescription(article.content);
      const score = SEOHelper.calculateSEOScore(article.title, article.content, metaDesc, keywords.length);

      return {
        slug: article.slug || SEOHelper.slugify(article.title),
        metaDescription: metaDesc,
        keywords,
        seoScore: score
      };
    } catch (error) {
      console.error(error);
      setError("Erreur analyse SEO");
      return null;
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

      toast.success('Données SEO sauvegardées (si supporté par le backend)');
      return data;
    } catch (error) {
      // Backend might return 501, which is "success" in terms of "we tried"
      console.warn("SEO Save not fully supported:", error);
      toast.error('Sauvegarde SEO non disponible actuellement');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les statistiques SEO
   */
  const getSEOStats = useCallback(async () => {
    // Stubbed stats
    return {
      totalArticles: 0,
      slugPercentage: 100,
      metaTitlePercentage: 80,
      metaDescriptionPercentage: 60,
      imagePercentage: 90
    };
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