// src/models/Service.js
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  longDescription: { 
    type: String, 
    required: true,
    trim: true
  },
  icon: { 
    type: String, 
    required: true,
    default: 'Settings'
  },
  category: { 
    type: String, 
    required: true,
    enum: ['etudiants', 'etablissements', 'recherche', 'administration', 'formation']
  },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  url: { 
    type: String,
    trim: true
  },
  features: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  image: { 
    type: String 
  },
  priority: { 
    type: Number, 
    default: 0 
  },
  tags: [String],
  isExternal: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour la recherche et le tri
serviceSchema.index({ title: 'text', description: 'text', longDescription: 'text' });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ priority: -1, createdAt: -1 });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
