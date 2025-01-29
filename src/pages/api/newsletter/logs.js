import { connectDB } from '@/lib/mongodb';
import Log from '@/models/Log';

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, period, page = 1, limit = 10 } = req.query;

  try {
    let query = {};

    // Filtrer par statut
    if (status && ['success', 'error'].includes(status)) {
      query.status = status;
    }

    // Filtrer par période
    if (period === 'last7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.timestamp = { $gte: sevenDaysAgo };
    }
    

const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
     return res.status(200).json(logs);
  } catch (error) {
    console.error('Erreur lors de la récupération des logs :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}