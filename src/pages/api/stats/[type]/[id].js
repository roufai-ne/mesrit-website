// pages/api/stats/[type]/[id].js
import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';
import mongoose from 'mongoose';

const models = {
  students: StudentStats,
  teachers: TeacherStats,
  institutions: InstitutionStats
};

export default async function handler(req, res) {
  const { type, id } = req.query;

  if (!type || !models[type]) {
    return res.status(400).json({ error: 'Type de statistique non valide' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID non valide' });
  }

  try {
    await connectDB();
    const Model = models[type];

    switch (req.method) {
      case 'GET':
        const stat = await Model.findById(id);
        if (!stat) {
          return res.status(404).json({ error: 'Statistique non trouvée' });
        }
        return res.status(200).json(stat);

      case 'PUT':
        const updatedStat = await Model.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedStat) {
          return res.status(404).json({ error: 'Statistique non trouvée' });
        }
        return res.status(200).json(updatedStat);

      case 'DELETE':
        const deletedStat = await Model.findByIdAndDelete(id);
        if (!deletedStat) {
          return res.status(404).json({ error: 'Statistique non trouvée' });
        }
        return res.status(200).json({ message: 'Statistique supprimée avec succès' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}