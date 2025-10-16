// src/lib/rateLimiter.js - Système de limitation de taux avancé
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Configuration des limites par rôle utilisateur
 */
const ROLE_LIMITS = {
  admin: {
    // Administrateurs - limites élevées
    '/api/admin': { limit: 2000, window: 3600 }, // 2000 req/h
    '/api/auth': { limit: 50, window: 900 }, // 50 tentatives/15min
    '/api/upload': { limit: 100, window: 3600 }, // 100 uploads/h
    'default': { limit: 1000, window: 3600 } // 1000 req/h par défaut
  },
  editor: {
    // Éditeurs - limites modérées
    '/api/admin': { limit: 500, window: 3600 }, // 500 req/h
    '/api/auth': { limit: 20, window: 900 }, // 20 tentatives/15min
    '/api/upload': { limit: 50, window: 3600 }, // 50 uploads/h
    'default': { limit: 300, window: 3600 } // 300 req/h par défaut
  },
  guest: {
    // Utilisateurs non authentifiés - limites strictes
    '/api/search': { limit: 100, window: 3600 }, // 100 recherches/h
    '/api/news': { limit: 200, window: 3600 }, // 200 req/h
    '/api/services': { limit: 150, window: 3600 }, // 150 req/h
    '/api/auth/login': { limit: 5, window: 900 }, // 5 tentatives/15min
    '/api/auth/register': { limit: 3, window: 3600 }, // 3 tentatives/h
    'default': { limit: 50, window: 3600 } // 50 req/h par défaut
  }
};

/**
 * Configuration des limites par endpoint (fallback)
 */
const RATE_LIMITS = {
  // Authentification - très restrictif
  '/api/auth/login': { limit: 5, window: 900 }, // 5 tentatives par 15 min
  '/api/auth/register': { limit: 3, window: 3600 }, // 3 tentatives par heure
  '/api/auth/forgot-password': { limit: 3, window: 3600 }, // 3 tentatives par heure
  
  // APIs publiques - modéré
  '/api/search': { limit: 100, window: 3600 }, // 100 recherches par heure
  '/api/news': { limit: 200, window: 3600 }, // 200 requêtes par heure
  '/api/services': { limit: 150, window: 3600 }, // 150 requêtes par heure
  
  // APIs admin - plus permissif pour les utilisateurs authentifiés
  '/api/admin': { limit: 500, window: 3600 }, // 500 requêtes par heure
  
  // Upload de fichiers - très restrictif
  '/api/upload': { limit: 10, window: 3600 }, // 10 uploads par heure
  
  // Par défaut
  'default': { limit: 100, window: 3600 } // 100 requêtes par heure
};

/**
 * Classe de limitation de taux avec algorithme sliding window
 */
class RateLimiter {
  /**
   * Obtenir les limites adaptatives selon le rôle utilisateur
   */
  static getAdaptiveLimits(user, endpoint) {
    const userRole = user?.role || 'guest';
    const roleLimits = ROLE_LIMITS[userRole] || ROLE_LIMITS.guest;
    
    // Chercher une limite spécifique pour cet endpoint
    for (const [pattern, limits] of Object.entries(roleLimits)) {
      if (endpoint.startsWith(pattern)) {
        return limits;
      }
    }
    
    // Utiliser la limite par défaut du rôle
    return roleLimits.default || RATE_LIMITS.default;
  }

