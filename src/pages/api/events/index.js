// src/pages/api/events/index.js
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        // Créer la date d'aujourd'hui à minuit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = await Event.find({
          date: { $gte: today }
        }).sort({ date: 1 }); // Tri par date croissante
        
        return res.status(200).json(events);

      case 'POST':
        const eventData = {
          ...req.body,
          date: new Date(req.body.date)
        };
        
        const newEvent = await Event.create(eventData);
        return res.status(201).json(newEvent);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API événements:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}