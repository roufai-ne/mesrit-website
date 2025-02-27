// src/pages/api/events/[id].js
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'PUT':
        // S'assurer que la date est convertie en objet Date
        const updateData = {
          ...req.body,
          date: new Date(req.body.date)
        };
        
        const updatedEvent = await Event.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true }
        );
        
        if (!updatedEvent) {
          return res.status(404).json({ error: 'Événement non trouvé' });
        }
        
        return res.status(200).json(updatedEvent);

      case 'DELETE':
        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) {
          return res.status(404).json({ error: 'Événement non trouvé' });
        }
        
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API événements:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}