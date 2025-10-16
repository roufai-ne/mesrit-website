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
    enum: ['pending', 'active', 'unsubscribed'],
    default: 'pending'
  },
  confirmationToken: String,
  confirmationTokenExpires: Date,
  unsubscribeToken: String, // Ajout d’un token pour la désinscription
  unsubscribeTokenExpires: Date, // Date d’expiration du token de désinscription
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);