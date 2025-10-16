// src/pages/api/establishments/index.js
import { connectDB } from '@/lib/mongodb';
import Establishment from '@/models/Establishment';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import logger, { LOG_TYPES } from '@/lib/logger';

// Handler GET (public)
const getEstablishments = async (req, res) => {
  await connectDB();
  
  try {
    // Récupérer les paramètres de filtrage
    const { statut, region, type } = req.query;
    let query = {};

    // Appliquer les filtres si présents
    if (statut) query.statut = statut;
    if (region) query.region = region;
    if (type) query.type = type;

    const establishments = await Establishment.find(query)
      .sort({ nom: 1 });

    // Grouper par région si demandé
    if (req.query.groupByRegion === 'true') {
      const grouped = establishments.reduce((acc, curr) => {
        if (!acc[curr.region]) {
          acc[curr.region] = [];
        }
        acc[curr.region].push(curr);
        return acc;
      }, {});
      return res.status(200).json({
        success: true,
        data: grouped
      });
    }

    return res.status(200).json(establishments);
  } catch (error) {
    console.error('Error fetching establishments:', error);
    throw error;
  }
};

// Handler POST (protégé)
const createEstablishment = async (req, res) => {
  await connectDB();
  
  try {
    // Validation de base
    const { nom, type, statut, region, ville } = req.body;
    if (!nom || !type || !statut || !region || !ville) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    const establishment = new Establishment({
      ...req.body,
      createdBy: req.user?.id,
      createdAt: new Date()
    });

    await establishment.save();
    
    // Logger la création d'établissement
    await logger.success(
      LOG_TYPES.CONTENT_CREATED,
      `Nouvel établissement créé: ${establishment.nom}`,
      {
        establishmentId: establishment._id,
        nom: establishment.nom,
        type: establishment.type,
        statut: establishment.statut,
        region: establishment.region,
        ville: establishment.ville,
        createdBy: req.user?.username || req.user?.id || 'system'
      },
      req
    );
    
    return res.status(201).json({
      success: true,
      data: establishment
    });
  } catch (error) {
    console.error('Error creating establishment:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getEstablishments,
    POST: createEstablishment
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);