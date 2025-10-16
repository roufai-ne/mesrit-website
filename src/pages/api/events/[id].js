// src/pages/api/events/[id].js
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// PUT - Mettre à jour un événement (admin seulement)
const updateEvent = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    
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
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer un événement (admin seulement)
const deleteEvent = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default apiHandler(
  {
    PUT: updateEvent,
    DELETE: deleteEvent
  },
  {
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);