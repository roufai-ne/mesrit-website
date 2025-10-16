// src/pages/api/admin/logs/clear.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { withAuthRateLimit } from '@/lib/rateLimiter';
import logger, { LOG_TYPES } from '@/lib/logger';
import { connectDB } from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';

async function clearLogsHandler(req, res) {
  // Vérifier l'authentification
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions
  if (!RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  );
  }

  if (req.method === 'DELETE') {
    try {
      await connectDB();
      
      const { days, level, category } = req.query;
      let query = {};
      let deletedCount = 0;
      let description = '';

      if (days) {
        // Supprimer les logs plus anciens que X jours
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        query.timestamp = { $lt: cutoffDate };
        description = `logs de plus de ${days} jours`;
      } else if (level) {
        // Supprimer les logs d'un niveau spécifique
        query.level = level;
        description = `logs de niveau ${level}`;
      } else if (category) {
        // Supprimer les logs d'une catégorie spécifique
        query.category = category;
        description = `logs de catégorie ${category}`;
      } else {
        // Supprimer tous les logs (dangereux)
        description = 'tous les logs';
      }

      const result = await SystemLog.deleteMany(query);
      deletedCount = result.deletedCount;

      // Logger l'action
      await logger.warning(
        LOG_TYPES.SYSTEM_MAINTENANCE,
        `Suppression de ${description} par ${user.username}`,
        {
          deletedCount,
          query,
          adminUser: user.username,
          adminId: user.userId
        }
      );

      return res.status(200).json({
        success: true,
        message: `${deletedCount} logs supprimés avec succès`,
        data: {
          deletedCount,
          description
        }
      });

    } catch (error) {
      console.error('Erreur suppression logs:', error);
      
      // Logger l'erreur
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        `Erreur lors de la suppression des logs par ${user.username}`,
        {
          error: error.message,
          adminUser: user.username,
          adminId: user.userId
        }
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression des logs',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withAuthRateLimit(withErrorHandler(clearLogsHandler)));