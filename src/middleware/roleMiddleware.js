// src/middleware/roleMiddleware.js
import { verifyToken } from '@/lib/auth';

// Définition des permissions par rôle (côté serveur)
const ROLE_PERMISSIONS = {
  admin: {
    // Permissions système complètes
    users: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    logs: ['read'],
    stats: ['read', 'export'],
    system: ['manage'],
    
    // Permissions de contenu complètes
    news: ['create', 'read', 'update', 'delete', 'publish'],
    documents: ['create', 'read', 'update', 'delete', 'publish'],
    communications: ['create', 'read', 'update', 'delete', 'publish'],
    
    // Permissions d'entités complètes
    establishments: ['create', 'read', 'update', 'delete'],
    services: ['create', 'read', 'update', 'delete'],
    directors: ['create', 'read', 'update', 'delete'],
    
    // Permissions de communication complètes
    notifications: ['create', 'read', 'update', 'delete', 'send'],
    newsletter: ['create', 'read', 'update', 'delete', 'send'],
    faq: ['create', 'read', 'update', 'delete']
  },
  
  editor: {
    // Pas de permissions système
    users: [],
    settings: [],
    logs: [],
    system: [],
    
    // Permissions de contenu limitées
    news: ['create', 'read', 'update', 'publish'], // Pas de delete
    documents: ['create', 'read', 'update', 'publish'], // Pas de delete
    communications: ['create', 'read', 'update', 'publish'], // Pas de delete
    
    // Permissions d'entités en lecture seule
    establishments: ['read'], // Lecture seule
    services: ['read'], // Lecture seule
    directors: ['read'], // Lecture seule
    
    // Permissions de communication limitées
    notifications: [], // Pas d'accès
    newsletter: [], // Pas d'accès
    faq: [], // Pas d'accès
    
    // Statistiques de base seulement
    stats: ['read'] // Pas d'export
  }
};

/**
 * Middleware pour vérifier les permissions sur les routes API
 */
export function requirePermission(resource, action = 'read') {
  return async (req, res, next) => {
    try {
      // Vérifier l'authentification
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      // Vérifier les permissions
      const userPermissions = ROLE_PERMISSIONS[user.role] || {};
      const resourcePermissions = userPermissions[resource] || [];
      
      if (!resourcePermissions.includes(action)) {
        return res.status(403).json({ 
          message: `Accès refusé. Permission requise: ${resource}:${action}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: `${resource}:${action}`,
          userRole: user.role,
          availableActions: resourcePermissions
        });
      }

      // Ajouter les informations utilisateur et permissions à la requête
      req.user = user;
      req.permissions = {
        resource,
        action,
        userRole: user.role,
        availableActions: resourcePermissions,
        hasPermission: (res, act) => {
          const resPerms = userPermissions[res] || [];
          return resPerms.includes(act);
        }
      };

      next();
    } catch (error) {
      console.error('Erreur de vérification des permissions:', error);
      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware pour vérifier le rôle administrateur
 */
export function requireAdmin() {
  return async (req, res, next) => {
    try {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès administrateur requis',
          code: 'ADMIN_REQUIRED',
          userRole: user.role
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Erreur de vérification admin:', error);
      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'ADMIN_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware pour vérifier plusieurs permissions
 */
export function requireAnyPermission(permissionChecks = []) {
  return async (req, res, next) => {
    try {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      const userPermissions = ROLE_PERMISSIONS[user.role] || {};
      
      // Vérifier si l'utilisateur a au moins une des permissions requises
      const hasAnyPermission = permissionChecks.some(({ resource, action }) => {
        const resourcePermissions = userPermissions[resource] || [];
        return resourcePermissions.includes(action);
      });

      if (!hasAnyPermission) {
        return res.status(403).json({ 
          message: 'Permissions insuffisantes',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissionChecks,
          userRole: user.role
        });
      }

      req.user = user;
      req.permissions = {
        userRole: user.role,
        hasPermission: (resource, action) => {
          const resPerms = userPermissions[resource] || [];
          return resPerms.includes(action);
        }
      };

      next();
    } catch (error) {
      console.error('Erreur de vérification des permissions multiples:', error);
      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
}

/**
 * Utilitaire pour vérifier les permissions côté serveur
 */
export function checkPermission(userRole, resource, action) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || {};
  const resourcePermissions = userPermissions[resource] || [];
  return resourcePermissions.includes(action);
}

/**
 * Utilitaire pour obtenir toutes les permissions d'un rôle
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || {};
}

/**
 * Utilitaire pour obtenir les actions autorisées pour une ressource
 */
export function getAllowedActions(userRole, resource) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || {};
  return userPermissions[resource] || [];
}

const roleMiddleware = {
  requirePermission,
  requireAdmin,
  requireAnyPermission,
  checkPermission,
  getRolePermissions,
  getAllowedActions
};

export default roleMiddleware;