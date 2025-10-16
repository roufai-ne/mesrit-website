// src/pages/api/admin/users/[id]/activity.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { connectDB } from '@/lib/mongodb';

async function userActivityHandler(req, res) {
  // Vérifier l'authentification admin
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  );
  }

  const { id: userId } = req.query;

  if (req.method === 'GET') {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const logsCollection = db.collection('system_logs');
      
      // Récupérer l'activité récente de l'utilisateur
      const recentActivity = await logsCollection
        .find({ 
          userId: userId,
          timestamp: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
          }
        })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      
      // Statistiques d'activité
      const activityStats = await logsCollection.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      // Activité par jour (7 derniers jours)
      const dailyActivity = await logsCollection.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      await client.close();
      
      return res.status(200).json({
        success: true,
        data: {
          recentActivity: recentActivity.map(log => ({
            id: log._id,
            timestamp: log.timestamp,
            level: log.level,
            type: log.type,
            message: log.message,
            ip: log.ip,
            details: log.details
          })),
          stats: {
            levelStats: activityStats.reduce((acc, stat) => {
              acc[stat._id] = stat.count;
              return acc;
            }, {}),
            dailyActivity,
            totalActions: recentActivity.length
          }
        }
      });
    } catch (error) {
      console.error('Erreur récupération activité utilisateur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'activité'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(userActivityHandler));