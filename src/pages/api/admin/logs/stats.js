// src/pages/api/admin/logs/stats.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { connectDB } from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';

async function logsStatsHandler(req, res) {
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
      await connectDB();
      
      // Utiliser les méthodes statiques du modèle SystemLog
      const levelStats = await SystemLog.getStatsByLevel();
      const categoryStats = await SystemLog.getStatsByCategory();
      
      // Convertir en objets pour l'interface
      const levelStatsObj = {};
      levelStats.forEach(stat => {
        levelStatsObj[stat._id] = stat.count;
      });
      
      const categoryStatsObj = {};
      categoryStats.forEach(stat => {
        categoryStatsObj[stat._id || 'system'] = stat.count;
      });
      
      // Statistiques par priorité
      const priorityStats = await SystemLog.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const priorityStatsObj = {};
      priorityStats.forEach(stat => {
        priorityStatsObj[stat._id || 'medium'] = stat.count;
      });
      
      // Logs critiques non traités
      const criticalUnprocessed = await SystemLog.countDocuments({
        priority: 'critical',
        processed: { $ne: true }
      });
      
      // Total des logs
      const total = await SystemLog.countDocuments();
      
      return res.status(200).json({
        success: true,
        data: {
          levelStats: levelStatsObj,
          categoryStats: categoryStatsObj,
          priorityStats: priorityStatsObj,
          criticalUnprocessed,
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération stats logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(logsStatsHandler));