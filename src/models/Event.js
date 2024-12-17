import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La date est requise']
  },
  time: {
    type: String,
    required: [true, 'L\'heure est requise']
  },
  location: {
    type: String,
    required: [true, 'Le lieu est requis']
  },
  participants: {
    type: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);