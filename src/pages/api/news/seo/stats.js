// src/pages/api/news/seo/stats.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import SEOService from '@/lib/seoService';
import logger, { LOG_TYPES } from '@/lib/logger';
import { connectDB } from '@/lib/mongodb';

// GET - Récupérer les statistiques SEO globales
const getSEOStats = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await connectDB();
    
    const stats = await SEOService.getSEOStats();
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation des statistiques SEO',
      {
        adminId: req.user.id,
        stats
      },
      req
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erreur récupération statistiques SEO:', error);
    
    // Gestion robuste de l'erreur
    const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
    const errorStack = error?.stack || 'Pas de stack trace disponible';
    
    console.error('Stack trace:', errorStack);
    
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur récupération statistiques SEO',
        {
          error: errorMessage,
          stack: errorStack,
          adminId: req.user?.id,
          errorType: typeof error,
          errorDetails: JSON.stringify(error, null, 2)
        },
        req
      );
    } catch (logError) {
      console.error('Erreur lors du logging:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques SEO',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

export default apiHandler(
  {
    GET: getSEOStats
  },
  {
    GET: ROUTE_TYPES.PROTECTED
  }
);