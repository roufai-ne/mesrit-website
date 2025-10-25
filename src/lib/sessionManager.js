// lib/sessionManagerWithRedis.js
/**
 * SESSION MANAGER AVEC REDIS
 *
 * ⚠️ VERSION AMÉLIORÉE AVEC REDIS POUR PRODUCTION
 *
 * INSTALLATION:
 * npm install redis ioredis
 *
 * ACTIVATION SUR UBUNTU:
 * 1. Installer Redis: sudo apt install redis-server
 * 2. Configurer .env.production:
 *    REDIS_URL=redis://localhost:6379
 *    REDIS_PASSWORD=votre_password
 *    USE_REDIS=true
 * 3. Remplacer l'import dans les fichiers qui utilisent SessionManager:
 *    import { SessionManager } from '@/lib/sessionManagerWithRedis';
 */

import crypto from 'crypto';
import { connectDB } from './mongodb';
import { User } from '@/models/User';

// ============================================
// CONFIGURATION REDIS (À DÉCOMMENTER)
// ============================================

/*
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

// Connexion Redis avec gestion d'erreurs
redis.on('connect', () => {
  console.log('✅ Redis connecté');
});

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err);
});

redis.on('ready', () => {
  console.log('✅ Redis prêt');
});
*/

// ============================================
// FALLBACK: MAP EN MÉMOIRE (ACTUEL)
// ============================================
// ⚠️ Cette Map sera supprimée une fois Redis activé
const activeSessions = new Map();

export class SessionManager {
  /**
   * Créer une nouvelle session
   */
  static async createSession(userId, sessionData = {}) {
    try {
      await connectDB();

      const sessionId = this.generateSessionId();
      const session = {
        sessionId,
        userId,
        createdAt: new Date(),
        lastActivity: new Date(),
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        isActive: true,
        metadata: sessionData.metadata || {}
      };

      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        // Stocker dans Redis avec TTL de 24h
        const sessionKey = `session:${sessionId}`;
        const sessionTTL = 24 * 60 * 60; // 24 heures en secondes

        await redis.setex(
          sessionKey,
          sessionTTL,
          JSON.stringify(session)
        );

        // Index par userId pour récupérer toutes les sessions d'un utilisateur
        const userSessionsKey = `user:${userId}:sessions`;
        await redis.sadd(userSessionsKey, sessionId);
        await redis.expire(userSessionsKey, sessionTTL);

        console.log(`✅ Session ${sessionId} créée dans Redis`);
      } else {
        // Fallback: Map en mémoire
        activeSessions.set(sessionId, session);
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      activeSessions.set(sessionId, session);

      // Mettre à jour le dernier login de l'utilisateur
      await User.findByIdAndUpdate(userId, {
        lastLogin: new Date(),
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent
          }
        }
      });

