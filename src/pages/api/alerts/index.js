// src/pages/api/alerts/index.js
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Récupérer les alertes (public)
const getAlerts = async (req, res) => {
  try {
    await connectDB();
    
    let alerts = await Alert.find({ 
      status: 'active',
      $or: [
        { endDate: { $gt: new Date() } },
        { endDate: { $exists: false } },
        { endDate: null }
      ]
    }).sort({ priority: -1, startDate: -1 });
    
    // Si aucune alerte n'est trouvée, retourner des alertes par défaut
    if (!alerts || alerts.length === 0) {
      const defaultAlerts = [
        {
          _id: 'default-alert-1',
          title: 'Bienvenue sur le portail MESRIT',
          description: 'Découvrez les dernières actualités et services du Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique.',
          priority: 'medium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        }
      ];
      
      return res.status(200).json(defaultAlerts);
    }
    
    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Erreur API alertes:', error);
    
    // En cas d'erreur, retourner des alertes par défaut
    const fallbackAlerts = [
      {
        _id: 'fallback-alert-1',
        title: 'Informations MESRIT',
        description: 'Consultez régulièrement notre portail pour les dernières informations du ministère.',
        priority: 'low',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }
    ];
    
    return res.status(200).json(fallbackAlerts);
  }
};

// POST - Créer une alerte (admin seulement)
const createAlert = async (req, res) => {
  try {
    await connectDB();
    
    const newAlert = await Alert.create(req.body);
    return res.status(201).json(newAlert);
  } catch (error) {
    console.error('Erreur création alerte:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default apiHandler(
  {
    GET: getAlerts,
    POST: createAlert
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);