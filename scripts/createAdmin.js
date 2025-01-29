// scripts/createAdmin.js
import { connectDB } from '../src/lib/mongodb'
import { User } from '../src/models/User';
import mongoose from 'mongoose';

const createInitialAdmin = async () => {
  try {
    await connectDB();

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Un administrateur existe déjà');
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash('Admin@2024', 10);
    // Créer l'admin
    await User.create({
      username: 'admin',
      email: 'admin@mesrit.ne',
      password: hashedPassword,  // À changer lors de la première connexion
      role: 'admin',
      status: 'active',
      isFirstLogin: true
    });

    console.log('Administrateur créé avec succès');
    console.log('Identifiants de connexion :');
    console.log('Username: admin');
    console.log('Password: Admin@2024');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

createInitialAdmin();