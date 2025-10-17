// src/pages/api/admin/logs/cleanup.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger, { LOG_TYPES } from '@/lib/logger';

async function cleanupHandler(req, res) {
  // Vérifier l'authentification
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  if (req.method === 'POST') {
    try {
      const { daysToKeep = 90, dryRun = false } = req.body;

      // Validation
      if (daysToKeep < 7) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer les logs de moins de 7 jours'
        });
      }

      if (dryRun) {
        // Mode simulation - compter les logs qui seraient affectés
        const { default: SystemLog } = await import('@/models/SystemLog');
        const { connectDB } = await import('@/lib/mongodb');
        await connectDB();

        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const archiveDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const toArchive = await SystemLog.countDocuments({
          timestamp: { $lt: archiveDate },
          archived: false
        });

        const toDelete = await SystemLog.countDocuments({
          timestamp: { $lt: cutoffDate },
          archived: true,
          priority: { $ne: 'critical' }
        });

        return res.status(200).json({
          success: true,
          data: {
            dryRun: true,
            daysToKeep,
            toArchive,
            toDelete,
            message: `${toArchive} logs seraient archivés, ${toDelete} logs seraient supprimés`
          }
        });
      }

      // Exécution réelle
      const result = await logger.cleanOldLogs(daysToKeep);

      // Logger l'action de nettoyage
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Nettoyage manuel des logs effectué par ${user.username}`,
        {
          daysToKeep,
          archived: result.archived,
          deleted: result.deleted,
          executedBy: user.id
        },
        req
      );

      return res.status(200).json({
        success: true,
        data: {
          dryRun: false,
          daysToKeep,
          archived: result.archived,
          deleted: result.deleted,
          message: `${result.archived} logs archivés, ${result.deleted} logs supprimés`
        }
      });
    } catch (error) {
      console.error('Erreur nettoyage logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage des logs'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(cleanupHandler);

