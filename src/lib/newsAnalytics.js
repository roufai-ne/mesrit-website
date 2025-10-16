// src/lib/newsAnalytics.js
import NewsAnalytics from '@/models/NewsAnalytics';
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

export class NewsAnalyticsService {
  
  /**
   * Enregistrer une vue d'article
   */
  static async trackView(newsId, viewData = {}) {
    try {
      await connectDB();
      
      // Données par défaut pour la vue
      const defaultViewData = {
        timestamp: new Date(),
        userAgent: viewData.userAgent || 'Unknown',
        ip: viewData.ip || 'Unknown',
        referrer: viewData.referrer || '',
        sessionId: viewData.sessionId || null,
        userId: viewData.userId || null,
        readingTime: viewData.readingTime || 0,
        scrollDepth: viewData.scrollDepth || 0
      };
      
      // Trouver ou créer les analytics pour cet article
      let analytics = await NewsAnalytics.findOne({ newsId });
      
      if (!analytics) {
        analytics = new NewsAnalytics({
          newsId,
          totalViews: 0,
          uniqueViews: 0,
          totalShares: 0,
          views: [],
          shares: [],
          dailyStats: [],
          geography: []
        });
      }
      
      // Ajouter la vue
      await analytics.addView(defaultViewData);
      
      // Mettre à jour les stats quotidiennes
      await analytics.updateDailyStats();
      
      // Logger l'événement
      await logger.info(
        LOG_TYPES.USER_ACTION,
        `Vue d'article enregistrée`,
        {
          newsId,
          ip: defaultViewData.ip,
          userAgent: defaultViewData.userAgent.substring(0, 50),
          readingTime: defaultViewData.readingTime
        }
      );
      
      return analytics;
      
    } catch (error) {
      console.error('Erreur lors du tracking de vue:', error);
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur tracking vue article',
        { newsId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Enregistrer un partage d'article
   */
  static async trackShare(newsId, platform, shareData = {}) {
    try {
      await connectDB();
      
      const defaultShareData = {
        platform,
        timestamp: new Date(),
        ip: shareData.ip || 'Unknown',
        userAgent: shareData.userAgent || 'Unknown'
      };
      
      // Trouver ou créer les analytics
      let analytics = await NewsAnalytics.findOne({ newsId });
      
      if (!analytics) {
        analytics = new NewsAnalytics({
          newsId,
          totalViews: 0,
          uniqueViews: 0,
          totalShares: 0,
          views: [],
          shares: [],
          dailyStats: [],
          geography: []
        });
      }
      
      // Ajouter le partage
      await analytics.addShare(defaultShareData);
      
      // Mettre à jour les stats quotidiennes
      await analytics.updateDailyStats();
      
      // Logger l'événement
      await logger.info(
        LOG_TYPES.USER_ACTION,
        `Partage d'article enregistré`,
        {
          newsId,
          platform,
          ip: defaultShareData.ip
        }
      );
      
      return analytics;
      
    } catch (error) {
      console.error('Erreur lors du tracking de partage:', error);
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur tracking partage article',
        { newsId, platform, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Obtenir les statistiques d'un article
   */
  static async getNewsStats(newsId) {
    try {
      await connectDB();
      
      const analytics = await NewsAnalytics.findOne({ newsId })
        .populate('newsId', 'title category createdAt')
        .lean();
      
      if (!analytics) {
        return {
          newsId,
          totalViews: 0,
          uniqueViews: 0,
          totalShares: 0,
          dailyStats: [],
          topReferrers: [],
          sharesByPlatform: {},
          avgReadingTime: 0
        };
      }
      
      // Calculer les statistiques dérivées
      const topReferrers = this.calculateTopReferrers(analytics.views);
      const sharesByPlatform = this.calculateSharesByPlatform(analytics.shares);
      const avgReadingTime = this.calculateAvgReadingTime(analytics.views);
      
      return {
        ...analytics,
        topReferrers,
        sharesByPlatform,
        avgReadingTime
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw error;
    }
  }
  
  /**
   * Obtenir les statistiques globales
   */
  static async getGlobalStats(period = 30) {
    const defaultStats = {
      global: {
        totalArticles: 0,
        totalViews: 0,
        totalUniqueViews: 0,
        totalShares: 0,
        avgViewsPerArticle: 0,
        avgSharesPerArticle: 0
      },
      topArticles: [],
      categoryStats: [],
      trends: {
        daily: [],
        weekly: []
      },
      period
    };

    try {
      await connectDB();
      
      // Vérifier si la collection existe et a des données
      const count = await NewsAnalytics.countDocuments();
      
      if (count === 0) {
        console.log('Aucune donnée analytics trouvée, retour des valeurs par défaut');
        return defaultStats;
      }
      
      // Essayer de récupérer les stats globales
      let globalStats = defaultStats.global;
      try {
        const globalStatsResult = await NewsAnalytics.getGlobalStats(period);
        if (globalStatsResult && globalStatsResult.length > 0) {
          globalStats = globalStatsResult[0];
        }
      } catch (err) {
        console.error('Erreur récupération stats globales:', err);
      }
      
      // Essayer de récupérer les top articles
      let topArticles = [];
      try {
        topArticles = await NewsAnalytics.getTopArticles(10, period) || [];
      } catch (err) {
        console.error('Erreur récupération top articles:', err);
      }
      
      // Essayer de récupérer les stats par catégorie
      let categoryStats = [];
      try {
        categoryStats = await this.getCategoryStats(period) || [];
      } catch (err) {
        console.error('Erreur récupération stats catégories:', err);
      }
      
      // Essayer de récupérer les tendances
      let trends = { daily: [], weekly: [] };
      try {
        trends = await this.getTrends(period) || { daily: [], weekly: [] };
      } catch (err) {
        console.error('Erreur récupération tendances:', err);
      }
      
      return {
        global: globalStats,
        topArticles,
        categoryStats,
        trends,
        period
      };
      
    } catch (error) {
      console.error('Erreur critique lors de la récupération des stats globales:', error);
      console.error('Stack trace:', error.stack);
      
      // Retourner des données par défaut en cas d'erreur critique
      return defaultStats;
    }
  }
  
  /**
   * Obtenir les articles les plus populaires
   */
  static async getTopArticles(limit = 10, period = 30) {
    try {
      await connectDB();
      return await NewsAnalytics.getTopArticles(limit, period);
    } catch (error) {
      console.error('Erreur lors de la récupération du top articles:', error);
      throw error;
    }
  }
  
  /**
   * Calculer les top referrers
   */
  static calculateTopReferrers(views) {
    const referrerCounts = {};
    
    views.forEach(view => {
      if (view.referrer && view.referrer !== '') {
        try {
          const domain = new URL(view.referrer).hostname;
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        } catch {
          referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
        }
      } else {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
      }
    });
    
    return Object.entries(referrerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));
  }
  
  /**
   * Calculer les partages par plateforme
   */
  static calculateSharesByPlatform(shares) {
    const platformCounts = {};
    
    shares.forEach(share => {
      platformCounts[share.platform] = (platformCounts[share.platform] || 0) + 1;
    });
    
    return platformCounts;
  }
  
  /**
   * Calculer le temps de lecture moyen
   */
  static calculateAvgReadingTime(views) {
    const readingTimes = views
      .filter(view => view.readingTime && view.readingTime > 0)
      .map(view => view.readingTime);
    
    if (readingTimes.length === 0) return 0;
    
    return Math.round(readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length);
  }
  
  /**
   * Obtenir les statistiques par catégorie
   */
  static async getCategoryStats(period = 30) {
    try {
      await connectDB();
      
      const count = await NewsAnalytics.countDocuments();
      if (count === 0) {
        return [];
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      return await NewsAnalytics.aggregate([
        {
          $match: {
            lastUpdated: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'news',
            localField: 'newsId',
            foreignField: '_id',
            as: 'newsData'
          }
        },
        {
          $unwind: '$newsData'
        },
        {
          $group: {
            _id: '$newsData.category',
            totalViews: { $sum: '$totalViews' },
            totalShares: { $sum: '$totalShares' },
            articleCount: { $sum: 1 },
            avgViews: { $avg: '$totalViews' }
          }
        },
        {
          $sort: { totalViews: -1 }
        }
      ]);
      
    } catch (error) {
      console.error('Erreur lors du calcul des stats par catégorie:', error);
      return [];
    }
  }
  
  /**
   * Obtenir les tendances temporelles
   */
  static async getTrends(period = 30) {
    try {
      await connectDB();
      
      const count = await NewsAnalytics.countDocuments();
      if (count === 0) {
        return { daily: [], weekly: [] };
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      const dailyTrends = await NewsAnalytics.aggregate([
        {
          $match: {
            lastUpdated: { $gte: startDate }
          }
        },
        {
          $unwind: '$dailyStats'
        },
        {
          $match: {
            'dailyStats.date': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$dailyStats.date'
              }
            },
            totalViews: { $sum: '$dailyStats.views' },
            totalShares: { $sum: '$dailyStats.shares' },
            avgReadingTime: { $avg: '$dailyStats.avgReadingTime' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
      
      return {
        daily: dailyTrends || [],
        weekly: [] // Simplifier pour l'instant
      };
      
    } catch (error) {
      console.error('Erreur lors du calcul des tendances:', error);
      return { daily: [], weekly: [] };
    }
  }
  
  /**
   * Nettoyer les anciennes données (plus de 1 an)
   */
  static async cleanupOldData() {
    try {
      await connectDB();
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // Supprimer les vues anciennes
      await NewsAnalytics.updateMany(
        {},
        {
          $pull: {
            views: { timestamp: { $lt: oneYearAgo } },
            shares: { timestamp: { $lt: oneYearAgo } },
            dailyStats: { date: { $lt: oneYearAgo } }
          }
        }
      );
      
      await logger.info(
        LOG_TYPES.SYSTEM_MAINTENANCE,
        'Nettoyage des anciennes données analytics effectué',
        { cutoffDate: oneYearAgo }
      );
      
    } catch (error) {
      console.error('Erreur lors du nettoyage des données:', error);
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur nettoyage données analytics',
        { error: error.message }
      );
    }
  }
}

export default NewsAnalyticsService;