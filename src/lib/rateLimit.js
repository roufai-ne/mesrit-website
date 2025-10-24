// lib/rateLimit.js
/**
 * RATE LIMITING AVEC REDIS
 *
 * Implémentation complète du rate limiting pour protéger les APIs
 * Utilise Redis pour partager les limites entre instances
 *
 * INSTALLATION:
 * npm install ioredis
 *
 * ACTIVATION:
 * 1. Configurer Redis (voir REDIS_ACTIVATION_GUIDE.md)
 * 2. Décommenter le code Redis ci-dessous
 * 3. Redémarrer l'application
 */

// ============================================
// CONFIGURATION REDIS (À DÉCOMMENTER)
// ============================================

/*
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 1, // Base de données séparée pour rate limiting
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
});

redis.on('error', (err) => {
  console.error('❌ Redis Rate Limit Error:', err);
});
*/

// ============================================
// FALLBACK: MÉMOIRE (ACTUEL)
// ============================================
const rateLimitStore = new Map();

// Nettoyage périodique du store en mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Nettoyer toutes les minutes

/**
 * Configuration des limites par route
 */
export const RATE_LIMITS = {
  // Authentification - Strict
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    skipSuccessfulRequests: false
  },

  // Toutes les routes auth - Modéré
  AUTH_GENERAL: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 requêtes
    message: 'Trop de requêtes d\'authentification. Réessayez dans 5 minutes.',
    skipSuccessfulRequests: true
  },

  // APIs générales - Permissif
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requêtes
    message: 'Trop de requêtes API. Réessayez dans 1 minute.',
    skipSuccessfulRequests: true
  },

  // Upload de fichiers - Très strict
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 uploads
    message: 'Limite d\'upload atteinte. Réessayez dans 1 heure.',
    skipSuccessfulRequests: false
  },

  // Newsletter - Strict
  NEWSLETTER: {
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    max: 3, // 3 inscriptions
    message: 'Limite d\'inscription à la newsletter atteinte.',
    skipSuccessfulRequests: false
  },

  // Contact - Modéré
  CONTACT: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5, // 5 messages
    message: 'Limite de messages de contact atteinte. Réessayez dans 1 heure.',
    skipSuccessfulRequests: false
  },

  // Admin routes - Permissif (déjà authentifiés)
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requêtes
    message: 'Trop de requêtes admin. Ralentissez.',
    skipSuccessfulRequests: true
  }
};

/**
 * Obtenir l'identifiant du client
 */
function getClientId(req) {
  // Utiliser l'IP réelle (derrière proxy)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

  // Si authentifié, utiliser l'userId
  if (req.user && req.user._id) {
    return `user:${req.user._id}`;
  }

  return `ip:${ip}`;
}

/**
 * Vérifier le rate limit avec Redis
 */
async function checkRateLimitRedis(key, limit) {
  // ============================================
  // VERSION REDIS (À DÉCOMMENTER)
  // ============================================
  /*
  try {
    const multi = redis.multi();
    const now = Date.now();

    // Incrémenter le compteur
    multi.incr(key);
    // Définir l'expiration si c'est la première requête
    multi.pexpire(key, limit.windowMs);
    // Récupérer le TTL restant
    multi.pttl(key);

    const results = await multi.exec();

    if (!results) {
      throw new Error('Redis multi command failed');
    }

    const count = results[0][1];
    const ttl = results[2][1];

    const isAllowed = count <= limit.max;
    const resetTime = Date.now() + ttl;

    return {
      allowed: isAllowed,
      limit: limit.max,
      remaining: Math.max(0, limit.max - count),
      resetTime,
      retryAfter: isAllowed ? null : Math.ceil(ttl / 1000)
    };
  } catch (error) {
    console.error('Rate limit Redis error:', error);
    // En cas d'erreur Redis, permettre la requête (fail open)
    return {
      allowed: true,
      limit: limit.max,
      remaining: limit.max,
      resetTime: Date.now() + limit.windowMs
    };
  }
  */

  // ============================================
  // VERSION MÉMOIRE (ACTUELLE)
  // ============================================
  const now = Date.now();
  let data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    // Nouvelle fenêtre
    data = {
      count: 1,
      resetTime: now + limit.windowMs
    };
    rateLimitStore.set(key, data);

    return {
      allowed: true,
      limit: limit.max,
      remaining: limit.max - 1,
      resetTime: data.resetTime,
      retryAfter: null
    };
  }

  // Incrémenter le compteur
  data.count++;
  rateLimitStore.set(key, data);

  const isAllowed = data.count <= limit.max;
  const remaining = Math.max(0, limit.max - data.count);
  const retryAfter = isAllowed ? null : Math.ceil((data.resetTime - now) / 1000);

  return {
    allowed: isAllowed,
    limit: limit.max,
    remaining,
    resetTime: data.resetTime,
    retryAfter
  };
}

