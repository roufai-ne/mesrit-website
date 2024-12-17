// src/models/News.js
import mongoose from 'mongoose';

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
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  image: { 
    type: String 
  },
  tags: [String],
  summary: String
}, {
  timestamps: true
});

export default mongoose.models.News || mongoose.model('News', newsSchema);