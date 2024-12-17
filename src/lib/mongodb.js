// src/lib/mongodb.js
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URI);
    
    if (connection.readyState === 1) {
      console.log('Connecté à MongoDB');
      return;
    }
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
  }
};