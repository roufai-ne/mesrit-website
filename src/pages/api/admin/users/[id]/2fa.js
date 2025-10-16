// src/pages/api/admin/users/[id]/2fa.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import TwoFactorAuth from '@/lib/twoFactorAuth';
import logger, { LOG_TYPES } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function user2FAHandler(req, res) {
  // Vérifier l'authentification admin
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.MANAGE)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  );
  }

  const { id: userId } = req.query;

  if (req.method === 'POST') {
    try {
      const { action } = req.body;

      if (action === 'enable') {
        // Générer un secret et activer le 2FA pour l'utilisateur
        const secretData = TwoFactorAuth.generateSecret(`user_${userId}`);
        
        // Pour un admin qui active le 2FA d'un autre utilisateur,
        // on peut utiliser un token de vérification par défaut ou générer automatiquement
        const result = await TwoFactorAuth.enable2FA(userId, secretData.secret, '000000'); // Token admin
        
        await logger.info(
          LOG_TYPES.USER_UPDATED,
          `2FA activé pour l'utilisateur ${userId} par l'admin ${user.username}`,
          { targetUserId: userId, adminId: user._id },
          req
        );
        
        return res.status(200).json({
          success: true,
          message: '2FA activé avec succès',
          data: {
            backupCodes: result.backupCodes
          }
        });
      }

      if (action === 'disable') {
        // Désactiver le 2FA (en tant qu'admin, on peut bypasser certaines vérifications)
        const result = await TwoFactorAuth.disable2FA(userId, 'admin_override', null);
        
        await logger.warning(
          LOG_TYPES.USER_UPDATED,
          `2FA désactivé pour l'utilisateur ${userId} par l'admin ${user.username}`,
          { targetUserId: userId, adminId: user._id },
          req
        );
        
        return res.status(200).json({
          success: true,
          message: '2FA désactivé avec succès'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue. Actions disponibles: enable, disable'
      });
    } catch (error) {
      console.error('Erreur gestion 2FA utilisateur:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur gestion 2FA utilisateur ${userId}: ${error.message}`,
        { targetUserId: userId, adminId: user._id, error: error.stack },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la gestion du 2FA'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(user2FAHandler));