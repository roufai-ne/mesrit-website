// src/pages/api/admin/logs/critical.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger from '@/lib/logger';

async function criticalLogsHandler(req, res) {
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

  if (req.method === 'GET') {
    try {
      const logs = await logger.getCriticalUnprocessedLogs();

      return res.status(200).json({
        success: true,
        data: {
          logs,
          total: logs.length
        }
      });
    } catch (error) {
      console.error('Erreur récupération logs critiques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs critiques'
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { logId } = req.body;

      if (!logId) {
        return res.status(400).json({
          success: false,
          message: 'ID du log requis'
        });
      }

      const updatedLog = await logger.markLogAsProcessed(logId);

      if (!updatedLog) {
        return res.status(404).json({
          success: false,
          message: 'Log non trouvé'
        });
      }

      // Logger l'action de traitement
      await logger.info(
        'content_updated',
        `Log critique ${logId} marqué comme traité`,
        { logId, processedBy: user.id },
        req
      );

      return res.status(200).json({
        success: true,
        data: updatedLog
      });
    } catch (error) {
      console.error('Erreur marquage log traité:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du marquage du log comme traité'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(criticalLogsHandler);

