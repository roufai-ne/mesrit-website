// scripts/resetAdmin.js
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function resetAdmin() {
  try {
    // Connexion à MongoDB
    console.log('URI MongoDB:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Hachage du mot de passe
    const password = 'Admin@2024';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Mot de passe haché créé');

    // Supprimer l'ancien admin et créer le nouveau
    const db = mongoose.connection.db;
    await db.collection('users').deleteMany({ username: 'admin' });
    console.log('Ancien admin supprimé');
    
    const newAdmin = {
      username: 'admin',
      email: 'admin@mesrit.ne',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      isFirstLogin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(newAdmin);
    console.log('Nouvel admin créé');

    console.log('=================================');
    console.log('Admin réinitialisé avec succès');
    console.log('Username: admin');
    console.log('Password: Admin@2024');
    console.log('=================================');

    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

resetAdmin();