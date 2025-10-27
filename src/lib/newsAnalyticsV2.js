// src/lib/newsAnalyticsV2.js
import ViewEvent from '@/models/ViewEvent';
import ShareEvent from '@/models/ShareEvent';
import DailyNewsStats from '@/models/DailyNewsStats';
import News from '@/models/News';
import { connectDB } from './mongodb';
import newsEventBus from './eventBus';
import { NewsErrorHandler, AnalyticsError, withErrorHandling } from './newsErrors';
import logger, { LOG_TYPES } from './logger';

/**
 * Service analytics nouvelle génération
 * Utilise une architecture événementielle et des données séparées
 */
export class NewsAnalyticsServiceV2 {

  /**
   * Enregistrer une vue d'article
   */
  static async trackView(newsId, viewData) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      // Valider que l'article existe
      const news = await News.findById(newsId);
      if (!news) {
        throw new AnalyticsError(
          `Impossible de tracker une vue pour un article inexistant: ${newsId}`,
          'track_view',
          newsId
        );
      }

      // Créer l'événement de vue
      const viewEvent = new ViewEvent({
        newsId,
        sessionId: viewData.sessionId,
        userId: viewData.userId || null,
        ip: viewData.ip,
        userAgent: viewData.userAgent,
        referrer: viewData.referrer,
        readingTime: viewData.readingTime || 0,
        scrollDepth: viewData.scrollDepth || 0,
        country: viewData.country,
        city: viewData.city,
        videoWatched: viewData.videoWatched || false,
        videoCurrentTime: viewData.videoCurrentTime || 0,
        videoDuration: viewData.videoDuration || 0
      });

      await viewEvent.save();

      // Émettre l'événement
      newsEventBus.emitEvent(newsEventBus.constructor.EVENTS.NEWS_VIEWED, {
        newsId,
        viewEventId: viewEvent._id,
        sessionId: viewData.sessionId,
        userId: viewData.userId,
        timestamp: viewEvent.timestamp
      });

      // Déclencher la mise à jour des stats quotidiennes (async)
      setImmediate(() => {
        this.updateDailyStats(newsId, viewEvent.timestamp)
          .catch(error => {
            logger.error(
              LOG_TYPES.SYSTEM_ERROR,
              'Erreur mise à jour stats quotidiennes',
              { newsId, error: error.message }
            );
          });
      });

