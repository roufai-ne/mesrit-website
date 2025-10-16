// src/pages/api/admin/security/rate-limits.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import RateLimiter from '@/lib/rateLimiter';
import logger, { LOG_TYPES } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function rateLimitsHandler(req, res) {
  // Vérifier l'authentification admin
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
      const { timeRange = 3600 } = req.query; // 1 heure par défaut
      
      const stats = await RateLimiter.getStats(parseInt(timeRange));
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur récupération stats rate limiting:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, identifier, endpoint } = req.body;

      if (action === 'reset') {
        if (!identifier) {
          return res.status(400).json({
            success: false,
            message: 'Identifiant requis pour la réinitialisation'
          });
        }

        const deletedCount = await RateLimiter.resetLimits(identifier, endpoint);
        
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Réinitialisation des limites par ${user.username}`,
          { identifier, endpoint, deletedCount, userId: user._id },
          req
        );

        return res.status(200).json({
          success: true,
          message: `Limites réinitialisées pour ${identifier}${endpoint ? ` sur ${endpoint}` : ''}`,
          data: { deletedCount }
        });
      }

      if (action === 'cleanup') {
        const { maxAge = 86400 } = req.body; // 24h par défaut
        
        const deletedCount = await RateLimiter.cleanup(maxAge);
        
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Nettoyage rate limiting par ${user.username}`,
          { maxAge, deletedCount, userId: user._id },
          req
        );

        return res.status(200).json({
          success: true,
          message: `${deletedCount} enregistrements supprimés`,
          data: { deletedCount }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue. Actions disponibles: reset, cleanup'
      });
    } catch (error) {
      console.error('Erreur gestion rate limiting:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur gestion rate limiting: ${error.message}`,
        { error: error.stack, userId: user._id },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la gestion du rate limiting'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(rateLimitsHandler));