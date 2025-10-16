// src/pages/api/admin/logs/search.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger from '@/lib/logger';

async function logSearchHandler(req, res) {
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

  );
  }

  if (req.method === 'GET') {
    try {
      const {
        q: query,
        level,
        category,
        dateFrom,
        dateTo,
        limit = 50
      } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'La requête de recherche doit contenir au moins 2 caractères'
        });
      }

      const results = await logger.searchLogs({
        query: query.trim(),
        level,
        category,
        dateFrom,
        dateTo,
        limit: parseInt(limit)
      });

      return res.status(200).json({
        success: true,
        data: {
          query,
          results,
          total: results.length
        }
      });
    } catch (error) {
      console.error('Erreur recherche logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche dans les logs'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withErrorHandler(logSearchHandler);