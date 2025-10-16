// src/pages/api/news/seo/index.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import SEOService from '@/lib/seoService';
import News from '@/models/News';
import logger, { LOG_TYPES } from '@/lib/logger';
import { connectDB } from '@/lib/mongodb';

// GET - Analyser le SEO d'un article
const analyzeSEO = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await connectDB();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const article = await News.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    const analysis = SEOService.analyzeSEO(article);
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Analyse SEO effectuée',
      {
        articleId: id,
        score: analysis.score,
        level: analysis.level,
        adminId: req.user.id
      },
      req
    );
    
    res.status(200).json({
      success: true,
      data: {
        article: {
          _id: article._id,
          title: article.title,
          slug: article.slug
        },
        analysis
      }
    });
    
  } catch (error) {
    console.error('Erreur analyse SEO:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur analyse SEO',
      {
        error: error.message,
        articleId: req.query?.id,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse SEO'
    });
  }
};

// POST - Optimiser un article pour le SEO
const optimizeArticle = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await connectDB();
    
    const { articleId, seoData } = req.body;
    
    if (!articleId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const optimizedArticle = await SEOService.optimizeArticle(articleId, seoData);
    
    res.status(200).json({
      success: true,
      message: 'Article optimisé pour le SEO',
      data: {
        slug: optimizedArticle.slug,
        metaTitle: optimizedArticle.metaTitle,
        metaDescription: optimizedArticle.metaDescription
      }
    });
    
  } catch (error) {
    console.error('Erreur optimisation SEO:', error);
    
    // Gestion robuste de l'erreur
    const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
    const errorStack = error?.stack || 'Pas de stack trace disponible';
    
    console.error('Stack trace:', errorStack);
    
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur optimisation SEO',
        {
          error: errorMessage,
          stack: errorStack,
          articleId: req.body?.articleId,
          adminId: req.user?.id,
          errorType: typeof error,
          seoData: req.body?.seoData
        },
        req
      );
    } catch (logError) {
      console.error('Erreur lors du logging:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
};

export default apiHandler(
  {
    GET: analyzeSEO,
    POST: optimizeArticle
  },
  {
    GET: ROUTE_TYPES.PROTECTED,
    POST: ROUTE_TYPES.PROTECTED
  }
);