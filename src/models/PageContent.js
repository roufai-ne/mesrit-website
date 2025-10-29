// src/models/PageContent.js
import mongoose from 'mongoose';

/**
 * Modèle pour le contenu des pages crawlées du site
 * Utilisé par le chatbot pour fournir des réponses basées sur le contenu complet du site
 */
const PageContentSchema = new mongoose.Schema({
  // URL unique de la page
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Titre de la page
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Contenu textuel extrait (sans HTML)
  content: {
    type: String,
    required: true,
    text: true // Index pour recherche full-text
  },

  // Métadonnées
  section: {
    type: String, // ex: 'ministere', 'actualites', 'services', etc.
    trim: true,
    default: 'general'
  },

  category: {
    type: String, // Catégorie plus spécifique
    trim: true
  },

  // Mots-clés extraits
  keywords: [{
    type: String,
    trim: true
  }],

  // Description/résumé court
  description: {
    type: String,
    trim: true
  },

  // Date du dernier crawl
  lastCrawled: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Statut
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Nombre de fois référencée dans les réponses du chatbot
  referenceCount: {
    type: Number,
    default: 0
  },

  // Score de pertinence (peut être ajusté manuellement)
  relevanceScore: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 10
  },

  // Métadonnées de crawl
  crawlMeta: {
    statusCode: Number,
    crawlDuration: Number, // ms
    contentLength: Number, // bytes
    lastError: String
  }

}, {
  timestamps: true, // createdAt, updatedAt automatiques
  collection: 'pagecontents'
});

// Index pour la recherche full-text (MongoDB 4+)
PageContentSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  keywords: 'text'
}, {
  weights: {
    title: 10,      // Titre très important
    keywords: 8,    // Mots-clés très importants
    description: 5, // Description importante
    content: 1      // Contenu poids normal
  },
  name: 'page_text_search',
  default_language: 'french' // Support français
});

// Index composé pour les requêtes fréquentes
PageContentSchema.index({ isActive: 1, lastCrawled: -1 });
PageContentSchema.index({ section: 1, isActive: 1 });

// Méthodes du modèle

/**
 * Recherche full-text dans les pages
 */
PageContentSchema.statics.searchPages = async function(query, options = {}) {
  const {
    limit = 5,
    activeOnly = true,
    sections = null
  } = options;

  const searchQuery = {
    $text: { $search: query }
  };

  if (activeOnly) {
    searchQuery.isActive = true;
  }

  if (sections && Array.isArray(sections)) {
    searchQuery.section = { $in: sections };
  }

  return this.find(searchQuery)
    .select('title url content description section category relevanceScore')
    .limit(limit)
    .sort({ score: { $meta: 'textScore' }, relevanceScore: -1 })
    .lean();
};

/**
 * Obtenir les pages les plus référencées
 */
PageContentSchema.statics.getMostReferenced = async function(limit = 10) {
  return this.find({ isActive: true })
    .select('title url referenceCount section')
    .sort({ referenceCount: -1 })
    .limit(limit)
    .lean();
};

/**
 * Incrémenter le compteur de référence
 */
PageContentSchema.methods.incrementReference = async function() {
  this.referenceCount += 1;
  return this.save();
};

/**
 * Marquer comme crawlée
 */
PageContentSchema.methods.markAsCrawled = async function(success = true, error = null) {
  this.lastCrawled = new Date();
  if (error) {
    this.crawlMeta = this.crawlMeta || {};
    this.crawlMeta.lastError = error;
  }
  return this.save();
};

// Middleware pre-save: nettoyer et valider
PageContentSchema.pre('save', function(next) {
  // Nettoyer le contenu des espaces multiples
  if (this.content) {
    this.content = this.content
      .replace(/\s+/g, ' ') // Espaces multiples → un seul
      .trim();
  }

  // Générer description si manquante
  if (!this.description && this.content) {
    this.description = this.content.substring(0, 200) + '...';
  }

  // Extraire section depuis URL si manquante
  if (!this.section && this.url) {
    const urlParts = this.url.split('/').filter(Boolean);
    if (urlParts.length > 3) {
      this.section = urlParts[3]; // ex: https://site.com/section/page
    }
  }

  next();
});

// Éviter la réindexation si le modèle existe déjà
const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);

export default PageContent;
