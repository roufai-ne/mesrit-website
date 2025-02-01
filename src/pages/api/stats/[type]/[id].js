import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const models = {
  students: StudentStats,
  teachers: TeacherStats,
  institutions: InstitutionStats
};

// Middleware de vérification du token et du rôle
const verifyToken = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Token non fourni');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Non autorisé');
  }
};

export default async function handler(req, res) {
  const { type, id } = req.query;

  // Vérification du type de statistique
  if (!type || !models[type]) {
    return res.status(400).json({ error: 'Type de statistique non valide' });
  }

  // Vérification de l'ID pour les opérations qui en ont besoin
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID non valide' });
  }

  try {
    await connectDB();
    const Model = models[type];

    // Pour les méthodes de modification (PUT, DELETE), vérifier que l'utilisateur est admin
    if (req.method !== 'GET') {
      const decoded = await verifyToken(req);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé. Seuls les administrateurs peuvent modifier les statistiques.' });
      }
    }

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
    if (error.message === 'Non autorisé') {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}