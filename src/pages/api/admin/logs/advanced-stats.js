// src/pages/api/admin/logs/advanced-stats.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { withRateLimit } from '@/lib/rateLimiter';
import connectDB from '@/lib/mongodb';

async function advancedLogsStatsHandler(req, res) {
  // Vérifier l'authentification
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions
  if (!RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  );
  }

  if (req.method === 'GET') {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('logs');
      
      // Activité par heure (dernières 24h)
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      
      const hourlyActivity = await collection.aggregate([
        {
          $match: {
            timestamp: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%H:00',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      // Statistiques par utilisateur
      const userStats = await collection.aggregate([
        {
          $group: {
            _id: '$username',
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      // Statistiques par type
      const typeStats = await collection.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();
      
      // Tendances (comparaison avec la période précédente)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      
      const previous7Days = new Date();
      previous7Days.setDate(previous7Days.getDate() - 14);
      
      const currentPeriodStats = await collection.aggregate([
        {
          $match: {
            timestamp: { $gte: last7Days }
          }
        },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      const previousPeriodStats = await collection.aggregate([
        {
          $match: {
            timestamp: { 
              $gte: previous7Days,
              $lt: last7Days
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
      
      // Calculer les tendances
      const trends = {};
      const currentStatsObj = {};
      const previousStatsObj = {};
      
      currentPeriodStats.forEach(stat => {
        currentStatsObj[stat._id] = stat.count;
      });
      
      previousPeriodStats.forEach(stat => {
        previousStatsObj[stat._id] = stat.count;
      });
      
      ['info', 'warning', 'error', 'success', 'debug'].forEach(level => {
        const current = currentStatsObj[level] || 0;
        const previous = previousStatsObj[level] || 0;
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        
        trends[level] = {
          current,
          previous,
          change
        };
      });
      
      await client.close();
      
      return res.status(200).json({
        success: true,
        data: {
          hourlyActivity,
          userStats,
          typeStats,
          trends
        }
      });

    } catch (error) {
      console.error('Erreur récupération stats avancées logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques avancées',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withRateLimit(withErrorHandler(advancedLogsStatsHandler)));