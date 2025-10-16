// src/pages/api/news/analytics.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsAnalyticsService from '@/lib/newsAnalytics';
import logger, { LOG_TYPES } from '@/lib/logger';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import News from '@/models/News';

// GET - Récupérer les statistiques globales (protégé - admin seulement)
const getGlobalAnalytics = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await connectDB();
    
    const { period = 30 } = req.query;
    
    // Valider la période
    const validPeriod = Math.min(Math.max(parseInt(period), 1), 365);
    
    const stats = await NewsAnalyticsService.getGlobalStats(validPeriod);
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation des analytics globales',
      {
        period: validPeriod,
        adminId: req.user?.id || 'anonymous',
        adminUsername: req.user?.username || 'anonymous'
      },
      req
    );
    
    res.status(200).json({
      success: true,
      data: stats,
      period: validPeriod
    });
    
  } catch (error) {
    console.error('Erreur récupération analytics globales:', error);
    
    // Gestion robuste de l'erreur
    const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
    const errorStack = error?.stack || 'Pas de stack trace disponible';
    
    console.error('Stack trace:', errorStack);
    
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur récupération analytics globales',
        {
          error: errorMessage,
          stack: errorStack,
          adminId: req.user?.id,
          errorType: typeof error,
          errorDetails: JSON.stringify(error, null, 2)
        },
        req
      );
    } catch (logError) {
      console.error('Erreur lors du logging:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// POST - Enregistrer une vue ou un partage (public)
const trackEvent = async (req, res) => {
  try {
    await connectDB();
    const { newsId, eventType, platform, readingTime, scrollDepth } = req.body;
    
    // Validation des données
    if (!newsId || !eventType) {
      return res.status(400).json({
        success: false,
        error: 'newsId et eventType sont requis'
      });
    }
    
    if (!['view', 'share'].includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: 'eventType doit être "view" ou "share"'
      });
    }
    
    // Normaliser/valider l'identifiant article (ObjectId ou slug)
    let resolvedNewsId = null;
    if (mongoose.Types.ObjectId.isValid(newsId)) {
      resolvedNewsId = newsId;
    } else if (typeof newsId === 'string') {
      const bySlug = await News.findOne({ slug: newsId.toLowerCase() }).select('_id');
      if (bySlug) resolvedNewsId = bySlug._id;
    }

    if (!resolvedNewsId) {
      return res.status(400).json({ success: false, error: 'newsId invalide (ObjectId ou slug requis)' });
    }

    // Données de tracking (IP robuste derrière proxy)
    const xff = req.headers['x-forwarded-for'];
    const ip = Array.isArray(xff)
      ? xff[0]
      : (typeof xff === 'string' ? xff.split(',')[0].trim() : null) || req.socket?.remoteAddress || req.connection?.remoteAddress || 'Unknown';

    const trackingData = {
      ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
      referrer: req.headers.referer || req.headers.referrer || '',
      sessionId: req.headers['x-session-id'] || null,
      userId: req.user?.id || null
    };
    
    let result;
    
    if (eventType === 'view') {
      // Enregistrer une vue
      result = await NewsAnalyticsService.trackView(resolvedNewsId, {
        ...trackingData,
        readingTime: readingTime || 0,
        scrollDepth: scrollDepth || 0
      });
    } else if (eventType === 'share') {
      // Enregistrer un partage
      if (!platform) {
        return res.status(400).json({
          success: false,
          error: 'platform est requis pour les partages'
        });
      }
      
      const validPlatforms = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          error: `platform doit être l'un de: ${validPlatforms.join(', ')}`
        });
      }
      
      result = await NewsAnalyticsService.trackShare(resolvedNewsId, platform, trackingData);
    }
    
    res.status(200).json({
      success: true,
      message: `${eventType} enregistré avec succès`,
      data: {
        newsId: resolvedNewsId,
        eventType,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erreur tracking événement:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur tracking événement analytics',
      {
        error: error.message,
        newsId: req.body?.newsId,
        eventType: req.body?.eventType
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'événement'
    });
  }
};

export default apiHandler(
  {
    GET: getGlobalAnalytics,
    POST: trackEvent
  },
  {
    GET: ROUTE_TYPES.PROTECTED, // Admin seulement
    POST: ROUTE_TYPES.PUBLIC    // Public pour tracking
  }
);