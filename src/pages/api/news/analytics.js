// src/pages/api/news/analytics.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { NewsAnalyticsServiceV2 } from '@/lib/newsAnalyticsV2';
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
    const validPeriod = Math.min(Math.max(parseInt(period) || 30, 1), 365);
    
    console.log(`[Analytics] Récupération des stats pour ${validPeriod} jours`);
    
    const stats = await NewsAnalyticsServiceV2.getGlobalStats(validPeriod);
    
    console.log('[Analytics] Stats récupérées:', {
      totalViews: stats.overview?.totalViews,
      activeArticles: stats.overview?.activeArticles
    });
    
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
    console.error('[Analytics] Erreur récupération analytics globales:', error);
    console.error('[Analytics] Stack:', error.stack);
    
    // Log l'erreur
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur récupération analytics globales',
        {
          error: error.message,
          stack: error.stack,
          adminId: req.user?.id,
          query: req.query
        },
        req
      );
    } catch (logError) {
      console.error('[Analytics] Erreur lors du logging:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// POST - Enregistrer une vue ou un partage (public)
const trackEvent = async (req, res) => {
  try {
    await connectDB();
    
    const { newsId, eventType, platform, readingTime, scrollDepth, sessionId } = req.body;
    
    console.log('[Analytics] Tracking event:', { newsId, eventType, platform, sessionId });
    
    // Validation des données
    if (!newsId || !eventType) {
      console.log('[Analytics] Données manquantes:', { newsId, eventType });
      return res.status(400).json({
        success: false,
        error: 'newsId et eventType sont requis'
      });
    }
    
    if (!['view', 'share'].includes(eventType)) {
      console.log('[Analytics] Type d\'événement invalide:', eventType);
      return res.status(400).json({
        success: false,
        error: 'eventType doit être "view" ou "share"'
      });
    }
    
    // Normaliser/valider l'identifiant article (ObjectId ou slug)
    let resolvedNewsId = null;
    
    if (mongoose.Types.ObjectId.isValid(newsId)) {
      resolvedNewsId = newsId;
      console.log('[Analytics] newsId est un ObjectId valide');
    } else if (typeof newsId === 'string') {
      console.log('[Analytics] Recherche par slug:', newsId);
      const bySlug = await News.findOne({ slug: newsId.toLowerCase() }).select('_id');
      if (bySlug) {
        resolvedNewsId = bySlug._id;
        console.log('[Analytics] Article trouvé par slug:', resolvedNewsId);
      }
    }

    if (!resolvedNewsId) {
      console.log('[Analytics] Article non trouvé pour newsId:', newsId);
      return res.status(400).json({ 
        success: false, 
        error: 'newsId invalide (ObjectId ou slug requis)' 
      });
    }

    // Données de tracking (IP robuste derrière proxy)
    const xff = req.headers['x-forwarded-for'];
    const ip = Array.isArray(xff)
      ? xff[0]
      : (typeof xff === 'string' ? xff.split(',')[0].trim() : null) 
        || req.socket?.remoteAddress 
        || req.connection?.remoteAddress 
        || 'Unknown';

    // Construire trackingData avec TOUS les champs nécessaires
    const trackingData = {
      ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
      referrer: req.headers.referer || req.headers.referrer || '',
      sessionId: sessionId || req.headers['x-session-id'] || null,  // ← CORRECTION ICI
      userId: req.user?.id || null,
      readingTime: readingTime || 0,
      scrollDepth: scrollDepth || 0,
      country: req.body.country || null,
      city: req.body.city || null,
      videoWatched: req.body.videoWatched || false,
      videoCurrentTime: req.body.videoCurrentTime || 0,
      videoDuration: req.body.videoDuration || 0
    };
    
    console.log('[Analytics] Tracking data préparé:', { 
      ip: trackingData.ip?.substring(0, 10) + '...', 
      userAgent: trackingData.userAgent?.substring(0, 20) + '...',
      sessionId: trackingData.sessionId,
      readingTime: trackingData.readingTime,
      scrollDepth: trackingData.scrollDepth
    });
    
    let result;
    
    if (eventType === 'view') {
      // Enregistrer une vue
      console.log('[Analytics] Tracking vue pour:', resolvedNewsId);
      result = await NewsAnalyticsServiceV2.trackView(resolvedNewsId, trackingData);
      console.log('[Analytics] Vue enregistrée:', result ? 'Succès' : 'Échec');
      
    } else if (eventType === 'share') {
      // Enregistrer un partage
      if (!platform) {
        console.log('[Analytics] Platform manquante pour le partage');
        return res.status(400).json({
          success: false,
          error: 'platform est requis pour les partages'
        });
      }
      
      const validPlatforms = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy'];
      if (!validPlatforms.includes(platform)) {
        console.log('[Analytics] Platform invalide:', platform);
        return res.status(400).json({
          success: false,
          error: `platform doit être l'un de: ${validPlatforms.join(', ')}`
        });
      }
      
      console.log('[Analytics] Tracking partage pour:', resolvedNewsId, 'sur', platform);
      
      // Pour le partage, ajouter la plateforme dans trackingData
      const shareData = {
        ...trackingData,
        platform
      };
      
      result = await NewsAnalyticsServiceV2.trackShare(resolvedNewsId, platform, shareData);
      console.log('[Analytics] Partage enregistré:', result ? 'Succès' : 'Échec');
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
    console.error('[Analytics] Erreur tracking événement:', error);
    console.error('[Analytics] Stack:', error.stack);
    
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur tracking événement analytics',
        {
          error: error.message,
          stack: error.stack,
          newsId: req.body?.newsId,
          eventType: req.body?.eventType
        },
        req
      );
    } catch (logError) {
      console.error('[Analytics] Erreur lors du logging:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'événement',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
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