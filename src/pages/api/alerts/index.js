// src/pages/api/alerts/index.js
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        const alerts = await Alert.find({ 
          status: 'active',
          endDate: { $gt: new Date() }
        }).sort({ priority: -1, startDate: -1 });
        return res.status(200).json(alerts);

      case 'POST':
        const newAlert = await Alert.create(req.body);
        return res.status(201).json(newAlert);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}