      return sessionId;
    } catch (error) {
      console.error('Erreur création session:', error);
      throw new Error('Échec de création de session');
    }
  }

  /**
   * Valider et mettre à jour l'activité de la session
   */
  static async validateSession(sessionId, requestData = {}) {
    try {
      let session = null;

      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
          return null; // Session expirée ou invalide
        }

        session = JSON.parse(sessionData);

        // Convertir les dates de string à Date
        session.createdAt = new Date(session.createdAt);
        session.lastActivity = new Date(session.lastActivity);
      } else {
        session = activeSessions.get(sessionId);
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      session = activeSessions.get(sessionId);

      if (!session || !session.isActive) {
        return null;
      }

      // Vérifier timeout (24h max)
      const sessionAge = Date.now() - new Date(session.createdAt).getTime();
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 heures

      if (sessionAge > MAX_SESSION_AGE) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Mettre à jour la dernière activité
      session.lastActivity = new Date();

      // Vérification de sécurité: IP address
      if (requestData.ipAddress && session.ipAddress !== requestData.ipAddress) {
        console.warn(`⚠️  IP mismatch pour session ${sessionId}`);
        // En production, invalider la session ou demander re-authentification
      }

      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const sessionKey = `session:${sessionId}`;
        await redis.setex(
          sessionKey,
          24 * 60 * 60,
          JSON.stringify(session)
        );
      } else {
        activeSessions.set(sessionId, session);
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      activeSessions.set(sessionId, session);

      return session;
    } catch (error) {
      console.error('Erreur validation session:', error);
      return null;
    }
  }

  /**
   * Invalider une session spécifique
   */
  static async invalidateSession(sessionId) {
    try {
      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redis.get(sessionKey);

        if (sessionData) {
          const session = JSON.parse(sessionData);

          // Retirer de l'index utilisateur
          const userSessionsKey = `user:${session.userId}:sessions`;
          await redis.srem(userSessionsKey, sessionId);

          // Supprimer la session
          await redis.del(sessionKey);

          console.log(`✅ Session ${sessionId} invalidée dans Redis`);
        }
      } else {
        const session = activeSessions.get(sessionId);
        if (session) {
          session.isActive = false;
          session.invalidatedAt = new Date();
          activeSessions.set(sessionId, session);
        }
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      const session = activeSessions.get(sessionId);
      if (session) {
        session.isActive = false;
        session.invalidatedAt = new Date();
        activeSessions.set(sessionId, session);
      }
    } catch (error) {
      console.error('Erreur invalidation session:', error);
    }
  }

  /**
   * Invalider toutes les sessions d'un utilisateur
   */
  static async invalidateAllUserSessions(userId) {
    try {
      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const userSessionsKey = `user:${userId}:sessions`;
        const sessionIds = await redis.smembers(userSessionsKey);

        // Supprimer toutes les sessions
        for (const sessionId of sessionIds) {
          await redis.del(`session:${sessionId}`);
        }

        // Supprimer l'index
        await redis.del(userSessionsKey);

        console.log(`✅ Toutes les sessions de ${userId} invalidées`);
      } else {
        // Invalider toutes les sessions de cet utilisateur en mémoire
        for (const [sessionId, session] of activeSessions.entries()) {
          if (session.userId === userId) {
            session.isActive = false;
            session.invalidatedAt = new Date();
            activeSessions.set(sessionId, session);
          }
        }
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      for (const [sessionId, session] of activeSessions.entries()) {
        if (session.userId === userId) {
          session.isActive = false;
          session.invalidatedAt = new Date();
          activeSessions.set(sessionId, session);
        }
      }
    } catch (error) {
      console.error('Erreur invalidation sessions utilisateur:', error);
    }
  }

  /**
   * Obtenir toutes les sessions actives d'un utilisateur
   */
  static async getUserSessions(userId) {
    try {
      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const userSessionsKey = `user:${userId}:sessions`;
        const sessionIds = await redis.smembers(userSessionsKey);

        const sessions = [];
        for (const sessionId of sessionIds) {
          const sessionData = await redis.get(`session:${sessionId}`);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.isActive) {
              sessions.push(session);
            }
          }
        }

        return sessions;
      } else {
        // Récupérer depuis Map
        return Array.from(activeSessions.values())
          .filter(session => session.userId === userId && session.isActive);
      }
      */

      // VERSION ACTUELLE: Map en mémoire
      return Array.from(activeSessions.values())
        .filter(session => session.userId === userId && session.isActive);
    } catch (error) {
      console.error('Erreur récupération sessions:', error);
      return [];
    }
  }

  /**
   * Nettoyer les sessions expirées (cronjob)
   */
  static async cleanupExpiredSessions() {
    try {
      const now = Date.now();
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24h

      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        // Redis gère automatiquement l'expiration via TTL
        // Rien à faire ici
        console.log('✅ Redis gère automatiquement les expirations');
        return;
      }
      */

      // VERSION ACTUELLE: Nettoyer Map
      let cleaned = 0;
      for (const [sessionId, session] of activeSessions.entries()) {
        const age = now - new Date(session.createdAt).getTime();
        if (age > MAX_SESSION_AGE) {
          activeSessions.delete(sessionId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`✅ ${cleaned} sessions expirées nettoyées`);
      }
    } catch (error) {
      console.error('Erreur nettoyage sessions:', error);
    }
  }

  /**
   * Générer un ID de session sécurisé
   */
  static generateSessionId() {
    // Génération cryptographiquement sécurisée avec crypto (importé en haut)
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Obtenir les statistiques des sessions
   */
  static async getSessionStats() {
    try {
      // ============================================
      // VERSION REDIS (À DÉCOMMENTER)
      // ============================================
      /*
      if (process.env.USE_REDIS === 'true') {
        const keys = await redis.keys('session:*');
        return {
          totalSessions: keys.length,
          activeSessions: keys.length, // Toutes sont actives (non expirées)
          storage: 'Redis'
        };
      }
      */

      // VERSION ACTUELLE: Stats Map
      const allSessions = Array.from(activeSessions.values());
      return {
        totalSessions: allSessions.length,
        activeSessions: allSessions.filter(s => s.isActive).length,
        storage: 'Memory (Map)'
      };
    } catch (error) {
      console.error('Erreur stats sessions:', error);
      return { error: error.message };
    }
  }
}

// ============================================
// CRONJOB OPTIONNEL (À DÉCOMMENTER)
// ============================================
/*
// Nettoyer les sessions expirées toutes les heures
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    SessionManager.cleanupExpiredSessions();
  }, 60 * 60 * 1000); // 1 heure
}
*/

export default SessionManager;
