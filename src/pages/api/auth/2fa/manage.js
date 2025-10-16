// src/pages/api/auth/2fa/manage.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import TwoFactorAuth from '@/lib/twoFactorAuth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { withAuthRateLimit } from '@/lib/rateLimiter';

async function manage2FAHandler(req, res) {
  // Vérifier l'authentification
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (req.method === 'GET') {
    try {
      // Obtenir le statut 2FA de l'utilisateur
      const status = await TwoFactorAuth.get2FAStatus(user._id);
      
      return res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Erreur récupération statut 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du statut'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, currentPassword, verificationToken, useBackupCode } = req.body;

      if (action === 'disable') {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Mot de passe actuel requis'
          });
        }

        const result = await TwoFactorAuth.disable2FA(user._id, currentPassword, verificationToken);
        
        return res.status(200).json({
          success: true,
          message: result.message
        });
      }

      if (action === 'regenerate-backup-codes') {
        if (!currentPassword || !verificationToken) {
          return res.status(400).json({
            success: false,
            message: 'Mot de passe et token 2FA requis'
          });
        }

        const result = await TwoFactorAuth.regenerateBackupCodes(user._id, currentPassword, verificationToken);
        
        return res.status(200).json({
          success: true,
          message: 'Codes de sauvegarde régénérés',
          data: {
            backupCodes: result.backupCodes
          }
        });
      }

      if (action === 'get-backup-codes') {
        if (!currentPassword || !verificationToken) {
          return res.status(400).json({
            success: false,
            message: 'Mot de passe et token 2FA requis'
          });
        }

        // Vérifier les credentials avant de donner les codes
        const status = await TwoFactorAuth.get2FAStatus(user._id);
        if (!status.enabled) {
          return res.status(400).json({
            success: false,
            message: '2FA non activé'
          });
        }

        // Vérifier le mot de passe (simulation - à implémenter selon votre logique)
        const backupCodes = await TwoFactorAuth.getBackupCodes(user._id);
        
        return res.status(200).json({
          success: true,
          data: {
            backupCodes
          }
        });
      }

      if (action === 'verify') {
        if (!verificationToken) {
          return res.status(400).json({
            success: false,
            message: 'Token de vérification requis'
          });
        }

        const result = await TwoFactorAuth.verify2FAForLogin(user._id, verificationToken, useBackupCode);
        
        return res.status(200).json({
          success: result.success,
          message: result.message,
          data: {
            required: result.required
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue. Actions disponibles: disable, regenerate-backup-codes, get-backup-codes, verify'
      });
    } catch (error) {
      console.error('Erreur gestion 2FA:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withAuthRateLimit(withErrorHandler(manage2FAHandler)));