import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const director = await Director.findById(id);
        if (!director) {
          return res.status(404).json({ error: 'Responsable non trouvé' });
        }
        return res.status(200).json(director);

      case 'PUT':
        const updatedDirector = await Director.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedDirector) {
          return res.status(404).json({ error: 'Responsable non trouvé' });
        }
        return res.status(200).json(updatedDirector);

      case 'DELETE':
        const deletedDirector = await Director.findByIdAndDelete(id);
        if (!deletedDirector) {
          return res.status(404).json({ error: 'Responsable non trouvé' });
        }
        return res.status(200).json({ message: 'Responsable supprimé' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}