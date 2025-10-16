// src/pages/api/admin/logs/entity/[type]/[id].js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger from '@/lib/logger';

async function entityLogsHandler(req, res) {
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

  );
  }

  if (req.method === 'GET') {
    try {
      const { type, id } = req.query;
      const { limit = 50 } = req.query;

      // Valider les paramètres
      const validTypes = ['user', 'news', 'document', 'establishment', 'service'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Type d'entité invalide. Types acceptés: ${validTypes.join(', ')}`
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de l\'entité requis'
        });
      }

      const logs = await logger.getLogsByEntity(type, id, parseInt(limit));

      return res.status(200).json({
        success: true,
        data: {
          entityType: type,
          entityId: id,
          logs,
          total: logs.length
        }
      });
    } catch (error) {
      console.error('Erreur récupération logs entité:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs de l\'entité'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(entityLogsHandler);