// src/models/Partner.js
import mongoose from 'mongoose';

/**
 * Modèle pour les partenaires techniques et financiers
 */
const PartnerSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // Logo du partenaire
  logo: {
    type: String,
    required: true
  },

  // Type de partenaire
  type: {
    type: String,
    required: true,
    enum: ['technique', 'financier', 'academique', 'institutionnel'],
    default: 'technique',
    index: true
  },

  // Description courte
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Site web
  website: {
    type: String,
    trim: true
  },

  // Pays d'origine
  country: {
    type: String,
    trim: true
  },

  // Ordre d'affichage
  order: {
    type: Number,
    default: 0,
    index: true
  },

  // Statut
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Mise en avant (featured)
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  // Date de début du partenariat
  startDate: {
    type: Date
  },

  // Date de fin du partenariat (optionnel)
  endDate: {
    type: Date
  },

  // Domaines de collaboration
  domains: [{
    type: String,
    trim: true
  }],

  // Projets en cours avec ce partenaire
  projects: [{
    name: String,
    description: String,
    budget: Number,
    startDate: Date,
    endDate: Date
  }],

  // Coordonnées de contact
  contact: {
    email: String,
    phone: String,
    address: String,
    representative: String // Nom du représentant
  },

  // Métadonnées
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }

}, {
  timestamps: true, // createdAt, updatedAt
  collection: 'partners'
});

// Index composés pour les requêtes fréquentes
PartnerSchema.index({ isActive: 1, order: 1 });
PartnerSchema.index({ type: 1, isActive: 1, order: 1 });
PartnerSchema.index({ isFeatured: 1, isActive: 1 });

// Méthode statique pour obtenir les partenaires actifs par type
PartnerSchema.statics.getByType = async function(type, activeOnly = true) {
  const query = { type };
  if (activeOnly) {
    query.isActive = true;
  }

  return this.find(query)
    .sort({ order: 1, name: 1 })
    .lean();
};

// Méthode statique pour obtenir les partenaires en vedette
PartnerSchema.statics.getFeatured = async function(limit = 6) {
  return this.find({
    isActive: true,
    isFeatured: true
  })
    .sort({ order: 1 })
    .limit(limit)
    .lean();
};

// Méthode statique pour obtenir tous les partenaires groupés par type
PartnerSchema.statics.getGroupedByType = async function() {
  const partners = await this.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();

  return partners.reduce((acc, partner) => {
    if (!acc[partner.type]) {
      acc[partner.type] = [];
    }
    acc[partner.type].push(partner);
    return acc;
  }, {});
};

// Méthode pour vérifier si le partenariat est actif (date)
PartnerSchema.methods.isPartnershipActive = function() {
  const now = new Date();

  if (this.startDate && this.startDate > now) {
    return false; // Pas encore commencé
  }

  if (this.endDate && this.endDate < now) {
    return false; // Terminé
  }

  return this.isActive;
};

// Virtuel pour obtenir le nombre de projets actifs
PartnerSchema.virtual('activeProjectsCount').get(function() {
  if (!this.projects) return 0;

  const now = new Date();
  return this.projects.filter(project => {
    return (!project.endDate || project.endDate > now);
  }).length;
});

// Middleware pre-save : validation
PartnerSchema.pre('save', function(next) {
  // Vérifier que endDate > startDate
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    next(new Error('La date de fin doit être postérieure à la date de début'));
  }

  next();
});

// Éviter la réindexation si le modèle existe déjà
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);

export default Partner;
