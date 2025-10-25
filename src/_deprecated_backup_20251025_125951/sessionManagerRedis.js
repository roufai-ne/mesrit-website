// src/lib/sessionManagerRedis.js
import { connectDB } from './mongodb';
import { User } from '@/models/User';
import redisClient from './redisClient';
import crypto from 'crypto';

export class SessionManager {
  static async init() {
    await redisClient.connect();
  }

  static async createSession(userId, sessionData = {}) {
    try {
      await connectDB();
      await this.init();
      
      const sessionId = this.generateSessionId();
      const redis = redisClient.getClient();
      
      const session = {
        sessionId,
        userId: userId.toString(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        isActive: true,
        metadata: sessionData.metadata || {}
      };

      // Stocker dans Redis avec TTL de 24h
      const sessionKey = `session:${sessionId}`;
      await redis.setex(sessionKey, 24 * 60 * 60, JSON.stringify(session));
      
      // Index par utilisateur pour pouvoir récupérer toutes les sessions d'un user
      const userSessionsKey = `user_sessions:${userId}`;
      await redis.sadd(userSessionsKey, sessionId);
      await redis.expire(userSessionsKey, 24 * 60 * 60);

      // Mettre à jour l'historique de connexion
      await User.findByIdAndUpdate(userId, {
        lastLogin: new Date(),
        $push: {
          loginHistory: {
            $each: [{
              timestamp: new Date(),
              ipAddress: sessionData.ipAddress,
              userAgent: sessionData.userAgent,
              sessionId: sessionId
            }],
            $slice: -10 // Garder seulement les 10 dernières connexions
          }
        }
      });

      return sessionId;
    } catch (error) {
      console.error('Erreur création session:', error);
      throw new Error('Failed to create session');
    }
  }

  static async validateSession(sessionId, requestData = {}) {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      const sessionKey = `session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      
      if (!session.isActive) {
        return null;
      }

      // Vérifications de sécurité
      const now = new Date();
      const createdAt = new Date(session.createdAt);
      const sessionAge = now.getTime() - createdAt.getTime();
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 heures
      
      if (sessionAge > MAX_SESSION_AGE) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Détection de changement d'IP (sécurité)
      if (requestData.ipAddress && session.ipAddress !== requestData.ipAddress) {
        console.warn(`⚠️  Changement d'IP détecté pour session ${sessionId}`);
        console.warn(`   Original: ${session.ipAddress}, Nouveau: ${requestData.ipAddress}`);
        
        // Option: invalider la session en cas de changement d'IP
        // await this.invalidateSession(sessionId);
        // return null;
      }

      // Mettre à jour l'activité
      session.lastActivity = now.toISOString();
      await redis.setex(sessionKey, 24 * 60 * 60, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('Erreur validation session:', error);
      return null;
    }
  }

  static async invalidateSession(sessionId) {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      const sessionKey = `session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Marquer comme inactive
        session.isActive = false;
        session.invalidatedAt = new Date().toISOString();
        
        // Garder en base pour audit (expiration dans 7 jours)
        await redis.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(session));
        
        // Retirer de l'index utilisateur
        if (session.userId) {
          const userSessionsKey = `user_sessions:${session.userId}`;
          await redis.srem(userSessionsKey, sessionId);
        }
      }
    } catch (error) {
      console.error('Erreur invalidation session:', error);
    }
  }

  static async invalidateUserSessions(userId) {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await redis.smembers(userSessionsKey);
      
      // Invalider toutes les sessions
      const promises = sessionIds.map(sessionId => 
        this.invalidateSession(sessionId)
      );
      
      await Promise.all(promises);
      
      // Nettoyer l'index
      await redis.del(userSessionsKey);
      
      console.log(`🗑️  ${sessionIds.length} sessions invalidées pour user ${userId}`);
    } catch (error) {
      console.error('Erreur invalidation sessions utilisateur:', error);
    }
  }

  static async getUserSessions(userId) {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await redis.smembers(userSessionsKey);
      
      const sessions = [];
      for (const sessionId of sessionIds) {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redis.get(sessionKey);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.isActive) {
            sessions.push(session);
          }
        }
      }
      
      return sessions.sort((a, b) => 
        new Date(b.lastActivity) - new Date(a.lastActivity)
      );
    } catch (error) {
      console.error('Erreur récupération sessions utilisateur:', error);
      return [];
    }
  }

  static async cleanupExpiredSessions() {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      // Redis expire automatiquement les clés avec TTL
      // Mais nettoyons les index utilisateur orphelins
      
      const userSessionKeys = await redis.keys('user_sessions:*');
      let cleaned = 0;
      
      for (const userKey of userSessionKeys) {
        const sessionIds = await redis.smembers(userKey);
        const validSessions = [];
        
        for (const sessionId of sessionIds) {
          const sessionKey = `session:${sessionId}`;
          const exists = await redis.exists(sessionKey);
          if (exists) {
            validSessions.push(sessionId);
          }
        }
        
        if (validSessions.length !== sessionIds.length) {
          // Recréer l'ensemble avec seulement les sessions valides
          await redis.del(userKey);
          if (validSessions.length > 0) {
            await redis.sadd(userKey, ...validSessions);
            await redis.expire(userKey, 24 * 60 * 60);
          }
          cleaned += sessionIds.length - validSessions.length;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 ${cleaned} sessions expirées nettoyées`);
      }
    } catch (error) {
      console.error('Erreur nettoyage sessions:', error);
    }
  }

  static generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `sess_${timestamp}_${randomBytes}`;
  }

  static async getSessionStats() {
    try {
      await this.init();
      const redis = redisClient.getClient();
      
      const sessionKeys = await redis.keys('session:*');
      const userSessionKeys = await redis.keys('user_sessions:*');
      
      let activeSessions = 0;
      let inactiveSessions = 0;
      
      for (const key of sessionKeys) {
        const sessionData = await redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.isActive) {
            activeSessions++;
          } else {
            inactiveSessions++;
          }
        }
      }
      
      return {
        total: sessionKeys.length,
        active: activeSessions,
        inactive: inactiveSessions,
        userIndexes: userSessionKeys.length
      };
    } catch (error) {
      console.error('Erreur stats sessions:', error);
      return { total: 0, active: 0, inactive: 0, userIndexes: 0 };
    }
  }
}

// Nettoyage périodique toutes les heures
setInterval(() => {
  SessionManager.cleanupExpiredSessions().catch(console.error);
}, 60 * 60 * 1000);

export default SessionManager;