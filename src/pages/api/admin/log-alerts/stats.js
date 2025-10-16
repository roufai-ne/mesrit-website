// src/pages/api/admin/log-alerts/stats.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import LogAlert from '@/models/LogAlert';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function logAlertsStatsHandler(req, res) {
  // Verify authentication
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

  );
  }

  if (req.method === 'GET') {
    try {
      const { dateFrom, dateTo } = req.query;

      // Build date filter
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
      }

      // Get stats by level
      const levelStats = await LogAlert.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get stats by category
      const categoryStats = await LogAlert.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get stats by status
      const statusStats = await LogAlert.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get stats by priority
      const priorityStats = await LogAlert.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get recent alerts (last 24 hours)
      const recentAlerts = await LogAlert.find({
        ...dateFilter,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }).countDocuments();

      // Get unresolved alerts
      const unresolvedAlerts = await LogAlert.find({
        ...dateFilter,
        status: { $in: ['pending', 'sent'] }
      }).countDocuments();

      return res.status(200).json({
        success: true,
        data: {
          levelStats: levelStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          categoryStats: categoryStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          statusStats: statusStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          priorityStats: priorityStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          recentAlerts,
          unresolvedAlerts,
          total: levelStats.reduce((sum, stat) => sum + stat.count, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching log alerts stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching log alerts statistics'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withErrorHandler(logAlertsStatsHandler);