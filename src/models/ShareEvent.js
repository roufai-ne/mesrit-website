// src/models/ShareEvent.js
import mongoose from 'mongoose';

// Modèle pour les événements de partage
const shareEventSchema = new mongoose.Schema({
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
  platform: {
    type: String,
    required: true,
    enum: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy', 'other'],
    index: true
  },
  sessionId: {
    type: String,
    required: true
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
    maxlength: 500
  },
  referrer: {
    type: String,
    maxlength: 500
  },
  // Métadonnées du partage
  shareUrl: String,
  shareText: String,
  customMessage: String,
  // Géolocalisation
  country: String,
  city: String
}, {
  timestamps: true,
  collection: 'shareevents',
  // TTL index pour auto-suppression après 2 ans
  expires: 60 * 60 * 24 * 365 * 2
});

// Index composites
shareEventSchema.index({ newsId: 1, timestamp: -1 });
shareEventSchema.index({ platform: 1, timestamp: -1 });
shareEventSchema.index({ timestamp: -1, newsId: 1 });
shareEventSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

// Méthodes statiques
shareEventSchema.statics.getSharesForNews = function(newsId, startDate, endDate) {
  const query = { newsId };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  return this.find(query).sort({ timestamp: -1 });
};

shareEventSchema.statics.getSharesByPlatform = function(newsId, startDate, endDate) {
  const matchStage = { newsId: new mongoose.Types.ObjectId(newsId) };

  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
        lastShare: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

export default mongoose.models.ShareEvent || mongoose.model('ShareEvent', shareEventSchema);