  /**
   * Vérifier si une requête est autorisée
   */
  static async checkLimit(identifier, endpoint, customLimit = null, customWindow = null, user = null) {
    try {
      // Obtenir la configuration pour cet endpoint
      const config = RATE_LIMITS[endpoint] || RATE_LIMITS['default'];
      const limit = customLimit || config.limit;
      const window = customWindow || config.window; // en secondes
      
      const now = Date.now();
      const windowStart = now - (window * 1000);
      
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('rate_limits');
      
      // Nettoyer les anciens enregistrements
      await collection.deleteMany({
        identifier,
        endpoint,
        timestamp: { $lt: windowStart }
      });
      
      // Compter les requêtes dans la fenêtre actuelle
      const currentCount = await collection.countDocuments({
        identifier,
        endpoint,
        timestamp: { $gte: windowStart }
      });
      
      // Vérifier si la limite est dépassée
      if (currentCount >= limit) {
        await client.close();
        
        // Logger la violation de limite
        await logger.warning(
          LOG_TYPES.RATE_LIMIT_EXCEEDED,
          `Rate limit dépassé pour ${identifier} sur ${endpoint}`,
          {
            identifier,
            endpoint,
            currentCount,
            limit,
            window
          }
        );
        
        return {
          allowed: false,
          limit,
          remaining: 0,
          resetTime: windowStart + (window * 1000),
          retryAfter: Math.ceil((windowStart + (window * 1000) - now) / 1000)
        };
      }
      
      // Enregistrer cette requête
      await collection.insertOne({
        identifier,
        endpoint,
        timestamp: now,
        createdAt: new Date()
      });
      
      await client.close();
      
      return {
        allowed: true,
        limit,
        remaining: limit - currentCount - 1,
        resetTime: windowStart + (window * 1000),
        retryAfter: 0
      };
    } catch (error) {
      console.error('Erreur rate limiting:', error);
      // En cas d'erreur, autoriser la requête (fail open)
      return {
        allowed: true,
        limit: 0,
        remaining: 0,
        resetTime: 0,
        retryAfter: 0
      };
    }
  }
  
  /**
   * Obtenir l'identifiant unique pour une requête
   */
  static getIdentifier(req, user = null) {
    // Priorité : utilisateur authentifié > IP
    if (user && user.id) {
      return `user:${user.id}`;
    }
    
    // Obtenir l'IP réelle
    const ip = req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               req.ip ||
               'unknown';
    
    return `ip:${ip}`;
  }
  
  /**
   * Normaliser l'endpoint pour le rate limiting
   */
  static normalizeEndpoint(url) {
    // Vérifier que l'URL est définie
    if (!url || typeof url !== 'string') {
      return '/';
    }
    
    // Supprimer les paramètres de requête
    const cleanUrl = url.split('?')[0];
    
    // Remplacer les IDs dynamiques par des placeholders
    const normalized = cleanUrl
      .replace(/\/\d+/g, '/:id') // /123 -> /:id
      .replace(/\/[a-f0-9]{24}/g, '/:id') // ObjectId MongoDB
      .replace(/\/[a-f0-9-]{36}/g, '/:id'); // UUID
    
    // Vérifier si on a une configuration spécifique
    for (const endpoint of Object.keys(RATE_LIMITS)) {
      if (normalized.startsWith(endpoint)) {
        return endpoint;
      }
    }
    
    return normalized;
  }
  
  /**
   * Middleware Express pour le rate limiting
   */
  static middleware(options = {}) {
    return async (req, res, next) => {
      try {
        const endpoint = RateLimiter.normalizeEndpoint(req.url);
        const identifier = RateLimiter.getIdentifier(req, req.user);
        
        const result = await RateLimiter.checkLimit(
          identifier,
          endpoint,
          options.limit,
          options.window
        );
        
        // Ajouter les headers de rate limiting
        res.set({
          'X-RateLimit-Limit': result.limit,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        });
        
        if (!result.allowed) {
          res.set('Retry-After', result.retryAfter);
          
          return res.status(429).json({
            success: false,
            message: 'Trop de requêtes. Veuillez réessayer plus tard.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter,
            limit: result.limit,
            resetTime: new Date(result.resetTime).toISOString()
          });
        }
        
        if (next) next();
      } catch (error) {
        console.error('Erreur middleware rate limiting:', error);
        // En cas d'erreur, continuer (fail open)
        if (next) next();
      }
    };
  }

