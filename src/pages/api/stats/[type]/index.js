// pages/api/stats/[type]/index.js
import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';

const models = {
  students: StudentStats,
  teachers: TeacherStats,
  institutions: InstitutionStats
};

export default async function handler(req, res) {
  if (!req.query.type || !models[req.query.type]) {
    return res.status(400).json({ error: 'Type de statistique non valide' });
  }

  try {
    await connectDB();
    const Model = models[req.query.type];

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
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}