// models/NewsletterStats.js
import mongoose from 'mongoose';

const NewsletterStatsSchema = new mongoose.Schema({
  subject: String,
  sentAt: Date,
  totalRecipients: Number,
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  // Détails par abonné
  interactions: [{
    subscriberId: mongoose.Schema.Types.ObjectId,
    opened: Boolean,
    clicked: Boolean,
    openedAt: Date,
    clickedAt: Date
  }]
}, {
  timestamps: true
});

export const NewsletterStats = mongoose.models.NewsletterStats || 
  mongoose.model('NewsletterStats', NewsletterStatsSchema);