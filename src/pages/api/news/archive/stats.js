// src/pages/api/news/archive/stats.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsArchiveService from '@/lib/newsArchive';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer les statistiques d'archivage (protégé - admin seulement)
const getArchiveStats = async (req, res) => {
  try {
    const stats = await NewsArchiveService.getArchiveStats();
    
    // Calculer des métriques supplémentaires
    const metrics = {
      ...stats,
      archiveRate: stats.totalArticles > 0 
        ? ((stats.archivedArticles / stats.totalArticles) * 100).toFixed(2)
        : 0,
      deletionRate: stats.totalArticles > 0 
        ? ((stats.deletedArticles / stats.totalArticles) * 100).toFixed(2)
        : 0,
      activeRate: stats.totalArticles > 0 
        ? ((stats.publishedArticles / stats.totalArticles) * 100).toFixed(2)
        : 0
    };
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation des statistiques d\'archivage',
      {
        adminId: req.user.id,
        stats: metrics
      },
      req
    );
    
    res.status(200).json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Erreur récupération statistiques archivage:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération statistiques archivage',
      {
        error: error.message,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

export default apiHandler(
  {
    GET: getArchiveStats
  },
  {
    GET: ROUTE_TYPES.PROTECTED
  }
);