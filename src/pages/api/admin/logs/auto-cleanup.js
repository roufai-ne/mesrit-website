// src/pages/api/admin/logs/auto-cleanup.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { runAutoCleanup } from '@/scripts/autoCleanupLogs';
import logger, { LOG_TYPES } from '@/lib/logger';

// In-memory storage for cleanup configuration
// In a production environment, this should be stored in a database
let cleanupConfig = {
  enabled: false,
  daysToArchive: 30,
  daysToKeep: 90,
  lastRun: null,
  schedule: '0 2 * * *' // Run daily at 2 AM
};

async function autoCleanupHandler(req, res) {
  // Verify authentication
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

  );
  }

  if (req.method === 'GET') {
    try {
      return res.status(200).json({
        success: true,
        data: cleanupConfig
      });
    } catch (error) {
      console.error('Erreur récupération configuration nettoyage:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la configuration'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { enabled, daysToArchive, daysToKeep, schedule } = req.body;

      // Validate input
      if (daysToArchive !== undefined && daysToArchive < 1) {
        return res.status(400).json({
          success: false,
          message: 'daysToArchive doit être supérieur à 0'
        });
      }

      if (daysToKeep !== undefined && daysToKeep < 7) {
        return res.status(400).json({
          success: false,
          message: 'daysToKeep doit être supérieur à 7'
        });
      }

      // Update configuration
      if (enabled !== undefined) cleanupConfig.enabled = enabled;
      if (daysToArchive !== undefined) cleanupConfig.daysToArchive = daysToArchive;
      if (daysToKeep !== undefined) cleanupConfig.daysToKeep = daysToKeep;
      if (schedule !== undefined) cleanupConfig.schedule = schedule;

      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Configuration de nettoyage automatique mise à jour par ${user.username}`,
        {
          ...cleanupConfig,
          updatedBy: user.id
        },
        req
      );

      return res.status(200).json({
        success: true,
        data: cleanupConfig,
        message: 'Configuration mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour configuration nettoyage:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la configuration'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Force run cleanup
      const result = await runAutoCleanup({
        daysToArchive: cleanupConfig.daysToArchive,
        daysToKeep: cleanupConfig.daysToKeep
      });

      cleanupConfig.lastRun = new Date();

      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Nettoyage automatique forcé par ${user.username}`,
        {
          ...result,
          executedBy: user.id
        },
        req
      );

      return res.status(200).json({
        success: true,
        data: {
          ...cleanupConfig,
          result
        },
        message: `Nettoyage effectué: ${result.archived} logs archivés, ${result.deleted} logs supprimés`
      });
    } catch (error) {
      console.error('Erreur nettoyage forcé:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage forcé'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(autoCleanupHandler);