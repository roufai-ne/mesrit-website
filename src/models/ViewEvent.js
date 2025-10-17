// src/models/ViewEvent.js
import mongoose from 'mongoose';

// Modèle pour les événements de vue individuels (données chaudes)
const viewEventSchema = new mongoose.Schema({
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
     },
  referrer: {
    type: String,
   
  },
  readingTime: {
    type: Number,
    default: 0,
    min: 0
  },
  scrollDepth: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Géolocalisation simplifiée
  country: String,
  city: String,
  // Métriques vidéo
  videoWatched: {
    type: Boolean,
    default: false
  },
  videoCurrentTime: {
    type: Number,
    default: 0,
    min: 0
  },
  videoDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  // Métadonnées
  isBot: {
    type: Boolean,
    default: false
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true,
  // Optimisations
  collection: 'viewevents',
  // TTL index pour auto-suppression après 2 ans
  expires: 60 * 60 * 24 * 365 * 2
});

// Index composites pour performance
viewEventSchema.index({ newsId: 1, timestamp: -1 });
viewEventSchema.index({ sessionId: 1, timestamp: -1 });
viewEventSchema.index({ timestamp: -1, newsId: 1 });
viewEventSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

// Méthodes statiques
viewEventSchema.statics.getViewsForNews = function(newsId, startDate, endDate) {
  const query = { newsId };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  return this.find(query).sort({ timestamp: -1 });
};

viewEventSchema.statics.getUniqueViewsForNews = function(newsId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        newsId: new mongoose.Types.ObjectId(newsId),
        ...(startDate || endDate ? {
          timestamp: {
            ...(startDate && { $gte: startDate }),
            ...(endDate && { $lte: endDate })
          }
        } : {})
      }
    },
    {
      $group: {
        _id: { sessionId: '$sessionId', userId: '$userId' },
        firstView: { $min: '$timestamp' },
        totalReadingTime: { $sum: '$readingTime' },
        maxScrollDepth: { $max: '$scrollDepth' }
      }
    },
    {
      $count: 'uniqueViews'
    }
  ];

  return this.aggregate(pipeline);
};

// Middleware pour détection de bot
viewEventSchema.pre('save', function(next) {
  if (this.userAgent) {
    const botPatterns = [
      /bot/i, /crawl/i, /spider/i, /scrape/i,
      /facebook/i, /twitter/i, /linkedin/i
    ];
    this.isBot = botPatterns.some(pattern => pattern.test(this.userAgent));
  }

  // Détection type d'appareil basique
  if (this.userAgent) {
    if (/mobile/i.test(this.userAgent)) {
      this.deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(this.userAgent)) {
      this.deviceType = 'tablet';
    } else if (/desktop|windows|mac|linux/i.test(this.userAgent)) {
      this.deviceType = 'desktop';
    }
  }

  next();
});

export default mongoose.models.ViewEvent || mongoose.model('ViewEvent', viewEventSchema);