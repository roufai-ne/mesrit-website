// src/lib/securityHeaders.js - Configuration des headers de sécurité
/**
 * Configuration des headers de sécurité pour Next.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// NOUVEAU : Détecte si on est en local sans HTTPS (serveur de test)
// Utilisez DISABLE_SECURITY_HEADERS=true dans .env.local pour désactiver les headers stricts
const isLocalWithoutSSL = process.env.DISABLE_SECURITY_HEADERS === 'true';

/**
 * Générer un nonce unique pour chaque requête
 */
function generateNonce() {
  return crypto.randomBytes(16).toString("base64");
}

/**
 * Content Security Policy (CSP) - Version améliorée avec nonces
 */
function buildCSPDirectives(nonce = null) {
  const baseDirectives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []), // Développement permissif
      "https://cdn.jsdelivr.net", // CDN autorisés
      "https://unpkg.com", // Pour certaines librairies
      // En production, utiliser nonces et hashes
      ...(isProduction && nonce ? [`'nonce-${nonce}'`] : []),
      ...(isProduction
        ? ["'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='"]
        : []),
    ],
    "style-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      "https://fonts.googleapis.com",
      // Autoriser les styles inline (nécessaire pour React et Tailwind)
      "'unsafe-inline'",
      // Hashes pour les styles critiques
      "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // Style vide
      // Domaines CDN pour les styles
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ],
    "font-src": [
      "'self'",
      "https://fonts.gstatic.com",
      "https://fonts.googleapis.com",
      "data:", // Pour les fonts en base64
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ],
    "img-src": [
      "'self'",
      "data:", // Pour les images en base64
      "blob:", // Pour les images générées côté client
      "https:", // Autoriser toutes les images HTTPS (peut être restreint)
      // Domaines spécifiques autorisés
      "https://images.unsplash.com",
      "https://via.placeholder.com",
      "https://picsum.photos", // Pour les images de test
      "*.gravatar.com", // Pour les avatars
    ],
    "media-src": ["'self'", "data:", "blob:"],
    "object-src": ["'none'"], // Bloque les plugins dangereux (Flash, etc.)
    "frame-src": [
      "'none'",
      // Ajouter des domaines spécifiques si nécessaire pour les embeds
      // 'https://www.youtube.com',
      // 'https://player.vimeo.com'
    ],
    "child-src": ["'self'"], // Pour les web workers
    "worker-src": ["'self'", "blob:"], // Pour les service workers
    "manifest-src": ["'self'"], // Pour le manifest PWA
    "base-uri": ["'self'"], // Restreint les balises <base>
    "form-action": ["'self'"], // Restreint les soumissions de formulaires
    "frame-ancestors": ["'none'"], // Protection contre le clickjacking
    "connect-src": [
      "'self'",
      // APIs externes autorisées
      "https://api.github.com", // Si utilisé pour les mises à jour
      ...(isDevelopment ? ["ws://localhost:*", "wss://localhost:*"] : []), // WebSocket en dev
      // Ajouter d'autres APIs selon les besoins
    ],
    "upgrade-insecure-requests": isProduction && !isLocalWithoutSSL ? [] : null, // Force HTTPS seulement en vraie production
    "block-all-mixed-content": isProduction && !isLocalWithoutSSL ? [] : null, // Bloque le contenu mixte seulement en vraie production
  };

  return baseDirectives;
}

