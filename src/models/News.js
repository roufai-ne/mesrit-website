// src/models/News.js
import mongoose from 'mongoose';

// Utilitaire simple pour transformer une chaîne en slug normalisé
function slugify(input = '') {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // supprimer caractères spéciaux
    .replace(/\s+/g, '-') // espaces -> tirets
    .replace(/-+/g, '-') // tirets multiples -> un seul
    .replace(/^-|-$/g, '') // enlever tirets début/fin
    .slice(0, 60) // limite de longueur
    .replace(/-[^-]*$/, ''); // éviter de couper un mot en fin
}

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  category: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived', 'deleted'], 
    default: 'draft' 
  },
  image: { 
    type: String 
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }],
  
  // Support vidéo
  mainVideo: {
    type: String,
    default: null
  },
  videos: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    thumbnail: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 0 // en secondes
    },
    format: {
      type: String,
      default: 'mp4'
    },
    size: {
      type: Number,
      default: 0 // en bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  tags: [String],
  summary: String,
  
  // Champs d'archivage
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  archiveReason: {
    type: String
  },
  
  // Gestion des versions
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: {
      type: Number,
      required: true
    },
    title: String,
    content: String,
    summary: String,
    image: String,
    images: [{
      url: String,
      description: String
    }],
    tags: [String],
    category: String,
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeNote: String
  }],
  
  // Métadonnées de création/modification
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // SEO et slugs
  slug: {
  type: String
  },
  metaTitle: String,
  metaDescription: String,
  
  // Planification
  scheduledFor: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  
  // Corbeille
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleteReason: String
}, {
  timestamps: true
});

// Index pour la recherche textuelle optimisée
newsSchema.index({ 
  title: 'text', 
  content: 'text', 
  summary: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    summary: 5,
    tags: 8,
    content: 1
  },
  name: 'news_search_index'
});

// Index composé pour les requêtes de recherche avec filtres
newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ category: 1, status: 1, createdAt: -1 });
newsSchema.index({ tags: 1, status: 1 });

// Index pour l'archivage et la corbeille
newsSchema.index({ archived: 1, archivedAt: -1 });
newsSchema.index({ deletedAt: 1 });
newsSchema.index({ slug: 1 }, { unique: true, sparse: true });
newsSchema.index({ scheduledFor: 1 });
newsSchema.index({ createdBy: 1, status: 1 });

// Méthodes du modèle pour l'archivage
newsSchema.methods.archive = function(userId, reason = '') {
  this.archived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  this.archiveReason = reason;
  this.status = 'archived';
  return this.save();
};

newsSchema.methods.restore = function() {
  this.archived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  this.archiveReason = null;
  this.status = 'draft';
  return this.save();
};

newsSchema.methods.softDelete = function(userId, reason = '') {
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason;
  this.status = 'deleted';
  return this.save();
};

newsSchema.methods.restoreFromTrash = function() {
  this.deletedAt = null;
  this.deletedBy = null;
  this.deleteReason = null;
  this.status = 'draft';
  return this.save();
};

newsSchema.methods.createVersion = function(userId, changeNote = '') {
  // Sauvegarder la version actuelle
  const currentVersion = {
    version: this.version,
    title: this.title,
    content: this.content,
    summary: this.summary,
    image: this.image,
    images: this.images,
    tags: this.tags,
    category: this.category,
    modifiedAt: new Date(),
    modifiedBy: userId,
    changeNote
  };
  
  this.previousVersions.push(currentVersion);
  this.version += 1;
  this.updatedBy = userId;
  
  // Limiter à 10 versions maximum
  if (this.previousVersions.length > 10) {
    this.previousVersions = this.previousVersions.slice(-10);
  }
  
  return this.save();
};

newsSchema.methods.revertToVersion = function(versionNumber, userId) {
  const targetVersion = this.previousVersions.find(v => v.version === versionNumber);
  
  if (!targetVersion) {
    throw new Error('Version non trouvée');
  }
  
  // Sauvegarder la version actuelle avant de revenir
  this.createVersion(userId, `Retour à la version ${versionNumber}`);
  
  // Appliquer la version cible
  this.title = targetVersion.title;
  this.content = targetVersion.content;
  this.summary = targetVersion.summary;
  this.image = targetVersion.image;
  this.images = targetVersion.images;
  this.tags = targetVersion.tags;
  this.category = targetVersion.category;
  this.updatedBy = userId;
  
  return this.save();
};

// Génération/normalisation du slug avant sauvegarde
newsSchema.pre('save', async function(next) {
  try {
    // Normaliser un slug existant
    if (this.isModified('slug') && this.slug) {
      this.slug = slugify(this.slug);
    }

    // Générer un slug si manquant à partir du titre
    if (!this.slug && this.title) {
      this.slug = slugify(this.title);
    }

    // Assurer l'unicité du slug en ajoutant un suffixe numérique si nécessaire
    if (this.slug) {
      let candidate = this.slug;
      let counter = 1;
      // Rechercher des collisions de slug pour d'autres documents
      // Utiliser function classique pour accéder à this
      // eslint-disable-next-line no-constant-condition
      while (await mongoose.models.News.findOne({ slug: candidate, _id: { $ne: this._id } })) {
        candidate = `${this.slug}-${counter++}`;
      }
      this.slug = candidate;
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Helper pour retrouver un article par ID ou par slug
newsSchema.statics.findBySlugOrId = function(identifier) {
  if (!identifier) return Promise.resolve(null);
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return this.findById(identifier);
  }
  return this.findOne({ slug: String(identifier).toLowerCase() });
};

// Méthodes statiques pour l'archivage automatique
newsSchema.statics.autoArchiveOldArticles = function(daysOld = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    {
      status: 'published',
      createdAt: { $lt: cutoffDate },
      archived: false
    },
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archiveReason: 'Archivage automatique - Article ancien',
        status: 'archived'
      }
    }
  );
};

newsSchema.statics.cleanupDeletedArticles = function(daysInTrash = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInTrash);
  
  return this.deleteMany({
    status: 'deleted',
    deletedAt: { $lt: cutoffDate }
  });
};

newsSchema.statics.getArchiveStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

let News;
try {
  if (typeof window === 'undefined') {
    News = mongoose.models.News || mongoose.model('News', newsSchema);
  } else {
    News = { name: 'News' };
  }
} catch (e) {
  News = { name: 'News' };
}
export default News;