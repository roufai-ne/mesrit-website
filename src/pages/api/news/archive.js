// src/pages/api/news/archive.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsArchiveService from '@/lib/newsArchive';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer les articles archivés (protégé - admin seulement)
const getArchivedNews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      archivedBy, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (archivedBy) filters.archivedBy = archivedBy;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    
    const result = await NewsArchiveService.getArchivedArticles(
      parseInt(page),
      parseInt(limit),
      filters
    );
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation des articles archivés',
      {
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        adminId: req.user.id
      },
      req
    );
    
    res.status(200).json({
      success: true,
      articles: result.articles,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Erreur récupération articles archivés:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération articles archivés',
      {
        error: error.message,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des articles archivés'
    });
  }
};

// POST - Archiver un article (protégé - admin seulement)
const archiveNews = async (req, res) => {
  try {
    const { newsId, reason } = req.body;
    
    if (!newsId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const article = await NewsArchiveService.archiveArticle(
      newsId,
      req.user.id,
      reason || 'Archivé manuellement'
    );
    
    res.status(200).json({
      success: true,
      message: 'Article archivé avec succès',
      data: article
    });
    
  } catch (error) {
    console.error('Erreur archivage article:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur archivage article',
      {
        error: error.message,
        newsId: req.body?.newsId,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'archivage'
    });
  }
};

// PUT - Restaurer un article archivé (protégé - admin seulement)
const restoreNews = async (req, res) => {
  try {
    const { newsId } = req.body;
    
    if (!newsId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const article = await NewsArchiveService.restoreArticle(
      newsId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Article restauré avec succès',
      data: article
    });
    
  } catch (error) {
    console.error('Erreur restauration article:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur restauration article',
      {
        error: error.message,
        newsId: req.body?.newsId,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la restauration'
    });
  }
};

export default apiHandler(
  {
    GET: getArchivedNews,
    POST: archiveNews,
    PUT: restoreNews
  },
  {
    GET: ROUTE_TYPES.PROTECTED,
    POST: ROUTE_TYPES.PROTECTED,
    PUT: ROUTE_TYPES.PROTECTED
  }
);