// pages/api/users/change-password.js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const user = await verifyToken(req);

    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const { currentPassword, newPassword } = req.body;

    const userDoc = await User.findById(user._id);
    const isValid = await userDoc.comparePassword(currentPassword);

    if (!isValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userDoc.password = hashedPassword;
    userDoc.isFirstLogin = false;
    await userDoc.save();
   

    res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}