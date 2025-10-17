// src/pages/api/news/analyticsV2.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsAnalyticsServiceV2 from '@/lib/newsAnalyticsV2';
import { NewsErrorHandler } from '@/lib/newsErrors';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * API endpoint pour analytics V2 - nouvelle architecture
 */

// GET - Récupérer les statistiques (admin uniquement)
const getAnalytics = async (req, res) => {
  try {
    await connectDB();

    const {
      newsId,
      period = 30,
      startDate,
      endDate,
      type = 'global'
    } = req.query;

    let result;

    switch (type) {
      case 'news':
        if (!newsId) {
          return res.status(400).json({
            success: false,
            error: { message: 'newsId requis pour les stats d\'article' }
          });
        }

        const start = startDate ? new Date(startDate) : new Date(Date.now() - period * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        result = await NewsAnalyticsServiceV2.getNewsStats(newsId, start, end);
        break;

      case 'global':
      default:
        const validPeriod = Math.min(Math.max(parseInt(period), 1), 365);
        result = await NewsAnalyticsServiceV2.getGlobalStats(validPeriod);
        break;
    }

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (error) {
    const { response, statusCode } = NewsErrorHandler.createApiErrorResponse(error, req);
    await NewsErrorHandler.handleError(error, {
      endpoint: 'analyticsV2',
      method: 'GET',
      userId: req.user?.id,
      query: req.query
    });

    res.status(statusCode).json(response);
  }
};

// POST - Enregistrer un événement analytics (public avec rate limiting)
const trackEvent = async (req, res) => {
  try {
    await connectDB();

    const {
      newsId,
      eventType, // 'view' ou 'share'
      platform,  // requis pour 'share'
      sessionId,
      readingTime,
      scrollDepth,
      videoWatched,
      videoCurrentTime,
      videoDuration,
      shareUrl,
      shareText,
      customMessage
    } = req.body;

    // Validation
    if (!newsId || !mongoose.Types.ObjectId.isValid(newsId)) {
      return res.status(400).json({
        success: false,
        error: { message: 'newsId valide requis' }
      });
    }

    if (!eventType || !['view', 'share'].includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: { message: 'eventType doit être "view" ou "share"' }
      });
    }

    if (eventType === 'share' && !platform) {
      return res.status(400).json({
        success: false,
        error: { message: 'platform requis pour les événements de partage' }
      });
    }

    // Données de tracking communes
    const trackingData = {
      sessionId: sessionId || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user?.id || null,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referrer: req.headers.referer || req.headers.referrer || '',
      country: req.headers['cf-ipcountry'] || 'unknown', // Cloudflare header
      city: req.headers['cf-ipcity'] || 'unknown'
    };

    let result;

    if (eventType === 'view') {
      result = await NewsAnalyticsServiceV2.trackView(newsId, {
        ...trackingData,
        readingTime: readingTime || 0,
        scrollDepth: scrollDepth || 0,
        videoWatched: videoWatched || false,
        videoCurrentTime: videoCurrentTime || 0,
        videoDuration: videoDuration || 0
      });
    } else if (eventType === 'share') {
      result = await NewsAnalyticsServiceV2.trackShare(newsId, {
        ...trackingData,
        platform,
        shareUrl: shareUrl || '',
        shareText: shareText || '',
        customMessage: customMessage || ''
      });
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: result._id,
        newsId,
        eventType,
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    const { response, statusCode } = NewsErrorHandler.createApiErrorResponse(error, req);
    await NewsErrorHandler.handleError(error, {
      endpoint: 'analyticsV2',
      method: 'POST',
      body: req.body,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.status(statusCode).json(response);
  }
};

// Configuration des routes avec middleware approprié
const routes = {
  GET: {
    handler: getAnalytics,
    middleware: [ROUTE_TYPES.ADMIN_ONLY] // Admin uniquement pour consultation
  },
  POST: {
    handler: trackEvent,
    middleware: [ROUTE_TYPES.PUBLIC] // Public avec rate limiting
  }
};

export default apiHandler(routes);