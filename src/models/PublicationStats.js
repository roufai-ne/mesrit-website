import mongoose from 'mongoose';

const PublicationStatsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  
  // Publications par type
  publicationsByType: [{
    type: { 
      type: String, 
      required: true,
      enum: ['Article de journal', 'Communication de conférence', 'Livre/Chapitre', 'Thèse', 'Rapport de recherche', 'Autre']
    },
    count: { type: Number, required: true, default: 0 }
  }],
  
  // Publications par domaine scientifique
  publicationsByDomain: [{
    domain: { 
      type: String, 
      required: true,
      enum: ['Sciences exactes', 'Sciences de l\'ingénieur', 'Sciences médicales', 'Sciences humaines', 'Sciences sociales', 'Sciences économiques', 'Sciences juridiques', 'Autre']
    },
    count: { type: Number, required: true, default: 0 }
  }],
  
  // Publications par établissement
  publicationsByInstitution: [{
    institutionName: { type: String, required: true },
    institutionType: { type: String, enum: ['public', 'private'], required: true },
    count: { type: Number, required: true, default: 0 }
  }],
  
  // Publications internationales vs nationales
  publicationsByScope: {
    international: { type: Number, required: true, default: 0 },
    national: { type: Number, required: true, default: 0 }
  },
  
  // Publications avec collaboration
  collaborations: {
    withInternationalPartners: { type: Number, default: 0 },
    withNationalPartners: { type: Number, default: 0 },
    interInstitutional: { type: Number, default: 0 }
  },
  
  // Métriques de qualité
  qualityMetrics: {
    indexedPublications: { type: Number, default: 0 }, // Publications indexées (Scopus, Web of Science, etc.)
    peerReviewedPublications: { type: Number, default: 0 }, // Publications avec comité de lecture
    impactFactorTotal: { type: Number, default: 0 }, // Somme des facteurs d'impact
    citationsTotal: { type: Number, default: 0 } // Nombre total de citations
  },
  
  // Statistiques générales
  totalPublications: { type: Number, required: true },
  averagePublicationsPerResearcher: { type: Number, default: 0 },
  
  // Métadonnées
  dataSource: { type: String, default: 'Manuel' }, // Manuel, DHIS2, Import, etc.
  notes: { type: String }, // Notes ou commentaires sur les données
  
}, { timestamps: true });

// Index pour les requêtes fréquentes
PublicationStatsSchema.index({ year: -1 });
PublicationStatsSchema.index({ year: -1, 'publicationsByInstitution.institutionType': 1 });

// Méthode pour calculer le total automatiquement
PublicationStatsSchema.pre('save', function(next) {
  // Recalcul du total basé sur les types de publications
  if (this.publicationsByType && this.publicationsByType.length > 0) {
    this.totalPublications = this.publicationsByType.reduce((sum, pub) => sum + pub.count, 0);
  }
  
  // Validation cohérence international + national = total par scope
  const scopeTotal = this.publicationsByScope.international + this.publicationsByScope.national;
  if (scopeTotal > 0 && scopeTotal !== this.totalPublications) {
    console.warn(`Incohérence détectée: scope total (${scopeTotal}) != total publications (${this.totalPublications})`);
  }
  
  next();
});

// Méthode statique pour obtenir les statistiques récentes
PublicationStatsSchema.statics.getLatestStats = function() {
  return this.findOne().sort({ year: -1 }).lean();
};

// Méthode statique pour obtenir les tendances
PublicationStatsSchema.statics.getTrends = function(yearsBack = 5) {
  const currentYear = new Date().getFullYear();
  return this.find({
    year: { $gte: currentYear - yearsBack }
  }).sort({ year: -1 }).lean();
};

export const PublicationStats = mongoose.models.PublicationStats || mongoose.model('PublicationStats', PublicationStatsSchema);
