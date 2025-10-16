// src/lib/newsArchive.js
import News from '@/models/News';
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

export class NewsArchiveService {
  /**
   * Purge automatique de la corbeille (suppression irréversible de tous les articles en corbeille)
   */
  static async purgeTrash(userId) {
    try {
      await connectDB();
      const deletedArticles = await News.find({ status: 'deleted' });
      const result = await News.deleteMany({ status: 'deleted' });
      await logger.warning(
        LOG_TYPES.CONTENT_PERMANENTLY_DELETED,
        `Purge automatique de la corbeille: ${result.deletedCount} articles supprimés définitivement`,
        {
          deletedCount: result.deletedCount,
          deletedIds: deletedArticles.map(a => a._id),
          deletedBy: userId
        }
      );
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la purge automatique de la corbeille',
        { userId, error: error.message }
      );
      throw error;
    }
  }
  /**
   * Lister les articles par statut
   */
  static async listByStatus(status) {
    await connectDB();
    const query = {};
    if (status && status !== 'all') {
      if (status === 'archived') {
        query.archived = true;
      } else if (status === 'deleted' || status === 'corbeille') {
        query.status = 'deleted';
      } else {
        query.status = status;
      }
    }
    return await News.find(query).sort({ createdAt: -1 });
  }
  
  /**
   * Archiver un article
   */
  static async archiveArticle(newsId, userId, reason = '') {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      if (article.archived) {
        throw new Error('Article déjà archivé');
      }
      
      await article.archive(userId, reason);
      
      await logger.info(
        LOG_TYPES.CONTENT_ARCHIVED,
        `Article archivé: ${article.title}`,
        {
          newsId,
          title: article.title,
          reason,
          archivedBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de l\'archivage',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Restaurer un article archivé
   */
  static async restoreArticle(newsId, userId) {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      if (!article.archived) {
        throw new Error('Article non archivé');
      }
      
      await article.restore();
      
      await logger.info(
        LOG_TYPES.CONTENT_RESTORED,
        `Article restauré: ${article.title}`,
        {
          newsId,
          title: article.title,
          restoredBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la restauration',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Mettre un article à la corbeille (alias pour deleteArticle)
   */
  static async trashArticle(newsId, userId, reason = '') {
    return this.deleteArticle(newsId, userId, reason);
  }

  /**
   * Supprimer définitivement un article (corbeille)
   */
  static async deleteArticle(newsId, userId, reason = '') {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      if (article.status === 'deleted') {
        throw new Error('Article déjà supprimé');
      }
      
      await article.softDelete(userId, reason);
      
      await logger.warning(
        LOG_TYPES.CONTENT_DELETED,
        `Article mis à la corbeille: ${article.title}`,
        {
          newsId,
          title: article.title,
          reason,
          deletedBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la suppression',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Restaurer un article de la corbeille
   */
  static async restoreFromTrash(newsId, userId) {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      if (article.status !== 'deleted') {
        throw new Error('Article non supprimé');
      }
      
      await article.restoreFromTrash();
      
      await logger.info(
        LOG_TYPES.CONTENT_RESTORED,
        `Article restauré de la corbeille: ${article.title}`,
        {
          newsId,
          title: article.title,
          restoredBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la restauration de la corbeille',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Supprimer définitivement un article
   */
  static async permanentDelete(newsId, userId) {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      const title = article.title;
      await News.findByIdAndDelete(newsId);
      
      await logger.warning(
        LOG_TYPES.CONTENT_PERMANENTLY_DELETED,
        `Article supprimé définitivement: ${title}`,
        {
          newsId,
          title,
          deletedBy: userId
        }
      );
      
      return { success: true, title };
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la suppression définitive',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
  /**
   * Archiver plusieurs articles
   */
  static async batchArchive(newsIds = [], userId, reason = '') {
    const results = [];
    for (const id of newsIds) {
      try {
        const res = await this.archiveArticle(id, userId, reason);
        await logger.info(
          LOG_TYPES.CONTENT_ARCHIVED,
          `Batch archive: Article archivé: ${res.title}`,
          { newsId: id, title: res.title, archivedBy: userId, reason }
        );
        results.push({ id, status: 'archived', success: true, article: res });
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Batch archive: Erreur pour l'article ${id}`,
          { newsId: id, userId, error: error.message }
        );
        results.push({ id, status: 'archived', success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Restaurer plusieurs articles archivés
   */
  static async batchRestore(newsIds = [], userId) {
    const results = [];
    for (const id of newsIds) {
      try {
        const res = await this.restoreArticle(id, userId);
        await logger.info(
          LOG_TYPES.CONTENT_RESTORED,
          `Batch restore: Article restauré: ${res.title}`,
          { newsId: id, title: res.title, restoredBy: userId }
        );
        results.push({ id, status: 'restored', success: true, article: res });
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Batch restore: Erreur pour l'article ${id}`,
          { newsId: id, userId, error: error.message }
        );
        results.push({ id, status: 'restored', success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Mettre plusieurs articles à la corbeille
   */
  static async batchDelete(newsIds = [], userId, reason = '') {
    const results = [];
    for (const id of newsIds) {
      try {
        const res = await this.deleteArticle(id, userId, reason);
        await logger.warning(
          LOG_TYPES.CONTENT_DELETED,
          `Batch delete: Article mis à la corbeille: ${res.title}`,
          { newsId: id, title: res.title, deletedBy: userId, reason }
        );
        results.push({ id, status: 'deleted', success: true, article: res });
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Batch delete: Erreur pour l'article ${id}`,
          { newsId: id, userId, error: error.message }
        );
        results.push({ id, status: 'deleted', success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Restaurer plusieurs articles de la corbeille
   */
  static async batchRestoreFromTrash(newsIds = [], userId) {
    const results = [];
    for (const id of newsIds) {
      try {
        const res = await this.restoreFromTrash(id, userId);
        await logger.info(
          LOG_TYPES.CONTENT_RESTORED,
          `Batch restoreTrash: Article restauré de la corbeille: ${res.title}`,
          { newsId: id, title: res.title, restoredBy: userId }
        );
        results.push({ id, status: 'restoredFromTrash', success: true, article: res });
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Batch restoreTrash: Erreur pour l'article ${id}`,
          { newsId: id, userId, error: error.message }
        );
        results.push({ id, status: 'restoredFromTrash', success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Supprimer définitivement plusieurs articles
   */
  static async batchPermanentDelete(newsIds = [], userId) {
    const results = [];
    for (const id of newsIds) {
      try {
        const res = await this.permanentDelete(id, userId);
        await logger.warning(
          LOG_TYPES.CONTENT_PERMANENTLY_DELETED,
          `Batch permanentDelete: Article supprimé définitivement: ${res.title}`,
          { newsId: id, title: res.title, deletedBy: userId }
        );
        results.push({ id, status: 'permanentlyDeleted', success: true, result: res });
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Batch permanentDelete: Erreur pour l'article ${id}`,
          { newsId: id, userId, error: error.message }
        );
        results.push({ id, status: 'permanentlyDeleted', success: false, error: error.message });
      }
    }
    return results;
  }
  /**
   * Créer une nouvelle version d'un article
   */
  static async createVersion(newsId, userId, changeNote = '') {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      await article.createVersion(userId, changeNote);
      
      await logger.info(
        LOG_TYPES.CONTENT_VERSIONED,
        `Nouvelle version créée pour: ${article.title}`,
        {
          newsId,
          title: article.title,
          version: article.version,
          changeNote,
          createdBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la création de version',
        { newsId, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Revenir à une version précédente
   */
  static async revertToVersion(newsId, versionNumber, userId) {
    try {
      await connectDB();
      
      const article = await News.findById(newsId);
      if (!article) {
        throw new Error('Article non trouvé');
      }
      
      await article.revertToVersion(versionNumber, userId);
      
      await logger.info(
        LOG_TYPES.CONTENT_REVERTED,
        `Article restauré à la version ${versionNumber}: ${article.title}`,
        {
          newsId,
          title: article.title,
          targetVersion: versionNumber,
          currentVersion: article.version,
          revertedBy: userId
        }
      );
      
      return article;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors du retour de version',
        { newsId, versionNumber, userId, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Obtenir les articles archivés
   */
  static async getArchivedArticles(page = 1, limit = 20, filters = {}) {
    try {
      await connectDB();
      
      const skip = (page - 1) * limit;
      const query = { archived: true };
      
      // Appliquer les filtres
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.archivedBy) {
        query.archivedBy = filters.archivedBy;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.archivedAt = {};
        if (filters.dateFrom) {
          query.archivedAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.archivedAt.$lte = new Date(filters.dateTo);
        }
      }
      
      const [articles, total] = await Promise.all([
        News.find(query)
          .populate('archivedBy', 'username')
          .sort({ archivedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        News.countDocuments(query)
      ]);
      
      return {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la récupération des articles archivés',
        { error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Obtenir les articles dans la corbeille
   */
  static async getDeletedArticles(page = 1, limit = 20) {
    try {
      await connectDB();
      
      const skip = (page - 1) * limit;
      const query = { status: 'deleted' };
      
      const [articles, total] = await Promise.all([
        News.find(query)
          .populate('deletedBy', 'username')
          .sort({ deletedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        News.countDocuments(query)
      ]);
      
      return {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la récupération de la corbeille',
        { error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Obtenir les statistiques d'archivage
   */
  static async getArchiveStats() {
    try {
      await connectDB();
      
      const [statusStats, monthlyArchives] = await Promise.all([
        News.getArchiveStats(),
        this.getMonthlyArchiveStats()
      ]);
      
      return {
        statusStats,
        monthlyArchives
      };
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la récupération des stats d\'archivage',
        { error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Statistiques mensuelles d'archivage
   */
  static async getMonthlyArchiveStats() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      return await News.aggregate([
        {
          $match: {
            archivedAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$archivedAt' },
              month: { $month: '$archivedAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Archivage automatique des anciens articles
   */
  static async autoArchiveOldArticles(daysOld = 365) {
    try {
      await connectDB();
      
      const result = await News.autoArchiveOldArticles(daysOld);
      
      await logger.info(
        LOG_TYPES.SYSTEM_MAINTENANCE,
        `Archivage automatique effectué: ${result.modifiedCount} articles archivés`,
        {
          daysOld,
          articlesArchived: result.modifiedCount
        }
      );
      
      return result;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de l\'archivage automatique',
        { daysOld, error: error.message }
      );
      throw error;
    }
  }
  
  /**
   * Nettoyage automatique de la corbeille
   */
  static async cleanupTrash(daysInTrash = 30) {
    try {
      await connectDB();
      
      const result = await News.cleanupDeletedArticles(daysInTrash);
      
      await logger.info(
        LOG_TYPES.SYSTEM_MAINTENANCE,
        `Nettoyage de la corbeille effectué: ${result.deletedCount} articles supprimés définitivement`,
        {
          daysInTrash,
          articlesDeleted: result.deletedCount
        }
      );
      
      return result;
      
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors du nettoyage de la corbeille',
        { daysInTrash, error: error.message }
      );
      throw error;
    }
  }
}

export default NewsArchiveService;