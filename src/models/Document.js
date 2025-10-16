// src/models/Document.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['regulatory', 'policy', 'reports', 'guides'],
  },
  publicationDate: {
    type: Date,
    required: [true, 'La date de publication est requise'],
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Le type de fichier est requis'],
    enum: ['pdf', 'doc', 'docx']
  },
  size: {
    type: String,
    required: [true, 'La taille du fichier est requise']
  },
  url: {
    type: String,
    required: [true, "L'URL du document est requise"]
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  tags: [String] // Ajout du champ tags pour une meilleure recherche
}, {
  timestamps: true
});

// Index pour la recherche textuelle optimisée
documentSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 8
  },
  name: 'document_search_index'
});

// Index composé pour les requêtes de recherche avec filtres
documentSchema.index({ status: 1, createdAt: -1 });
documentSchema.index({ category: 1, status: 1, createdAt: -1 });
documentSchema.index({ type: 1, status: 1 });
documentSchema.index({ tags: 1, status: 1 });

export default mongoose.models.Document || mongoose.model('Document', documentSchema);