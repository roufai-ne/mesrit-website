// src/pages/api/admin/security/anomalies.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import AnomalyDetection from '@/lib/anomalyDetection';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function anomaliesHandler(req, res) {
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
      const { timeRange = 86400000 } = req.query; // 24h par défaut
      
      const stats = await AnomalyDetection.getAnomalyStats(parseInt(timeRange));
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur récupération stats anomalies:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, userId, ip, userAgent, endpoint, metadata = {} } = req.body;

      if (action === 'analyze-login') {
        if (!userId || !ip) {
          return res.status(400).json({
            success: false,
            message: 'userId et ip requis pour l\'analyse de connexion'
          });
        }

        const analysis = await AnomalyDetection.analyzeLoginAttempt(
          userId, 
          ip, 
          userAgent, 
          true, // success - à adapter selon le contexte
          metadata
        );
        
        return res.status(200).json({
          success: true,
          data: analysis
        });
      }

      if (action === 'analyze-activity') {
        if (!userId || !endpoint) {
          return res.status(400).json({
            success: false,
            message: 'userId et endpoint requis pour l\'analyse d\'activité'
          });
        }

        const analysis = await AnomalyDetection.analyzeUserActivity(
          userId,
          metadata.action || 'unknown',
          endpoint,
          metadata
        );
        
        return res.status(200).json({
          success: true,
          data: analysis
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Action non reconnue. Actions disponibles: analyze-login, analyze-activity'
      });
    } catch (error) {
      console.error('Erreur analyse anomalie:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse d\'anomalie'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(anomaliesHandler));
