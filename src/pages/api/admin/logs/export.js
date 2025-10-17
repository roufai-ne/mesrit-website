// src/pages/api/admin/logs/export.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger, { LOG_TYPES } from '@/lib/logger';

async function logExportHandler(req, res) {
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
      const {
        level,
        type,
        category,
        priority,
        dateFrom,
        dateTo,
        format = 'csv'
      } = req.query;

      // Récupérer tous les logs correspondants (sans limite)
      const result = await logger.getLogs({
        level,
        type,
        category,
        priority,
        dateFrom,
        dateTo,
        limit: 10000 // Limite raisonnable pour l'export
      });

      // Logger l'export
      await logger.info(
        LOG_TYPES.CONTENT_CREATED,
        `Export des logs système (${result.logs.length} entrées)`,
        { 
          filters: { level, type, dateFrom, dateTo },
          format,
          count: result.logs.length
        },
        req
      );

      if (format === 'csv') {
        // Générer le CSV
        const csvHeaders = [
          'Timestamp',
          'Level',
          'Type',
          'Category',
          'Priority',
          'Message',
          'Username',
          'IP',
          'User Agent',
          'Details'
        ];

        const csvRows = result.logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.level,
          log.type,
          log.category || '',
          log.priority || 'medium',
          `"${log.message.replace(/"/g, '""')}"`,
          log.username,
          log.ip,
          `"${(log.userAgent || '').replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
        ]);

        const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`);
        
        return res.status(200).send(csvContent);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.json"`);
        
        return res.status(200).json({
          exportDate: new Date().toISOString(),
          filters: { level, type, dateFrom, dateTo },
          totalLogs: result.logs.length,
          logs: result.logs
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Format non supporté. Utilisez csv ou json.'
      });
    } catch (error) {
      console.error('Erreur export logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export des logs'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(logExportHandler);

