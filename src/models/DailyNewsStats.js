// src/models/DailyNewsStats.js
import mongoose from 'mongoose';

// Modèle pour les statistiques quotidiennes (données froides agrégées)
const dailyNewsStatsSchema = new mongoose.Schema({
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Métriques de vue
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  uniqueViews: {
    type: Number,
    default: 0,
    min: 0
  },
  // Métriques d'engagement
  avgReadingTime: {
    type: Number,
    default: 0,
    min: 0
  },
  avgScrollDepth: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Métriques de partage
  totalShares: {
    type: Number,
    default: 0,
    min: 0
  },
  sharesByPlatform: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 },
    whatsapp: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  // Métriques géographiques
  topCountries: [{
    country: String,
    views: Number
  }],
  topCities: [{
    city: String,
    country: String,
    views: Number
  }],
  // Métriques d'appareil
  deviceStats: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    unknown: { type: Number, default: 0 }
  },
  // Métriques de référence
  topReferrers: [{
    referrer: String,
    views: Number
  }],
  // Métriques vidéo (si applicable)
  videoStats: {
    totalWatched: { type: Number, default: 0 },
    avgWatchTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  // Métadonnées
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'dailynewsstats'
});

// Index unique pour éviter les doublons
dailyNewsStatsSchema.index({ newsId: 1, date: 1 }, { unique: true });
dailyNewsStatsSchema.index({ date: -1 });
dailyNewsStatsSchema.index({ newsId: 1, date: -1 });

// Remplacez la méthode aggregateStatsForDate (lignes 108-223)
dailyNewsStatsSchema.statics.aggregateStatsForDate = async function(newsId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Import dynamique pour éviter les dépendances circulaires
  const ViewEvent = (await import('./ViewEvent.js')).default;
  const ShareEvent = (await import('./ShareEvent.js')).default;

  // ✅ CORRECTION : Agrégation des vues simplifiée
  const viewStats = await ViewEvent.aggregate([
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        isBot: { $ne: true }
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        avgReadingTime: { $avg: '$readingTime' },
        avgScrollDepth: { $avg: '$scrollDepth' },
        countries: { $push: '$country' },
        cities: { $push: { city: '$city', country: '$country' } },
        devices: { $push: '$deviceType' },
        referrers: { $push: '$referrer' },
        videoWatched: { $sum: { $cond: ['$videoWatched', 1, 0] } },
        avgVideoTime: { $avg: '$videoCurrentTime' }
      }
    }
  ]);

  // ✅ Agrégation séparée pour les pays (top 5)
  const countryStats = await ViewEvent.aggregate([
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        isBot: { $ne: true },
        country: { $exists: true, $ne: null }
      }
    },
    { $sortByCount: '$country' },
    { $limit: 5 },
    {
      $project: {
        country: '$_id',
        views: '$count',
        _id: 0
      }
    }
  ]);

  // ✅ Agrégation séparée pour les devices
  const deviceStats = await ViewEvent.aggregate([
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        isBot: { $ne: true }
      }
    },
    { $sortByCount: '$deviceType' },
    {
      $group: {
        _id: null,
        devices: {
          $push: {
            k: '$_id',
            v: '$count'
          }
        }
      }
    },
    {
      $project: {
        deviceStats: { $arrayToObject: '$devices' }
      }
    }
  ]);

  // ✅ Agrégation des partages
  const shareStats = await ShareEvent.aggregate([
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalShares: { $sum: 1 }
      }
    }
  ]);

  // ✅ Agrégation des partages par plateforme
  const platformStats = await ShareEvent.aggregate([
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    { $sortByCount: '$platform' },
    {
      $group: {
        _id: null,
        platforms: {
          $push: {
            k: '$_id',
            v: '$count'
          }
        }
      }
    },
    {
      $project: {
        sharesByPlatform: { $arrayToObject: '$platforms' }
      }
    }
  ]);

  // ✅ Assembler les résultats
  const stats = viewStats[0] || {};
  const shares = shareStats[0] || {};
  const platforms = platformStats[0] || {};
  const devices = deviceStats[0] || {};

  return {
    newsId,
    date: startOfDay,
    totalViews: stats.totalViews || 0,
    uniqueViews: stats.uniqueSessions ? stats.uniqueSessions.length : 0,
    avgReadingTime: Math.round(stats.avgReadingTime || 0),
    avgScrollDepth: Math.round(stats.avgScrollDepth || 0),
    totalShares: shares.totalShares || 0,
    sharesByPlatform: {
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      whatsapp: 0,
      email: 0,
      copy: 0,
      ...platforms.sharesByPlatform
    },
    topCountries: countryStats || [],
    deviceStats: {
      mobile: 0,
      tablet: 0,
      desktop: 0,
      unknown: 0,
      ...devices.deviceStats
    },
    videoStats: {
      totalWatched: stats.videoWatched || 0,
      avgWatchTime: Math.round(stats.avgVideoTime || 0),
      completionRate: 0
    },
    lastUpdated: new Date(),
    isComplete: true
  };
};

// Méthode pour obtenir les stats d'une période
dailyNewsStatsSchema.statics.getStatsForPeriod = function(newsId, startDate, endDate) {
  return this.find({
    newsId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

export default mongoose.models.DailyNewsStats || mongoose.model('DailyNewsStats', dailyNewsStatsSchema);