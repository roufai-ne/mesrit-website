// src/pages/api/admin/users/[id]/sessions/reset.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import logger, { LOG_TYPES } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { connectDB } from '@/lib/mongodb';

async function resetUserSessionsHandler(req, res) {
  // Vérifier l'authentification admin
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.MANAGE)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  const { id: userId } = req.query;

  if (req.method === 'POST') {
    try {
      // Réinitialiser toutes les sessions de l'utilisateur
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      
      // Supprimer toutes les sessions de l'utilisateur (si vous utilisez une collection sessions)
      const sessionsCollection = db.collection('user_sessions');
      const result = await sessionsCollection.deleteMany({ userId });
      
      // Supprimer aussi les sessions Redis si utilisé
      // const redis = require('ioredis');
      // const redisClient = new redis(process.env.REDIS_URL);
      // await redisClient.del(`user_sessions:${userId}`);
      
      await client.close();
      
      await logger.warning(
        LOG_TYPES.USER_UPDATED,
        `Sessions réinitialisées pour l'utilisateur ${userId} par l'admin ${user.username}`,
        { 
          targetUserId: userId, 
          adminId: user._id,
          sessionsDeleted: result.deletedCount
        },
        req
      );
      
      return res.status(200).json({
        success: true,
        message: `${result.deletedCount} sessions supprimées avec succès`,
        data: {
          sessionsDeleted: result.deletedCount
        }
      });
    } catch (error) {
      console.error('Erreur réinitialisation sessions:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur réinitialisation sessions utilisateur ${userId}: ${error.message}`,
        { targetUserId: userId, adminId: user._id, error: error.stack },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation des sessions'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(resetUserSessionsHandler));