  /**
   * Middleware Next.js pour le rate limiting
   */
  static withRateLimit(handler, options = {}) {
    return async (req, res) => {
      try {
        const endpoint = RateLimiter.normalizeEndpoint(req.url);
        const identifier = RateLimiter.getIdentifier(req, req.user);
        
        const result = await RateLimiter.checkLimit(
          identifier,
          endpoint,
          options.limit,
          options.window
        );
        
        // Ajouter les headers de rate limiting
        res.setHeader('X-RateLimit-Limit', result.limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
        
        if (!result.allowed) {
          res.setHeader('Retry-After', result.retryAfter);
          
          return res.status(429).json({
            success: false,
            message: 'Trop de requêtes. Veuillez réessayer plus tard.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter,
            limit: result.limit,
            resetTime: new Date(result.resetTime).toISOString()
          });
        }
        
        return handler(req, res);
      } catch (error) {
        console.error('Erreur middleware rate limiting:', error);
        // En cas d'erreur, continuer (fail open)
        return handler(req, res);
      }
    };
  }
  
  /**
   * Obtenir les statistiques de rate limiting
   */
  static async getStats(timeRange = 3600) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('rate_limits');
      
      const now = Date.now();
      const since = now - (timeRange * 1000);
      
      // Statistiques par endpoint
      const endpointStats = await collection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: '$endpoint',
            count: { $sum: 1 },
            uniqueIdentifiers: { $addToSet: '$identifier' }
          }
        },
        {
          $project: {
            endpoint: '$_id',
            requests: '$count',
            uniqueUsers: { $size: '$uniqueIdentifiers' }
          }
        },
        { $sort: { requests: -1 } }
      ]).toArray();
      
      // Top identifiants (IPs/utilisateurs)
      const topIdentifiers = await collection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: '$identifier',
            count: { $sum: 1 },
            endpoints: { $addToSet: '$endpoint' }
          }
        },
        {
          $project: {
            identifier: '$_id',
            requests: '$count',
            endpointCount: { $size: '$endpoints' }
          }
        },
        { $sort: { requests: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      // Requêtes par heure
      const hourlyStats = await collection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: { $toDate: '$timestamp' }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      await client.close();
      
      return {
        timeRange,
        endpointStats,
        topIdentifiers,
        hourlyStats,
        totalRequests: endpointStats.reduce((sum, stat) => sum + stat.requests, 0)
      };
    } catch (error) {
      console.error('Erreur récupération stats rate limiting:', error);
      return {
        timeRange,
        endpointStats: [],
        topIdentifiers: [],
        hourlyStats: [],
        totalRequests: 0
      };
    }
  }
  
  /**
   * Nettoyer les anciens enregistrements
   */
  static async cleanup(maxAge = 86400) { // 24h par défaut
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('rate_limits');
      
      const cutoff = Date.now() - (maxAge * 1000);
      
      const result = await collection.deleteMany({
        timestamp: { $lt: cutoff }
      });
      
      await client.close();
      
      if (result.deletedCount > 0) {
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Nettoyage rate limiting: ${result.deletedCount} enregistrements supprimés`
        );
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Erreur nettoyage rate limiting:', error);
      return 0;
    }
  }
  
  /**
   * Réinitialiser les limites pour un identifiant
   */
  static async resetLimits(identifier, endpoint = null) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('rate_limits');
      
      const query = { identifier };
      if (endpoint) {
        query.endpoint = endpoint;
      }
      
      const result = await collection.deleteMany(query);
      await client.close();
      
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Limites réinitialisées pour ${identifier}${endpoint ? ` sur ${endpoint}` : ''}`,
        { identifier, endpoint, deletedCount: result.deletedCount }
      );
      
      return result.deletedCount;
    } catch (error) {
      console.error('Erreur réinitialisation limites:', error);
      return 0;
    }
  }
}

export default RateLimiter;

// Utilitaires pour l'intégration
export const rateLimitMiddleware = RateLimiter.middleware();
export const strictRateLimit = RateLimiter.middleware({ limit: 10, window: 900 }); // 10 req/15min
export const authRateLimit = RateLimiter.middleware({ limit: 5, window: 900 }); // 5 req/15min

// Middlewares Next.js
export const withRateLimit = RateLimiter.withRateLimit;
export const withStrictRateLimit = (handler) => RateLimiter.withRateLimit(handler, { limit: 10, window: 900 });
export const withAuthRateLimit = (handler) => RateLimiter.withRateLimit(handler, { limit: 5, window: 900 });