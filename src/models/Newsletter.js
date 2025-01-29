// models/Newsletter.js
import mongoose from 'mongoose';

// Modèle Newsletter
const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  }
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);