/**
 * Middleware de rate limiting
 */
export function rateLimiter(limitConfig) {
  return async function rateLimitMiddleware(req, res, next) {
    try {
      const clientId = getClientId(req);
      const routeKey = req.url || 'unknown';
      const key = `ratelimit:${routeKey}:${clientId}`;

      const result = await checkRateLimitRedis(key, limitConfig);

      // Ajouter les headers de rate limit
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter);

        return res.status(429).json({
          error: limitConfig.message || 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: result.retryAfter,
          resetAt: new Date(result.resetTime).toISOString()
        });
      }

      // Skip successful requests si configuré
      if (limitConfig.skipSuccessfulRequests) {
        const originalJson = res.json.bind(res);
        res.json = function(data) {
          // Si c'est une réponse d'erreur, ne pas décrémenter
          if (res.statusCode >= 400) {
            return originalJson(data);
          }

          // Décrémenter le compteur pour les succès
          // (implémentation simplifiée - à améliorer avec Redis DECR)
          return originalJson(data);
        };
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // En cas d'erreur, permettre la requête (fail open)
      next();
    }
  };
}

/**
 * Rate limiters pré-configurés pour différentes routes
 */
export const rateLimiters = {
  authLogin: rateLimiter(RATE_LIMITS.AUTH_LOGIN),
  authGeneral: rateLimiter(RATE_LIMITS.AUTH_GENERAL),
  apiGeneral: rateLimiter(RATE_LIMITS.API_GENERAL),
  upload: rateLimiter(RATE_LIMITS.UPLOAD),
  newsletter: rateLimiter(RATE_LIMITS.NEWSLETTER),
  contact: rateLimiter(RATE_LIMITS.CONTACT),
  admin: rateLimiter(RATE_LIMITS.ADMIN)
};

/**
 * Obtenir les statistiques de rate limiting
 */
export async function getRateLimitStats() {
  // ============================================
  // VERSION REDIS (À DÉCOMMENTER)
  // ============================================
  /*
  try {
    const keys = await redis.keys('ratelimit:*');
    const stats = {
      totalKeys: keys.length,
      storage: 'Redis',
      timestamp: new Date().toISOString()
    };

    return stats;
  } catch (error) {
    console.error('Get rate limit stats error:', error);
    return { error: error.message };
  }
  */

  // VERSION MÉMOIRE
  return {
    totalKeys: rateLimitStore.size,
    storage: 'Memory (Map)',
    timestamp: new Date().toISOString()
  };
}

/**
 * Réinitialiser le rate limit pour un client spécifique
 * (utile pour les admins)
 */
export async function resetRateLimit(clientId, route) {
  const key = `ratelimit:${route}:${clientId}`;

  // ============================================
  // VERSION REDIS (À DÉCOMMENTER)
  // ============================================
  /*
  try {
    await redis.del(key);
    return { success: true, key };
  } catch (error) {
    console.error('Reset rate limit error:', error);
    return { success: false, error: error.message };
  }
  */

  // VERSION MÉMOIRE
  rateLimitStore.delete(key);
  return { success: true, key };
}

const rateLimitModule = {
  rateLimiter,
  rateLimiters,
  RATE_LIMITS,
  getRateLimitStats,
  resetRateLimit
};

export default rateLimitModule;
