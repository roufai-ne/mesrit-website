// src/models/NewsAnalytics.js
import mongoose from 'mongoose';

const newsAnalyticsSchema = new mongoose.Schema({
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
    index: true
  },
  // Métriques de base
  totalViews: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  totalShares: {
    type: Number,
    default: 0
  },
  // Vues détaillées
  views: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ip: String,
    referrer: String,
    sessionId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readingTime: Number, // en secondes
    scrollDepth: Number, // pourcentage de scroll
    // Métriques vidéo
    videoWatched: {
      type: Boolean,
      default: false
    },
    videoCurrentTime: {
      type: Number,
      default: 0 // position en secondes
    },
    videoTotalDuration: {
      type: Number,
      default: 0
    },
    videoWatchPercentage: {
      type: Number,
      default: 0 // pourcentage visionné
    },
    videosInteracted: [{
      videoUrl: String,
      watchTime: Number,
      totalDuration: Number,
      watchPercentage: Number,
      interactions: [{
        type: {
          type: String,
          enum: ['play', 'pause', 'seek', 'volume_change', 'fullscreen']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        value: mongoose.Schema.Types.Mixed // position, volume, etc.
      }]
    }]
  }],
  // Partages par plateforme
  shares: [{
    platform: {
      type: String,
      enum: ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  // Métriques par période
  dailyStats: [{
    date: {
      type: Date,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    avgReadingTime: {
      type: Number,
      default: 0
    },
    // Métriques vidéo quotidiennes
    videoViews: {
      type: Number,
      default: 0
    },
    videoWatchTime: {
      type: Number,
      default: 0
    }
  }],
  // Répartition géographique
  geography: [{
    country: String,
    region: String,
    city: String,
    count: {
      type: Number,
      default: 0
    }
  }]
});

// Mettre à jour lastUpdated à chaque modification
newsAnalyticsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});
newsAnalyticsSchema.index({ 'views.timestamp': -1 });
newsAnalyticsSchema.index({ 'shares.timestamp': -1 });
newsAnalyticsSchema.index({ lastUpdated: -1 });

// Méthodes du modèle
newsAnalyticsSchema.methods.addView = function(viewData) {
  // Vérifier si c'est une vue unique (basée sur IP + UserAgent) avant l'insertion
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingView = this.views.find(v => {
    const ts = v.timestamp instanceof Date ? v.timestamp : new Date(v.timestamp);
    return v.ip === viewData.ip && v.userAgent === viewData.userAgent && ts > cutoff;
  });

  // Insérer la vue et incrémenter les compteurs
  this.views.push(viewData);
  this.totalViews += 1;
  if (!existingView) {
    this.uniqueViews += 1;
  }

  this.lastUpdated = new Date();
  return this.save();
};

newsAnalyticsSchema.methods.addShare = function(shareData) {
  this.shares.push(shareData);
  this.totalShares += 1;
  this.lastUpdated = new Date();
  return this.save();
};

newsAnalyticsSchema.methods.updateDailyStats = function(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const targetDate = new Date(dateStr);
  
  // Trouver ou créer les stats du jour
  let dailyStat = this.dailyStats.find(stat => 
    stat.date.toISOString().split('T')[0] === dateStr
  );
  
  if (!dailyStat) {
    dailyStat = {
      date: targetDate,
      views: 0,
      uniqueViews: 0,
      shares: 0,
      avgReadingTime: 0
    };
    this.dailyStats.push(dailyStat);
  }
  
  // Calculer les stats du jour
  const dayViews = this.views.filter(v => 
    v.timestamp.toISOString().split('T')[0] === dateStr
  );
  
  const dayShares = this.shares.filter(s => 
    s.timestamp.toISOString().split('T')[0] === dateStr
  );
  
  dailyStat.views = dayViews.length;
  dailyStat.shares = dayShares.length;
  
  // Calculer les vues uniques du jour
  const uniqueIPs = new Set(dayViews.map(v => v.ip));
  dailyStat.uniqueViews = uniqueIPs.size;
  
  // Calculer le temps de lecture moyen
  const readingTimes = dayViews.filter(v => v.readingTime > 0).map(v => v.readingTime);
  dailyStat.avgReadingTime = readingTimes.length > 0 
    ? readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length 
    : 0;
  
  this.lastUpdated = new Date();
  return this.save();
};

// Méthodes statiques
newsAnalyticsSchema.statics.getTopArticles = function(limit = 10, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.aggregate([
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
      $project: {
        newsId: 1,
        title: '$newsData.title',
        category: '$newsData.category',
        totalViews: 1,
        uniqueViews: 1,
        totalShares: 1,
        engagementRate: {
          $cond: {
            if: { $gt: ['$totalViews', 0] },
            then: { $divide: ['$totalShares', '$totalViews'] },
            else: 0
          }
        }
      }
    },
    {
      $sort: { totalViews: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

newsAnalyticsSchema.statics.getGlobalStats = function(period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.aggregate([
    {
      $match: {
        lastUpdated: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalArticles: { $sum: 1 },
        totalViews: { $sum: '$totalViews' },
        totalUniqueViews: { $sum: '$uniqueViews' },
        totalShares: { $sum: '$totalShares' },
        avgViewsPerArticle: { $avg: '$totalViews' },
        avgSharesPerArticle: { $avg: '$totalShares' }
      }
    }
  ]);
};

export default mongoose.models.NewsAnalytics || mongoose.model('NewsAnalytics', newsAnalyticsSchema);