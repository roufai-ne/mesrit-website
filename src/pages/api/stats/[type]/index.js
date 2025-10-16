// pages/api/stats/[type]/index.js
import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';
import { PublicationStats } from '@/models/PublicationStats';
import jwt from 'jsonwebtoken';

const models = {
  students: StudentStats,
  teachers: TeacherStats,
  institutions: InstitutionStats,
  publications: PublicationStats
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
  if (!req.query.type || !models[req.query.type]) {
    return res.status(400).json({ error: 'Type de statistique non valide' });
  }

  try {
    await connectDB();
    const Model = models[req.query.type];

    // Pour POST, vérifier que l'utilisateur est admin
    if (req.method === 'POST') {
      const decoded = await verifyToken(req);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé. Seuls les administrateurs peuvent créer des statistiques.' });
      }
    }

    switch (req.method) {
      case 'GET':
        const stats = await Model.find({}).sort({ year: -1 });
        return res.status(200).json(stats);

      case 'POST':
        const newStat = await Model.create(req.body);
        return res.status(201).json(newStat);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
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