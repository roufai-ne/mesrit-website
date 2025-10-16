// middleware/securityMiddleware.js
import ApiSecurity from '@/lib/apiSecurity';
import { verifyToken } from '@/lib/auth';
import rateLimit from 'express-rate-limit';
import { sanitize } from 'express-mongo-sanitize';
import crypto from 'crypto';
import { applySecurityHeaders, getCSPForPage } from '@/lib/securityHeaders';
import { sanitizeInput } from '@/lib/sanitize';

// Configuration du rate limiting avec options avancées
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par fenêtre
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      message: 'Trop de requêtes, veuillez réessayer plus tard.',
      retryAfter: res.getHeader('Retry-After')
    });
  },
  skipFailedRequests: true, // Ne pas compter les requêtes échouées
  standardHeaders: true, // Retourne les headers standards de rate limit
  legacyHeaders: false // Désactive les anciens headers
});

// Types de routes
const ROUTE_TYPES = {
  PUBLIC: 'public',      // Accessible à tous avec API key
  PROTECTED: 'protected' // Nécessite API key + authentification
};

// Enhanced security headers with helmet.js integration
const getEnhancedSecurityHeaders = (routeType = 'api') => {
  const baseHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), ambient-light-sensor=(), accelerometer=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  };

  // Enhanced CSP based on route type
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'strict-dynamic'",
      process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : "",
      "https://fonts.googleapis.com"
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Needed for CSS-in-JS libraries
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    'connect-src': [
      "'self'",
      process.env.NODE_ENV === 'development' ? "ws: wss:" : ""
    ].filter(Boolean),
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null,
    'block-all-mixed-content': process.env.NODE_ENV === 'production' ? [] : null,
  };

  // Build CSP string
  const csp = Object.entries(cspDirectives)
    .filter(([_, value]) => value !== null)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length === 0) {
        return directive; // Directives without sources
      }
      return `${directive} ${Array.isArray(sources) ? sources.join(' ') : sources}`;
    })
    .join('; ');

  return {
    ...baseHeaders,
    'Content-Security-Policy': csp,
    'Cache-Control': routeType === 'api' 
      ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
      : 'public, max-age=31536000, immutable'
  };
};

// Configuration des limites de requête
const REQUEST_LIMITS = {
  MAX_BODY_SIZE: 5*1024 * 1024, // 1MB
  MAX_FIELDS: 1000
};

// Fonction de validation du Content-Type
const validateContentType = (req) => {
  // Pour les méthodes GET et HEAD, pas besoin de vérifier le Content-Type
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  
  // Pour les uploads de fichiers (généralement en POST avec multipart/form-data)
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    return true;
  }
  
  // Pour les autres requêtes, vérifier que c'est du JSON
  const contentType = req.headers['content-type'];
  return contentType && contentType.includes('application/json');
};

// Enhanced sanitization with DOMPurify integration
const sanitizeRequest = (req) => {
  // Validation de la taille de la requête
  const contentLength = parseInt(req.headers['content-length'] || 0);
  if (contentLength > REQUEST_LIMITS.MAX_BODY_SIZE) {
    throw new Error('Request too large');
  }

  // Enhanced sanitization using our custom sanitize utility
  const deepSanitize = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(deepSanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitizedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        if (Object.keys(sanitizedObj).length >= REQUEST_LIMITS.MAX_FIELDS) {
          throw new Error('Too many fields in request');
        }
        // Use both mongo sanitize and our custom sanitizer
        const cleanKey = sanitize(key);
        sanitizedObj[cleanKey] = deepSanitize(value);
      }
      return sanitizedObj;
    }
    // Use our enhanced sanitization for strings
    return typeof obj === 'string' ? sanitizeInput(sanitize(obj)) : sanitize(obj);
  };

  req.body = deepSanitize(req.body);
  req.query = deepSanitize(req.query);
  req.params = deepSanitize(req.params);
};

// Gestion avancée des erreurs
const handleError = (error, req, res) => {
  const errorId = crypto.randomUUID();
  
  // Log structuré de l'erreur
  console.error({
    errorId,
    timestamp: new Date().toISOString(),
    type: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    request: {
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers).reduce((acc, key) => {
        // Ne pas logger les informations sensibles
        if (!['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())) {
          acc[key] = req.headers[key];
        }
        return acc;
      }, {}),
      ip: req.ip
    }
  });

  // Réponse sécurisée
  return res.status(error.status || 500).json({
    errorId,
    message: error.publicMessage || 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && {
      detail: error.message,
      stack: error.stack
    })
  });
};

// Middleware principal de sécurité
export function securityMiddleware(routeType = ROUTE_TYPES.PUBLIC) {
  return async (req, res, next) => {
    try {
      console.log(`Method: ${req.method}, Route type: ${routeType}`);
      
      // Apply enhanced security headers
      const headers = getEnhancedSecurityHeaders('api');
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      const origin = req.headers.origin;
      if (origin && !await ApiSecurity.validateOrigin(origin)) {
        throw new Error('Unauthorized origin');
      }

      if (!validateContentType(req)) {
        throw new Error('Unsupported Content-Type');
      }

      // Pour les routes protégées, vérifier d'abord l'authentification par token
      if (routeType === ROUTE_TYPES.PROTECTED) {
        const user = await verifyToken(req);
        if (!user) {
          throw new Error('Not authenticated');
        }
        req.user = user;
      } else {
        // Pour les routes publiques, vérifier l'API key pour s'assurer que seul le site officiel peut accéder
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || !await ApiSecurity.validateApiKey(apiKey)) {
          throw new Error('Invalid API key');
        }
      }

      sanitizeRequest(req);

      const metadata = await ApiSecurity.getRequestMetadata(req);
      console.log('Request metadata:', metadata);

      return next();
    } catch (error) {
      return handleError(error, req, res);
    }
  };
}

// Helper pour les routes d'API
export function apiHandler(handlers, routeTypes = {}) {
  return async (req, res) => {
    try {
      // Appliquer le rate limiting
      await new Promise((resolve, reject) => {
        limiter(req, res, (err) => (err ? reject(err) : resolve()));
      });

      // Déterminer le type de route pour la méthode actuelle
      const method = req.method;
      const routeType = routeTypes[method] || ROUTE_TYPES.PUBLIC; // Par défaut PUBLIC si non spécifié
      console.log(`Méthode: ${method}, Type appliqué: ${routeType}`);

      // Appliquer le middleware de sécurité avec le type de route
      await new Promise((resolve, reject) => {
        securityMiddleware(routeType)(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Vérifier si le handler existe pour cette méthode
      const handler = handlers[method];
      if (!handler || typeof handler !== 'function') {
        res.setHeader('Allow', Object.keys(handlers));
        throw new Error(`Method ${method} Not Allowed`);
      }

      // Exécuter le handler
      return await handler(req, res);
    } catch (error) {
      return handleError(error, req, res);
    }
  };
}

export { ROUTE_TYPES };