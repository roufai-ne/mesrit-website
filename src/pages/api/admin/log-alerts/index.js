// src/pages/api/admin/log-alerts/index.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import LogAlert from '@/models/LogAlert';
import SystemLog from '@/models/SystemLog';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function logAlertsHandler(req, res) {
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

  if (req.method === 'GET') {
    try {
      const {
        level,
        category,
        priority,
        status,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0
      } = req.query;

      // Build query with the LogAlert model
      const query = {};

      if (level) query.level = level;
      if (category) query.category = category;
      if (priority) query.priority = priority;
      if (status) query.status = status;

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const alerts = await LogAlert
        .find(query)
        .populate('logId', 'message level type category priority timestamp')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(parseInt(limit))
        .lean();

      const total = await LogAlert.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: {
          alerts,
          total,
          hasMore: offset + parseInt(limit) < total
        }
      });
    } catch (error) {
      console.error('Error fetching log alerts:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching log alerts'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { logId, title, message, level, category, priority, recipients, channels } = req.body;

      // Validate required fields
      if (!logId || !title || !message || !level || !category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Verify the log exists
      const log = await SystemLog.findById(logId);
      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }

      // Create the alert
      const alert = new LogAlert({
        logId,
        title,
        message,
        level,
        category,
        priority: priority || 'medium',
        recipients: recipients || [],
        channels: channels || ['dashboard'],
        triggeredBy: user.id,
        metadata: {
          logDetails: {
            type: log.type,
            username: log.username,
            ip: log.ip
          }
        }
      });

      await alert.save();

      return res.status(201).json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error creating log alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating log alert'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withErrorHandler(logAlertsHandler);
