// src/pages/api/admin/log-alerts/[id].js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import LogAlert from '@/models/LogAlert';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function logAlertByIdHandler(req, res) {
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const alert = await LogAlert
        .findById(id)
        .populate('logId')
        .lean();

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error fetching log alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching log alert'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status, recipients, channels } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (recipients) updateData.recipients = recipients;
      if (channels) updateData.channels = channels;

      const alert = await LogAlert.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error updating log alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating log alert'
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const alert = await LogAlert.findByIdAndDelete(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting log alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting log alert'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withErrorHandler(logAlertByIdHandler);