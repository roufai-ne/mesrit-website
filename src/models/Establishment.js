// src/models/Establishment.js
import mongoose from 'mongoose';

const establishmentSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Université', 'Institut', 'École']
  },
  statut: {
    type: String,
    required: true,
    enum: ['public', 'privé']
  },
  region: {
    type: String,
    required: true
  },
  ville: {
    type: String,
    required: true
  },
  dateOuverture: {
    type: Date,
    required: true
  },
  logo: {
    type: String,
    default: '/images/logos/default.webp'
  },
  website: {
    type: String
  },
  description: {
    type: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  // Informations d'accréditation pour les établissements privés
  accreditation: {
    isAccredited: {
      type: Boolean,
      default: false
    },
    accreditationNumber: {
      type: String
    },
    accreditationDate: {
      type: Date
    },
    accreditationExpiry: {
      type: Date
    },
    accreditingBody: {
      type: String,
      default: 'MESRIT Niger'
    },
    accreditationLevel: {
      type: String,
      enum: ['Provisoire', 'Définitive', 'Conditionnelle']
    },
    specializations: [{
      type: String
    }]
  },
  // Informations supplémentaires
  contact: {
    phone: String,
    email: String,
    address: String
  },
  numberOfStudents: {
    type: Number,
    default: 0
  },
  numberOfPrograms: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche textuelle optimisée
establishmentSchema.index({ 
  nom: 'text', 
  description: 'text',
  ville: 'text',
  region: 'text'
}, {
  weights: {
    nom: 10,
    description: 5,
    ville: 8,
    region: 6
  },
  name: 'establishment_search_index'
});

// Index composé pour les requêtes de recherche avec filtres
establishmentSchema.index({ type: 1, statut: 1, createdAt: -1 });
establishmentSchema.index({ region: 1, type: 1 });
establishmentSchema.index({ ville: 1, statut: 1 });

// Middleware pour mettre à jour la date de modification
establishmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Establishment = mongoose.models.Establishment || mongoose.model('Establishment', establishmentSchema);
export default Establishment;