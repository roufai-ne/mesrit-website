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
newsAnalyticsSchema.methods.addView = async function(viewData) {
  // Vérifier en base si c'est une vue unique dans les dernières 24h (IP + UserAgent)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const uniqueAlreadyExists = await this.constructor.exists({
    _id: this._id,
    views: {
      $elemMatch: {
        ip: viewData.ip,
        userAgent: viewData.userAgent,
        timestamp: { $gt: cutoff }
      }
    }
  });

  const inc = { totalViews: 1 };
  if (!uniqueAlreadyExists) {
    inc.uniqueViews = 1;
  }

  // Mise à jour atomique avec upsert pour éviter les conflits de version
  try {
    await this.constructor.updateOne(
      { _id: this._id },
      [
        {
          $set: {
            newsId: { $ifNull: ["$newsId", this.newsId] },
            views: { $concatArrays: [{ $ifNull: ["$views", []] }, [viewData]] },
            shares: { $ifNull: ["$shares", []] },
            dailyStats: { $ifNull: ["$dailyStats", []] },
            geography: { $ifNull: ["$geography", []] },
            totalViews: { $add: [{ $ifNull: ["$totalViews", 0] }, inc.totalViews || 0] },
            uniqueViews: { $add: [{ $ifNull: ["$uniqueViews", 0] }, inc.uniqueViews || 0] },
            lastUpdated: new Date()
          }
        }
      ],
      { upsert: true }
    );
  } catch (error) {
    console.error('Error in addView:', error);
    throw error;
  }
};

newsAnalyticsSchema.methods.addShare = async function(shareData) {
  // Mise à jour atomique avec upsert
  try {
    await this.constructor.updateOne(
      { _id: this._id },
      [
        {
          $set: {
            newsId: { $ifNull: ["$newsId", this.newsId] },
            views: { $ifNull: ["$views", []] },
            shares: { $concatArrays: [{ $ifNull: ["$shares", []] }, [shareData]] },
            dailyStats: { $ifNull: ["$dailyStats", []] },
            geography: { $ifNull: ["$geography", []] },
            totalShares: { $add: [{ $ifNull: ["$totalShares", 0] }, 1] },
            lastUpdated: new Date()
          }
        }
      ],
      { upsert: true }
    );
  } catch (error) {
    console.error('Error in addShare:', error);
    throw error;
  }
};

newsAnalyticsSchema.methods.updateDailyStats = async function(date = new Date()) {
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
  
  // Vérification d'existence du document avant save
  const current = await this.constructor.findById(this._id);
  if (!current) {
    throw new Error(`Le document NewsAnalytics avec l'id ${this._id} n'existe plus (suppression concurrente ou conflit de version).`);
  }
  // Appliquer la mise à jour atomique de la dailyStat
  const updateExisting = await this.constructor.updateOne(
    { _id: this._id, 'dailyStats.date': targetDate },
    {
      $set: {
        'dailyStats.$.views': dailyStat.views,
        'dailyStats.$.uniqueViews': dailyStat.uniqueViews,
        'dailyStats.$.shares': dailyStat.shares,
        'dailyStats.$.avgReadingTime': dailyStat.avgReadingTime,
        lastUpdated: new Date()
      }
    }
  );

  if (updateExisting.matchedCount === 0) {
    // Si aucune entrée pour ce jour, on pousse une nouvelle
    await this.constructor.updateOne(
      { _id: this._id },
      {
        $push: { dailyStats: dailyStat },
        $set: { lastUpdated: new Date() }
      }
    );
  }
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