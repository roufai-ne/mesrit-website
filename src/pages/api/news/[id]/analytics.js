// src/pages/api/news/[id]/analytics.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsAnalyticsService from '@/lib/newsAnalytics';
import mongoose from 'mongoose';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer les statistiques d'un article spécifique (protégé - admin seulement)
const getNewsAnalytics = async (req, res) => {
  try {
    const { id } = req.query;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'article invalide'
      });
    }
    
    const stats = await NewsAnalyticsService.getNewsStats(id);
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation des analytics d\'un article',
      {
        newsId: id,
        adminId: req.user.id,
        adminUsername: req.user.username
      },
      req
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erreur récupération analytics article:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération analytics article',
      {
        error: error.message,
        newsId: req.query?.id,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques de l\'article'
    });
  }
};

export default apiHandler(
  {
    GET: getNewsAnalytics
  },
  {
    GET: ROUTE_TYPES.PROTECTED // Admin seulement
  }
);