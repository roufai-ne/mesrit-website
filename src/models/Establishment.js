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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
establishmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Establishment = mongoose.models.Establishment || mongoose.model('Establishment', establishmentSchema);
export default Establishment;