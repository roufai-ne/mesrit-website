// src/models/NewsletterConfig.js
import mongoose from 'mongoose';

const newsletterConfigSchema = new mongoose.Schema({
  // Configuration générale
  autoSendEnabled: {
    type: Boolean,
    default: true
  },
  
  // Catégories à inclure dans l'envoi automatique
  includedCategories: [{
    type: String,
    default: []
  }],
  
  // Catégories à exclure
  excludedCategories: [{
    type: String,
    default: []
  }],
  
  // Type d'envoi
  sendType: {
    type: String,
    enum: ['immediate', 'daily_digest', 'weekly_digest', 'manual_only'],
    default: 'immediate'
  },
  
  // Heure d'envoi pour les digests (format HH:MM)
  digestTime: {
    type: String,
    default: '09:00'
  },
  
  // Jour de la semaine pour digest hebdomadaire (0 = dimanche, 1 = lundi, etc.)
  weeklyDigestDay: {
    type: Number,
    default: 1, // Lundi
    min: 0,
    max: 6
  },
  
  // Template personnalisé (optionnel)
  customTemplate: {
    type: String,
    default: null
  },
  
  // Signature email
  emailSignature: {
    type: String,
    default: 'Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique\nRépublique du Niger'
  },
  
  // Dernière modification
  lastModifiedBy: {
    type: String,
    required: true
  },
  
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Il ne peut y avoir qu'une seule configuration
newsletterConfigSchema.index({}, { unique: true });

export default mongoose.models.NewsletterConfig || 
  mongoose.model('NewsletterConfig', newsletterConfigSchema);