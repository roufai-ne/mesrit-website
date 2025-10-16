// src/pages/api/admin/users/[id]/security.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import TwoFactorAuth from '@/lib/twoFactorAuth';
import { withSecurityHeaders } from '@/lib/securityHeaders';

async function userSecurityHandler(req, res) {
  // Vérifier l'authentification admin
  const user = await verifyToken(req);
  if (!user || !['admin', 'super-admin', 'system-admin', 'content-admin'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès administrateur requis'
    });
  }

  const { id: userId } = req.query;

  if (req.method === 'GET') {
    try {
      // Obtenir le statut 2FA de l'utilisateur
      const twoFactorStatus = await TwoFactorAuth.get2FAStatus(userId);
      
      // Obtenir d'autres informations de sécurité
      const securityInfo = {
        twoFactorEnabled: twoFactorStatus.enabled,
        twoFactorActivatedAt: twoFactorStatus.activatedAt,
        backupCodesCount: twoFactorStatus.backupCodesCount,
        // Ajouter d'autres métriques de sécurité
        lastPasswordChange: null, // À implémenter
        failedLoginAttempts: 0, // À implémenter
        activeSessions: 0 // À implémenter
      };
      
      return res.status(200).json({
        success: true,
        data: securityInfo
      });
    } catch (error) {
      console.error('Erreur récupération info sécurité:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des informations de sécurité'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(userSecurityHandler));