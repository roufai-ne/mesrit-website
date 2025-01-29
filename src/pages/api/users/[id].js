// pages/api/users/[id].js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await connectDB();
    
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { id } = req.query;

    switch (req.method) {
      case 'PUT':
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true, runValidators: true }
        ).select('-password');
        
        return res.status(200).json(updatedUser);

      case 'DELETE':
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Utilisateur supprimé' });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}