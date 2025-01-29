import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  content: String, // Contenu de la newsletter
  userId: String, // ID de l'utilisateur qui a envoyé la newsletter
  response: String, // Réponse du serveur SMTP
  error: String, // Message d'erreur
  timestamp: {
    type: Date,
    default: Date.now,
    },
});

export default mongoose.models.Log || mongoose.model('Log', logSchema);