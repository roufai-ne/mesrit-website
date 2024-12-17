// src/models/Director.js
import mongoose from 'mongoose';

const directorSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  email: {
    type: String
  },
  telephone: {
    type: String
  },
  message: String,
  key: String, // Pour SG, DGES, DGR
  nomComplet: String, // Pour les sous-directions
  responsable: String,
  mission: String,
  direction: String // Pour grouper les sous-directions (SG, DGES, DGR)
}, {
  timestamps: true
});

export default mongoose.models.Director || mongoose.model('Director', directorSchema);