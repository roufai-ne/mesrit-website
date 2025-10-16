// src/pages/api/news/trash.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import NewsArchiveService from '@/lib/newsArchive';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer les articles dans la corbeille (protégé - admin seulement)
const getDeletedNews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await NewsArchiveService.getDeletedArticles(
      parseInt(page),
      parseInt(limit)
    );
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation de la corbeille',
      {
        page: parseInt(page),
        limit: parseInt(limit),
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
    console.error('Erreur récupération corbeille:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération corbeille',
      {
        error: error.message,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la corbeille'
    });
  }
};

// POST - Mettre un article à la corbeille (protégé - admin seulement)
const deleteNews = async (req, res) => {
  try {
    const { newsId, reason } = req.body;
    
    if (!newsId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const article = await NewsArchiveService.deleteArticle(
      newsId,
      req.user.id,
      reason || 'Supprimé manuellement'
    );
    
    res.status(200).json({
      success: true,
      message: 'Article mis à la corbeille avec succès',
      data: article
    });
    
  } catch (error) {
    console.error('Erreur suppression article:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur suppression article',
      {
        error: error.message,
        newsId: req.body?.newsId,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression'
    });
  }
};

// PUT - Restaurer un article de la corbeille (protégé - admin seulement)
const restoreFromTrash = async (req, res) => {
  try {
    const { newsId } = req.body;
    
    if (!newsId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const article = await NewsArchiveService.restoreFromTrash(
      newsId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Article restauré de la corbeille avec succès',
      data: article
    });
    
  } catch (error) {
    console.error('Erreur restauration corbeille:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur restauration corbeille',
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

// DELETE - Supprimer définitivement un article (protégé - admin seulement)
const permanentDelete = async (req, res) => {
  try {
    const { newsId } = req.query;
    
    if (!newsId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'article requis'
      });
    }
    
    const result = await NewsArchiveService.permanentDelete(
      newsId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Article supprimé définitivement',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur suppression définitive:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur suppression définitive',
      {
        error: error.message,
        newsId: req.query?.newsId,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression définitive'
    });
  }
};

export default apiHandler(
  {
    GET: getDeletedNews,
    POST: deleteNews,
    PUT: restoreFromTrash,
    DELETE: permanentDelete
  },
  {
    GET: ROUTE_TYPES.PROTECTED,
    POST: ROUTE_TYPES.PROTECTED,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);