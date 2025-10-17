// src/pages/api/admin/logs/cleanup-status.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import cleanupService from '@/services/logCleanupService';

async function cleanupStatusHandler(req, res) {
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

  if (req.method === 'GET') {
    try {
      const status = cleanupService.getStatus();
      
      return res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Erreur récupération statut nettoyage:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du statut'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action } = req.body;
      
      switch (action) {
        case 'start':
          cleanupService.start();
          break;
        case 'stop':
          cleanupService.stop();
          break;
        case 'run':
          await cleanupService.runCleanup();
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Action non valide. Utilisez start, stop ou run.'
          });
      }
      
      const status = cleanupService.getStatus();
      
      return res.status(200).json({
        success: true,
        data: status,
        message: `Action ${action} exécutée avec succès`
      });
    } catch (error) {
      console.error('Erreur action nettoyage:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'exécution de l\'action'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(cleanupStatusHandler);