// Construire la chaîne CSP
function buildCSPString(nonce = null) {
  const directives = buildCSPDirectives(nonce);

  return Object.entries(directives)
    .filter(([_, value]) => value !== null)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(" ")}`;
      } else if (sources.length === 0) {
        return directive; // Directive sans valeur (comme upgrade-insecure-requests)
      }
      return null;
    })
    .filter(Boolean)
    .join("; ");
}

// CSP par défaut (sans nonce)
const defaultCSPString = buildCSPString();

/**
 * Headers de sécurité complets
 */
function getSecurityHeaders(nonce = null) {
  return [
    // Content Security Policy
    {
      key: "Content-Security-Policy",
      value: buildCSPString(nonce),
    },

    // CSP Report-Only pour tester de nouvelles règles
    ...(isDevelopment
      ? [
          {
            key: "Content-Security-Policy-Report-Only",
            value: buildCSPString(nonce).replace("'unsafe-inline'", "'none'"), // Test sans unsafe-inline
          },
        ]
      : []),

    // Strict Transport Security (HSTS)
    {
      key: "Strict-Transport-Security",
      value: isProduction && !isLocalWithoutSSL
        ? "max-age=31536000; includeSubDomains; preload"
        : "max-age=0", // Désactivé en développement et en local sans SSL
    },

    // Protection contre le clickjacking
    {
      key: "X-Frame-Options",
      value: "DENY",
    },

    // Protection contre le sniffing MIME
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },

    // Protection XSS intégrée du navigateur
    {
      key: "X-XSS-Protection",
      value: "1; mode=block",
    },

    // Contrôle du referrer
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },

    // Permissions Policy (anciennement Feature Policy)
    {
      key: "Permissions-Policy",
      value: [
        "camera=()", // Bloque l'accès à la caméra
        "microphone=()", // Bloque l'accès au microphone
        "geolocation=()", // Bloque la géolocalisation
        "payment=()", // Bloque l'API de paiement
        "usb=()", // Bloque l'accès USB
        "magnetometer=()", // Bloque le magnétomètre
        "accelerometer=()", // Bloque l'accéléromètre
        "gyroscope=()", // Bloque le gyroscope
        "fullscreen=(self)", // Autorise le plein écran seulement pour le domaine
        "display-capture=()", // Bloque la capture d'écran
      ].join(", "),
    },

    // Cross-Origin Policies - MODIFIÉ pour local sans SSL
    {
      key: "Cross-Origin-Embedder-Policy",
      value: "unsafe-none", // Permissif pour compatibilité
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: isLocalWithoutSSL ? "unsafe-none" : "same-origin", // Permissif en local
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "same-origin",
    },

    // Cache Control pour les pages sensibles
    {
      key: "Cache-Control",
      value: "no-store, no-cache, must-revalidate, proxy-revalidate",
    },

    // Pragma pour la compatibilité
    {
      key: "Pragma",
      value: "no-cache",
    },

    // Expires pour forcer la non-mise en cache
    {
      key: "Expires",
      value: "0",
    },
  ];
}

// Headers par défaut
const securityHeaders = getSecurityHeaders();

/**
 * Headers spécifiques pour les APIs
 */
const apiSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer",
  },
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate",
  },
];

/**
 * Middleware pour appliquer les headers de sécurité aux APIs avec nonce
 */
function withSecurityHeaders(handler, options = {}) {
  return async (req, res) => {
    // Générer un nonce unique pour cette requête
    const nonce = generateNonce();
    req.nonce = nonce; // Stocker le nonce dans la requête

    // Appliquer les headers de sécurité avec nonce
    const headersWithNonce = options.useNonce
      ? getSecurityHeaders(nonce)
      : apiSecurityHeaders;
    headersWithNonce.forEach(({ key, value }) => {
      res.setHeader(key, value);
    });

    // CORS sécurisé
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "https://localhost:3000",
      ...(isProduction ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key, X-CSRF-Token, X-Nonce"
    );

    // Ajouter le nonce aux headers de réponse pour le client
    if (options.useNonce) {
      res.setHeader("X-Nonce", nonce);
    }

    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

/**
 * Configuration pour next.config.js - MODIFIÉ
 */
const nextConfigHeaders = async () => {
  // En développement OU en local sans SSL, utiliser des headers allégés
  if (isDevelopment || isLocalWithoutSSL) {
    console.log('⚠️  Headers de sécurité allégés activés (développement ou local sans SSL)');
    
    return [
      {
        // Headers minimaux pour toutes les routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Plus permissif que DENY
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // PAS de HSTS, COOP strict, ou CSP strict
        ],
      },
      {
        // Cache pour les images
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  }

  // PRODUCTION avec HTTPS : Headers de sécurité complets
  console.log('🔒 Headers de sécurité stricts activés (production avec HTTPS)');
  
  const baseHeaders = getSecurityHeaders();

  return [
    {
      // Appliquer à toutes les routes
      source: "/(.*)",
      headers: baseHeaders,
    },
    {
      // Headers spécifiques pour les APIs
      source: "/api/(.*)",
      headers: [
        ...apiSecurityHeaders,
        // CSP plus strict pour les APIs
        {
          key: "Content-Security-Policy",
          value: "default-src 'none'; frame-ancestors 'none';",
        },
      ],
    },
    {
      // Headers spécifiques pour les pages admin (plus stricts)
      source: "/admin/(.*)",
      headers: [
        ...baseHeaders,
        {
          key: "Cache-Control",
          value: "no-store, no-cache, must-revalidate, private",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
      ],
    },
    {
      // Headers pour les fichiers statiques
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
      ],
    },
  ];
};

/**
 * Utilitaire pour vérifier la conformité CSP
 */
class CSPValidator {
  static generateScriptHash(script) {
    // Générer un hash SHA-256 pour un script inline
    const hash = crypto
      .createHash("sha256")
      .update(script, "utf8")
      .digest("base64");

    return `'sha256-${hash}'`;
  }

  static generateStyleHash(style) {
    // Générer un hash SHA-256 pour un style inline
    const hash = crypto
      .createHash("sha256")
      .update(style, "utf8")
      .digest("base64");

    return `'sha256-${hash}'`;
  }

  static validateInlineScript(script) {
    // Vérifier si un script inline est conforme à la CSP
    const hash = this.generateScriptHash(script);
    console.log(`Script hash généré: ${hash}`);
    return hash;
  }

  static validateInlineStyle(style) {
    // Vérifier si un style inline est conforme à la CSP
    const hash = this.generateStyleHash(style);
    console.log(`Style hash généré: ${hash}`);
    return hash;
  }

  static reportViolation(violation) {
    // Logger les violations CSP
    console.warn("🚨 CSP Violation détectée:", {
      blockedURI: violation.blockedURI,
      violatedDirective: violation.violatedDirective,
      originalPolicy: violation.originalPolicy,
      sourceFile: violation.sourceFile,
      lineNumber: violation.lineNumber,
      timestamp: new Date().toISOString(),
    });

    // En production, envoyer à un service de monitoring
    if (isProduction && !isLocalWithoutSSL) {
      // Intégration avec service de monitoring (Sentry, LogRocket, etc.)
      try {
        // Exemple d'envoi vers un endpoint de monitoring
        fetch("/api/security/csp-violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            violation,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          }),
        }).catch((err) => console.error("Erreur envoi violation CSP:", err));
      } catch (error) {
        console.error("Erreur lors du rapport de violation CSP:", error);
      }
    }
  }

  /**
   * Analyser les violations CSP communes et suggérer des corrections
   */
  static analyzeViolation(violation) {
    const suggestions = [];

    if (violation.violatedDirective?.includes("script-src")) {
      if (violation.blockedURI?.includes("inline")) {
        suggestions.push("Déplacer le script inline vers un fichier externe");
        suggestions.push("Utiliser un nonce ou un hash pour le script");
      }
    }

    if (violation.violatedDirective?.includes("style-src")) {
      if (violation.blockedURI?.includes("inline")) {
        suggestions.push("Déplacer les styles inline vers un fichier CSS");
        suggestions.push("Utiliser CSS-in-JS avec un nonce");
      }
    }

    return suggestions;
  }
}

/**
 * Utilitaire pour récupérer le nonce CSP côté client
 */
function getClientNonce() {
  if (typeof window !== "undefined") {
    // Côté client, récupérer le nonce depuis les meta tags
    const nonceElement = document.querySelector('meta[name="csp-nonce"]');
    return nonceElement?.getAttribute("content") || null;
  }
  return null;
}

module.exports = {
  securityHeaders,
  apiSecurityHeaders,
  withSecurityHeaders,
  nextConfigHeaders,
  CSPValidator,
  generateNonce,
  buildCSPString,
  getSecurityHeaders,
  getClientNonce,
};