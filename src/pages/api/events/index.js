// src/pages/api/events/index.js
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        const events = await Event.find({
          date: { $gte: new Date() }
        }).sort({ date: 1 });
        return res.status(200).json(events);

      case 'POST':
        const newEvent = await Event.create(req.body);
        return res.status(201).json(newEvent);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}