// src/lib/securityHeaders.js - Configuration SIMPLIFIÉE pour site web public
/**
 * Configuration allégée des headers de sécurité pour un site web public
 * Optimisée pour la compatibilité et la performance
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Content Security Policy — réduite pour limiter la surface d'attaque
 * unsafe-inline conservé pour script-src (Next.js inline scripts requis)
 * unsafe-eval retiré de default-src
 */
function buildCSPString() {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' data: https:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob: https:",
    isDevelopment
      ? "connect-src 'self' https: wss: http://localhost:* ws://localhost:*"
      : "connect-src 'self' https: wss:",
    "frame-src 'self' https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

/**
 * Headers de sécurité SIMPLIFIÉS pour site web public
 */
function getSecurityHeaders() {
  return [
    // CSP très permissive
    {
      key: "Content-Security-Policy",
      value: buildCSPString(),
    },

    // HSTS activé en production, désactivé en dev pour permettre HTTP local
    {
      key: "Strict-Transport-Security",
      value: isDevelopment ? "max-age=0" : "max-age=31536000; includeSubDomains",
    },

    // Frame options permissif
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
    },

    // Protection MIME basique
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },

    // XSS Protection désactivé (obsolète et peut causer des problèmes)
    {
      key: "X-XSS-Protection",
      value: "0",
    },

    // Referrer permissif
    {
      key: "Referrer-Policy",
      value: "no-referrer-when-downgrade",
    },

    // Permissions permissives
    {
      key: "Permissions-Policy",
      value: "interest-cohort=()",
    },

    // Cross-Origin permissif
    {
      key: "Cross-Origin-Embedder-Policy",
      value: "unsafe-none",
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "unsafe-none",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "cross-origin",
    },
  ];
}

/**
 * Headers pour les APIs (aussi simplifiés)
 */
const apiSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate",
  },
];

/**
 * Middleware pour APIs
 */
function withSecurityHeaders(handler, options = {}) {
  return async (req, res) => {
    // Appliquer les headers
    apiSecurityHeaders.forEach(({ key, value }) => {
      res.setHeader(key, value);
    });

    // CORS restreint à l'origine du site — credentials incompatible avec wildcard
    const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

/**
 * Configuration pour next.config.js - SIMPLIFIÉE
 */
const nextConfigHeaders = async () => {
  const baseHeaders = getSecurityHeaders();

  return [
    {
      // Headers minimaux pour toutes les routes
      source: "/(.*)",
      headers: baseHeaders,
    },
    {
      // Cache optimal pour les images
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache pour les fichiers statiques Next.js
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache pour les assets publics
      source: "/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ];
};

/**
 * Utilitaire pour validation CSP (conservé pour compatibilité)
 */
class CSPValidator {
  static reportViolation(violation) {
    if (isDevelopment) {
      console.warn("CSP Violation (dev only):", violation);
    }
  }

  static analyzeViolation(violation) {
    return ["CSP désactivée en mode permissif"];
  }
}

// Fonctions de compatibilité (pour ne pas casser le code existant)
function generateNonce() {
  return null; // Pas de nonce en mode simplifié
}

function getClientNonce() {
  return null;
}

module.exports = {
  securityHeaders: getSecurityHeaders(),
  apiSecurityHeaders,
  withSecurityHeaders,
  nextConfigHeaders,
  CSPValidator,
  buildCSPString,
  getSecurityHeaders,
  generateNonce,
  getClientNonce,
};
