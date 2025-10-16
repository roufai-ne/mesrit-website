// src/lib/seoService.js
import News from '@/models/News';
import { connectDB } from './mongodb';

// Import logger seulement côté serveur
/* eslint-disable @typescript-eslint/no-require-imports */
const logger = typeof window === 'undefined' ? require('./logger').default : null;
const LOG_TYPES = typeof window === 'undefined' ? require('./logger').LOG_TYPES : {};
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Service de gestion SEO pour les actualités
 */
class SEOService {
  
  /**
   * Générer un slug unique à partir du titre
   */
  static async generateSlug(title, newsId = null) {
    try {
      // Nettoyer et formater le titre
      let baseSlug = title
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
        .replace(/[^a-z0-9\s-]/g, '') // Supprimer caractères spéciaux
        .replace(/\s+/g, '-') // Remplacer espaces par tirets
        .replace(/-+/g, '-') // Supprimer tirets multiples
        .replace(/^-|-$/g, ''); // Supprimer tirets début/fin
      
      // Limiter la longueur
      if (baseSlug.length > 60) {
        baseSlug = baseSlug.substring(0, 60).replace(/-[^-]*$/, '');
      }
      
      // Vérifier l'unicité
      let slug = baseSlug;
      let counter = 1;
      
      while (await this.slugExists(slug, newsId)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return slug;
      
    } catch (error) {
      console.error('Erreur génération slug:', error);
      // Fallback : utiliser timestamp
      return `article-${Date.now()}`;
    }
  }
  
  /**
   * Vérifier si un slug existe déjà
   */
  static async slugExists(slug, excludeId = null) {
    try {
      await connectDB();
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const existing = await News.findOne(query);
      return !!existing;
      
    } catch (error) {
      console.error('Erreur vérification slug:', error);
      return false;
    }
  }
  
  /**
   * Générer les meta tags automatiquement
   */
  static generateMetaTags(article) {
    const metaTags = {};
    
    // Meta title
    if (!article.metaTitle) {
      metaTags.metaTitle = article.title.length > 60 
        ? `${article.title.substring(0, 57)}...`
        : article.title;
    }
    
    // Meta description
    if (!article.metaDescription) {
      let description = '';
      
      if (article.summary) {
        description = article.summary;
      } else if (article.content) {
        // Extraire le texte du contenu HTML
        const textContent = article.content
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        description = textContent;
      }
      
      // Limiter à 160 caractères
      if (description.length > 160) {
        description = `${description.substring(0, 157)}...`;
      }
      
      metaTags.metaDescription = description;
    }
    
    return metaTags;
  }
  
  /**
   * Optimiser un article pour le SEO
   */
  static async optimizeArticle(articleId, seoData = {}) {
    try {
      // Assurer la connexion à la base de données
      await connectDB();
      
      const article = await News.findById(articleId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      const updates = {};
      
      // Générer ou mettre à jour le slug
      if (seoData.title || !article.slug) {
        const title = seoData.title || article.title;
        updates.slug = await this.generateSlug(title, articleId);
      }
      
      // Générer les meta tags automatiques si non fournis
      const autoMetaTags = this.generateMetaTags({
        ...article.toObject(),
        ...seoData
      });
      
      // Appliquer les meta tags
      if (seoData.metaTitle !== undefined) {
        updates.metaTitle = seoData.metaTitle;
      } else if (autoMetaTags.metaTitle) {
        updates.metaTitle = autoMetaTags.metaTitle;
      }
      
      if (seoData.metaDescription !== undefined) {
        updates.metaDescription = seoData.metaDescription;
      } else if (autoMetaTags.metaDescription) {
        updates.metaDescription = autoMetaTags.metaDescription;
      }
      
      // Mettre à jour l'article
      const updatedArticle = await News.findByIdAndUpdate(
        articleId,
        { $set: updates },
        { new: true }
      );
      
      if (logger) {
        await logger.info(
          LOG_TYPES.CONTENT_UPDATED,
          'Article optimisé pour le SEO',
          {
            articleId,
            updates,
            slug: updates.slug
          }
        );
      }
      
      return updatedArticle;
      
    } catch (error) {
      // Gestion robuste de l'erreur
      const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
      
      console.error('Erreur optimisation SEO service:', error);
      
      try {
        if (logger) {
          await logger.error(
            LOG_TYPES.SYSTEM_ERROR,
            'Erreur optimisation SEO',
            {
              articleId,
              error: errorMessage,
              errorType: typeof error,
              stack: error?.stack || 'Pas de stack trace'
            }
          );
        }
      } catch (logError) {
        console.error('Erreur lors du logging SEO:', logError);
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Analyser le SEO d'un article
   */
  static analyzeSEO(article) {
    const analysis = {
      score: 0,
      issues: [],
      suggestions: [],
      strengths: []
    };
    
    // Vérifier le titre
    if (!article.title) {
      analysis.issues.push('Titre manquant');
    } else {
      if (article.title.length < 30) {
        analysis.suggestions.push('Titre trop court (< 30 caractères)');
      } else if (article.title.length > 60) {
        analysis.suggestions.push('Titre trop long (> 60 caractères)');
      } else {
        analysis.strengths.push('Titre de longueur optimale');
        analysis.score += 20;
      }
    }
    
    // Vérifier le slug
    if (!article.slug) {
      analysis.issues.push('Slug manquant');
    } else {
      analysis.strengths.push('Slug présent');
      analysis.score += 15;
    }
    
    // Vérifier meta title
    if (!article.metaTitle) {
      analysis.suggestions.push('Meta title manquant');
    } else {
      if (article.metaTitle.length > 60) {
        analysis.suggestions.push('Meta title trop long (> 60 caractères)');
      } else {
        analysis.strengths.push('Meta title optimisé');
        analysis.score += 20;
      }
    }
    
    // Vérifier meta description
    if (!article.metaDescription) {
      analysis.suggestions.push('Meta description manquante');
    } else {
      if (article.metaDescription.length < 120) {
        analysis.suggestions.push('Meta description trop courte (< 120 caractères)');
      } else if (article.metaDescription.length > 160) {
        analysis.suggestions.push('Meta description trop longue (> 160 caractères)');
      } else {
        analysis.strengths.push('Meta description optimisée');
        analysis.score += 25;
      }
    }
    
    // Vérifier le contenu
    if (!article.content) {
      analysis.issues.push('Contenu manquant');
    } else {
      const wordCount = article.content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
      if (wordCount < 300) {
        analysis.suggestions.push('Contenu trop court (< 300 mots)');
      } else {
        analysis.strengths.push('Contenu de longueur suffisante');
        analysis.score += 10;
      }
    }
    
    // Vérifier l'image
    if (!article.image) {
      analysis.suggestions.push('Image principale manquante');
    } else {
      analysis.strengths.push('Image principale présente');
      analysis.score += 10;
    }
    
    // Déterminer le niveau
    let level = 'poor';
    if (analysis.score >= 80) level = 'excellent';
    else if (analysis.score >= 60) level = 'good';
    else if (analysis.score >= 40) level = 'fair';
    
    analysis.level = level;
    
    return analysis;
  }
  
  /**
   * Générer les données structurées (JSON-LD)
   */
  static generateStructuredData(article, baseUrl = '') {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.metaDescription || article.summary,
      "datePublished": article.publishedAt || article.createdAt,
      "dateModified": article.updatedAt,
      "author": {
        "@type": "Organization",
        "name": "Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation du Niger"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MESRI Niger",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/logo-mesri.png`
        }
      }
    };
    
    // Ajouter l'image si présente
    if (article.image) {
      structuredData.image = {
        "@type": "ImageObject",
        "url": article.image.startsWith('http') ? article.image : `${baseUrl}${article.image}`
      };
    }
    
    // Ajouter l'URL de l'article
    if (article.slug) {
      structuredData.url = `${baseUrl}/actualites/${article.slug}`;
    }
    
    // Ajouter la catégorie
    if (article.category) {
      structuredData.articleSection = article.category;
    }
    
    // Ajouter les mots-clés
    if (article.tags && article.tags.length > 0) {
      structuredData.keywords = article.tags.join(', ');
    }
    
    return structuredData;
  }
  
  /**
   * Obtenir les statistiques SEO globales
   */
  static async getSEOStats() {
    try {
      // Assurer la connexion à la base de données
      await connectDB();
      
      // Méthode plus simple et robuste
      const totalArticles = await News.countDocuments({
        status: { $in: ['published', 'draft'] }
      });
      
      if (totalArticles === 0) {
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
      }
      
      // Compter chaque champ séparément pour éviter les erreurs d'agrégation
      const [withSlug, withMetaTitle, withMetaDescription, withImage] = await Promise.all([
        News.countDocuments({
          status: { $in: ['published', 'draft'] },
          slug: { $exists: true, $ne: null, $ne: '' }
        }),
        News.countDocuments({
          status: { $in: ['published', 'draft'] },
          metaTitle: { $exists: true, $ne: null, $ne: '' }
        }),
        News.countDocuments({
          status: { $in: ['published', 'draft'] },
          metaDescription: { $exists: true, $ne: null, $ne: '' }
        }),
        News.countDocuments({
          status: { $in: ['published', 'draft'] },
          image: { $exists: true, $ne: null, $ne: '' }
        })
      ]);
      
      // Calculer les pourcentages
      return {
        totalArticles,
        withSlug,
        withMetaTitle,
        withMetaDescription,
        withImage,
        slugPercentage: ((withSlug / totalArticles) * 100).toFixed(1),
        metaTitlePercentage: ((withMetaTitle / totalArticles) * 100).toFixed(1),
        metaDescriptionPercentage: ((withMetaDescription / totalArticles) * 100).toFixed(1),
        imagePercentage: ((withImage / totalArticles) * 100).toFixed(1)
      };
      
    } catch (error) {
      console.error('Erreur statistiques SEO:', error);
      console.error('Stack trace:', error.stack);
      
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
    }
  }
}

export default SEOService;