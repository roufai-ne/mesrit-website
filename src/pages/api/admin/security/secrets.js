// src/pages/api/admin/security/secrets.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import SecretRotation from '@/lib/secretRotation';
import logger, { LOG_TYPES } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/securityHeaders';

async function secretsHandler(req, res) {
  // Vérifier l'authentification
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.SECURITY, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  if (req.method === 'GET') {
    try {
      // Obtenir le statut de rotation
      const status = await SecretRotation.getRotationStatus();
      
      return res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Erreur récupération statut secrets:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du statut'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, force = false } = req.body;

      if (action === 'rotate') {
        // Logger la demande de rotation
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Demande de rotation des secrets par ${user.username}`,
          { force, userId: user._id },
          req
        );

        const result = await SecretRotation.rotateSecrets(force);
        
        if (result.success) {
          return res.status(200).json({
            success: true,
            message: result.message,
            data: {
              rotatedSecrets: result.rotatedSecrets,
              nextRotation: result.nextRotation
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: result.message,
            data: result
          });
        }
      }

      if (action === 'check') {
        const status = await SecretRotation.checkRotationNeeded();
        return res.status(200).json({
          success: true,
          data: status
        });
      }

      if (action === 'cleanup') {
        const deletedCount = await SecretRotation.cleanupOldBackups();
        
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Nettoyage des backups de secrets par ${user.username}`,
          { deletedCount, userId: user._id },
          req
        );

        return res.status(200).json({
          success: true,
          message: `${deletedCount} backups supprimés`,
          data: { deletedCount }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue. Actions disponibles: rotate, check, cleanup'
      });
    } catch (error) {
      console.error('Erreur gestion secrets:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur gestion secrets: ${error.message}`,
        { error: error.stack, userId: user._id },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la gestion des secrets'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(secretsHandler));