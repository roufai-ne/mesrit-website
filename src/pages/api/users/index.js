// pages/api/users/index.js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await connectDB();
    
    // Vérifier le token et les permissions
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    switch (req.method) {
      case 'GET':
        const users = await User.find({}, '-password');
        return res.status(200).json(users);

      case 'POST':
        const newUser = await User.create(req.body);
        return res.status(201).json({
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username ou email déjà utilisé' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

