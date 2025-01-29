// pages/api/auth/login.js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    console.log('Tentative de connexion');

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Validation mot de passe:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    console.error('Erreur de login:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}