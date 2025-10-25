// src/lib/security/index.js
/**
 * POINT D'ENTRÉE UNIFIÉ POUR TOUTE LA SÉCURITÉ DU PROJET
 *
 * Ce fichier centralise tous les systèmes de sécurité pour éviter la duplication
 * et assurer la cohérence dans tout le projet.
 *
 * Architecture:
 * - Authentication: JWT, sessions, 2FA
 * - Authorization: RBAC, permissions
 * - API Security: Rate limiting, sanitization, headers
 * - Session Management: Redis-based sessions
 */

// Imports internes pour les helpers
import { verifyToken as authVerifyToken } from '../auth';
import RBACLib from '../rbac';
import { withSecurityHeaders as secHeadersWrapper } from '../securityHeaders';

// ============================================
// AUTHENTIFICATION
// ============================================
export {
  verifyToken,
  generateToken,
  hashPassword,
  verifyPassword
} from '../auth';

export { AuthProvider, useAuth } from '@/contexts/AuthContext';

// ============================================
// AUTORISATION (RBAC)
// ============================================
export { default as RBAC, ROLES, RESOURCES, ACTIONS } from '../rbac';
export { usePermission, usePermissionLegacy } from '@/hooks/usePermission';

// ============================================
// GESTION DES SESSIONS
// ============================================
export { default as SessionManager } from '../sessionManager';

// ============================================
// SÉCURITÉ API
// ============================================
export { default as ApiSecurity } from '../apiSecurity';
export { secureApi } from '../secureApi';
export { withSecurityHeaders } from '../securityHeaders';

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================
export { securityMiddleware, apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
export { default as requireRole } from '@/middleware/rbacMiddleware';
export { default as sessionSecurity } from '@/middleware/sessionSecurity';

// ============================================
// UTILITAIRES DE SÉCURITÉ
// ============================================
export { sanitizeInput, sanitizeObject } from '../sanitize';
export { default as RateLimiter } from '../rateLimit';

// ============================================
// HEADERS ET CSP
// ============================================
export {
  getSecurityHeaders,
  buildCSPString,
  nextConfigHeaders
} from '../securityHeaders';

// ============================================
// 2FA
// ============================================
export {
  TwoFactorAuth,
  generateTOTPSecret,
  verifyTOTPToken
} from '../twoFactorAuth';

// ============================================
// HELPER: Protection de route API unifiée
// ============================================

/**
 * Fonction helper pour protéger facilement une route API
 *
 * @param {Function} handler - Handler de la route
 * @param {Object} options - Options de sécurité
 * @returns {Function} Handler protégé
 *
 * @example
 * export default protectRoute(async (req, res) => {
 *   // Votre code ici
 * }, {
 *   requireAuth: true,
 *   requireRole: 'admin',
 *   rateLimit: true
 * });
 */
export function protectRoute(handler, options = {}) {
  return async (req, res) => {
    try {
      // 1. Vérifier l'authentification si requise
      if (options.requireAuth) {
        const user = await authVerifyToken(req);
        if (!user) {
          return res.status(401).json({ error: 'Non authentifié' });
        }
        req.user = user;
      }

      // 2. Vérifier le rôle si requis
      if (options.requireRole && req.user) {
        const hasRole = RBACLib.hasRole(req.user, options.requireRole);
        if (!hasRole) {
          return res.status(403).json({ error: 'Accès refusé' });
        }
      }

      // 3. Vérifier les permissions si requises
      if (options.requirePermission && req.user) {
        const { resource, action } = options.requirePermission;
        const hasPermission = RBACLib.hasPermission(req.user, resource, action);
        if (!hasPermission) {
          return res.status(403).json({ error: 'Permission refusée' });
        }
      }

      // 4. Appliquer les headers de sécurité
      const wrappedHandler = secHeadersWrapper(handler);

      // 5. Exécuter le handler
      return await wrappedHandler(req, res);
    } catch (error) {
      console.error('Erreur protection route:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
}

/**
 * Middleware pour vérifier les permissions RBAC
 */
export function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!RBACLib.hasPermission(req.user, resource, action)) {
      return res.status(403).json({ error: 'Permission refusée' });
    }

    next();
  };
}
