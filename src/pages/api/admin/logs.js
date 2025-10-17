// src/pages/api/admin/logs.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

import { connectDB } from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';

async function logsHandler(req, res) {
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
      
      // Paramètres de pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      
      // Paramètres de filtrage
      const { level, category, priority, dateFrom, dateTo, search } = req.query;
      
      // Construire la requête de filtrage
      let query = {};
      
      if (level && level !== 'all') {
        query.level = level;
      }
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (priority && priority !== 'all') {
        query.priority = priority;
      }
      
      if (dateFrom || dateTo) {
        query.timestamp = {};
        if (dateFrom) {
          query.timestamp.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.timestamp.$lte = new Date(dateTo);
        }
      }
      
      if (search) {
        query.$or = [
          { message: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Récupérer les logs avec pagination
      const logs = await SystemLog
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Pour de meilleures performances
      
      // Compter le total pour la pagination
      const total = await SystemLog.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: {
          logs,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Erreur récupération logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(logsHandler));
