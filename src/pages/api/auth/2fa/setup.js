// src/pages/api/auth/2fa/setup.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import TwoFactorAuth from '@/lib/twoFactorAuth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { withAuthRateLimit } from '@/lib/rateLimiter';

async function setup2FAHandler(req, res) {
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
      // Générer un nouveau secret pour l'utilisateur
      const secretData = TwoFactorAuth.generateSecret(user.username);
      
      // Générer le QR code
      const qrData = await TwoFactorAuth.generateQRCode(user.username, secretData.secret);
      
      // Obtenir le statut actuel
      const status = await TwoFactorAuth.get2FAStatus(user._id);
      
      return res.status(200).json({
        success: true,
        data: {
          secret: secretData.secret,
          qrCode: qrData.qrCode,
          manualEntryKey: qrData.manualEntryKey,
          keyuri: qrData.keyuri,
          currentStatus: status
        }
      });
    } catch (error) {
      console.error('Erreur setup 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la configuration 2FA'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { secret, verificationToken, action } = req.body;

      if (!secret || !verificationToken) {
        return res.status(400).json({
          success: false,
          message: 'Secret et token de vérification requis'
        });
      }

      if (action === 'enable') {
        const result = await TwoFactorAuth.enable2FA(user._id, secret, verificationToken);
        
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            backupCodes: result.backupCodes
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue'
      });
    } catch (error) {
      console.error('Erreur activation 2FA:', error);
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

export default withSecurityHeaders(withAuthRateLimit(withErrorHandler(setup2FAHandler)));