      return viewEvent;
    }, { operation: 'trackView', newsId });
  }

  /**
   * Enregistrer un partage d'article
   */
  static async trackShare(newsId, shareData) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      // Valider que l'article existe
      const news = await News.findById(newsId);
      if (!news) {
        throw new AnalyticsError(
          `Impossible de tracker un partage pour un article inexistant: ${newsId}`,
          'track_share',
          newsId
        );
      }

      // Créer l'événement de partage
      const shareEvent = new ShareEvent({
        newsId,
        platform: shareData.platform,
        sessionId: shareData.sessionId,
        userId: shareData.userId || null,
        ip: shareData.ip,
        userAgent: shareData.userAgent,
        referrer: shareData.referrer,
        shareUrl: shareData.shareUrl,
        shareText: shareData.shareText,
        customMessage: shareData.customMessage,
        country: shareData.country,
        city: shareData.city
      });

      await shareEvent.save();

      // Émettre l'événement
      newsEventBus.emitEvent(newsEventBus.constructor.EVENTS.NEWS_SHARED, {
        newsId,
        shareEventId: shareEvent._id,
        platform: shareData.platform,
        sessionId: shareData.sessionId,
        userId: shareData.userId,
        timestamp: shareEvent.timestamp
      });

      // Déclencher la mise à jour des stats quotidiennes (async)
      setImmediate(() => {
        this.updateDailyStats(newsId, shareEvent.timestamp)
          .catch(error => {
            logger.error(
              LOG_TYPES.SYSTEM_ERROR,
              'Erreur mise à jour stats quotidiennes après partage',
              { newsId, error: error.message }
            );
          });
      });

      return shareEvent;
    }, { operation: 'trackShare', newsId });
  }

  /**
   * Mettre à jour les statistiques quotidiennes pour un article
   */
  static async updateDailyStats(newsId, date = new Date()) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Générer les stats agrégées pour cette date
      const statsData = await DailyNewsStats.aggregateStatsForDate(newsId, targetDate);

      // Upsert des statistiques quotidiennes
      const dailyStats = await DailyNewsStats.findOneAndUpdate(
        { newsId, date: targetDate },
        statsData,
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      // Émettre l'événement de mise à jour
      newsEventBus.emitEvent(newsEventBus.constructor.EVENTS.DAILY_STATS_UPDATED, {
        newsId,
        date: targetDate,
        statsId: dailyStats._id
      });

      return dailyStats;
    }, { operation: 'updateDailyStats', newsId, date });
  }

  /**
   * Obtenir les statistiques d'un article pour une période
   */
  static async getNewsStats(newsId, startDate, endDate) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      // Valider que l'article existe
      const news = await News.findById(newsId);
      if (!news) {
        throw new AnalyticsError(
          `Article non trouvé: ${newsId}`,
          'get_stats',
          newsId
        );
      }

      // Obtenir les stats quotidiennes pour la période
      const dailyStats = await DailyNewsStats.getStatsForPeriod(newsId, startDate, endDate);

      // Calculer les totaux
      const totals = dailyStats.reduce((acc, day) => {
        acc.totalViews += day.totalViews;
        acc.uniqueViews += day.uniqueViews;
        acc.totalShares += day.totalShares;
        acc.avgReadingTime = (acc.avgReadingTime + day.avgReadingTime) / 2;
        acc.avgScrollDepth = (acc.avgScrollDepth + day.avgScrollDepth) / 2;

        // Agrégation des plateformes de partage
        Object.keys(day.sharesByPlatform).forEach(platform => {
          acc.sharesByPlatform[platform] = (acc.sharesByPlatform[platform] || 0) + day.sharesByPlatform[platform];
        });

        // Agrégation des devices
        Object.keys(day.deviceStats).forEach(device => {
          acc.deviceStats[device] = (acc.deviceStats[device] || 0) + day.deviceStats[device];
        });

        return acc;
      }, {
        totalViews: 0,
        uniqueViews: 0,
        totalShares: 0,
        avgReadingTime: 0,
        avgScrollDepth: 0,
        sharesByPlatform: {},
        deviceStats: {}
      });

      return {
        newsId,
        period: { startDate, endDate },
        totals,
        dailyStats,
        summary: {
          daysWithData: dailyStats.length,
          peakDay: dailyStats.reduce((max, day) =>
            day.totalViews > (max?.totalViews || 0) ? day : max, null),
          trend: this.calculateTrend(dailyStats)
        }
      };
    }, { operation: 'getNewsStats', newsId });
  }

  /**
   * Obtenir les statistiques globales
   */
  static async getGlobalStats(period = 30) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      // Agrégation globale des stats quotidiennes
      const globalStats = await DailyNewsStats.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$totalViews' },
            totalUniqueViews: { $sum: '$uniqueViews' },
            totalShares: { $sum: '$totalShares' },
            avgReadingTime: { $avg: '$avgReadingTime' },
            avgScrollDepth: { $avg: '$avgScrollDepth' },
            articlesWithViews: { $addToSet: '$newsId' },
            dailyBreakdown: {
              $push: {
                date: '$date',
                views: '$totalViews',
                shares: '$totalShares'
              }
            }
          }
        },
        {
          $project: {
            totalViews: 1,
            totalUniqueViews: 1,
            totalShares: 1,
            avgReadingTime: { $round: ['$avgReadingTime', 2] },
            avgScrollDepth: { $round: ['$avgScrollDepth', 2] },
            activeArticles: { $size: '$articlesWithViews' },
            // Pas de tri ici (compatibilité MongoDB < 5.2)
            dailyBreakdown: '$dailyBreakdown'
          }
        }
      ]);

      // Stats par article populaire
      const topArticles = await DailyNewsStats.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$newsId',
            totalViews: { $sum: '$totalViews' },
            totalShares: { $sum: '$totalShares' },
            avgReadingTime: { $avg: '$avgReadingTime' }
          }
        },
        {
          $lookup: {
            from: 'news',
            localField: '_id',
            foreignField: '_id',
            as: 'article'
          }
        },
        {
          $unwind: '$article'
        },
        {
          $project: {
            title: '$article.title',
            slug: '$article.slug',
            totalViews: 1,
            totalShares: 1,
            avgReadingTime: { $round: ['$avgReadingTime', 2] }
          }
        },
        {
          $sort: { totalViews: -1 }
        },
        {
          $limit: 10
        }
      ]);

      const stats = globalStats[0] || {
        totalViews: 0,
        totalUniqueViews: 0,
        totalShares: 0,
        avgReadingTime: 0,
        avgScrollDepth: 0,
        activeArticles: 0,
        dailyBreakdown: []
      };

      // Trier dailyBreakdown côté application (compatible MongoDB < 5.2)
      if (stats.dailyBreakdown && Array.isArray(stats.dailyBreakdown)) {
        stats.dailyBreakdown.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      return {
        period: { startDate, endDate, days: period },
        overview: stats,
        topArticles,
        trends: {
          viewsGrowth: this.calculateGrowthRate(stats.dailyBreakdown, 'views'),
          sharesGrowth: this.calculateGrowthRate(stats.dailyBreakdown, 'shares')
        }
      };
    }, { operation: 'getGlobalStats', period });
  }

  /**
   * Calculer la tendance d'une série de données
   */
  static calculateTrend(dailyStats) {
    if (dailyStats.length < 2) return 'stable';

    const recent = dailyStats.slice(-7); // 7 derniers jours
    const previous = dailyStats.slice(-14, -7); // 7 jours précédents

    const recentAvg = recent.reduce((sum, day) => sum + day.totalViews, 0) / recent.length;
    const previousAvg = previous.reduce((sum, day) => sum + day.totalViews, 0) / previous.length;

    if (recentAvg > previousAvg * 1.1) return 'growing';
    if (recentAvg < previousAvg * 0.9) return 'declining';
    return 'stable';
  }

  /**
   * Calculer le taux de croissance
   */
  static calculateGrowthRate(dailyBreakdown, metric) {
    if (dailyBreakdown.length < 2) return 0;

    const firstHalf = dailyBreakdown.slice(0, Math.floor(dailyBreakdown.length / 2));
    const secondHalf = dailyBreakdown.slice(Math.floor(dailyBreakdown.length / 2));

    const firstAvg = firstHalf.reduce((sum, day) => sum + day[metric], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day[metric], 0) / secondHalf.length;

    return firstAvg === 0 ? 0 : Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  }

  /**
   * Nettoyer les anciennes données (tâche de maintenance)
   */
  static async cleanupOldData(retentionDays = 730) {
    return await NewsErrorHandler.withErrorHandling(async () => {
      await connectDB();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Les ViewEvent et ShareEvent ont un TTL automatique
      // Nettoyer seulement les DailyNewsStats très anciennes
      const deleted = await DailyNewsStats.deleteMany({
        date: { $lt: cutoffDate }
      });

      logger.info(
        LOG_TYPES.MAINTENANCE,
        'Nettoyage des anciennes données analytics',
        {
          cutoffDate,
          deletedStats: deleted.deletedCount,
          retentionDays
        }
      );

      return {
        cutoffDate,
        deletedStats: deleted.deletedCount
      };
    }, { operation: 'cleanupOldData', retentionDays });
  }
}

export default NewsAnalyticsServiceV2;