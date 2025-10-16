// src/pages/api/events/index.js
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Récupérer les événements (public)
const getEvents = async (req, res) => {
  try {
    await connectDB();
    
    // Créer la date d'aujourd'hui à minuit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let events = await Event.find({
      date: { $gte: today }
    }).sort({ date: 1 }); // Tri par date croissante
    
    // Si aucun événement n'est trouvé, retourner des événements par défaut
    if (!events || events.length === 0) {
      const defaultEvents = [
        {
          _id: 'default-1',
          title: 'Conseil des Ministres',
          description: 'Réunion hebdomadaire du conseil des ministres',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
          time: '09:00',
          location: 'Palais de la Présidence',
          status: 'upcoming',
          participants: 'Membres du gouvernement'
        },
        {
          _id: 'default-2',
          title: 'Conférence sur l\'Éducation Supérieure',
          description: 'Conférence nationale sur l\'avenir de l\'enseignement supérieur au Niger',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
          time: '14:00',
          location: 'Centre de Conférences MESRIT',
          status: 'upcoming',
          participants: 'Recteurs, Directeurs d\'établissements'
        }
      ];
      
      return res.status(200).json(defaultEvents);
    }
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Erreur API événements:', error);
    
    // En cas d'erreur, retourner des événements par défaut
    const fallbackEvents = [
      {
        _id: 'fallback-1',
        title: 'Événements à venir',
        description: 'Consultez prochainement notre agenda pour les événements du MESRIT',
        date: new Date(),
        time: '09:00',
        location: 'MESRIT Niger',
        status: 'upcoming'
      }
    ];
    
    return res.status(200).json(fallbackEvents);
  }
};

// POST - Créer un événement (admin seulement)
const createEvent = async (req, res) => {
  try {
    await connectDB();
    
    const eventData = {
      ...req.body,
      date: new Date(req.body.date)
    };
    
    const newEvent = await Event.create(eventData);
    return res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erreur création événement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default apiHandler(
  {
    GET: getEvents,
    POST: createEvent
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);