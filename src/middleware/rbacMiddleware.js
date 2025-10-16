// src/middleware/rbacMiddleware.js - Middleware RBAC avancé
import { verifyToken } from '@/lib/auth';
import RBAC, { RESOURCES, ACTIONS } from '@/lib/rbac';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Middleware principal pour vérifier les permissions RBAC
 */
export function requirePermission(resource, action = ACTIONS.READ, options = {}) {
  return async (req, res, next) => {
    try {
      // 1. Vérifier l'authentification
      const user = await verifyToken(req);
      console.log('[RBAC DEBUG] user:', user && { _id: user._id, username: user.username, role: user.role });
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      // 2. Préparer le contexte pour la vérification des permissions
      const context = buildPermissionContext(req, options);

      // 3. Vérifier les permissions avec RBAC
      const hasPermission = RBAC.hasPermission(user, resource, action, context);

      if (!hasPermission) {
        // Log de l'accès refusé
        logger.log(LOG_TYPES.SECURITY, `Access denied for user ${user.username}`, {
          userId: user._id,
          role: user.role,
          resource,
          action,
          context,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });

        return res.status(403).json({ 
          message: `Accès refusé. Permission requise: ${resource}:${action}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: { resource, action },
          userRole: user.role,
          context: context
        });
      }

      // 4. Ajouter les informations à la requête
      req.user = user;
      req.rbac = {
        resource,
        action,
        context,
        userPermissions: RBAC.getUserPermissions(user),
        hasPermission: (res, act, ctx = {}) => RBAC.hasPermission(user, res, act, { ...context, ...ctx }),
        canManageRole: (role) => RBAC.getManageableRoles(user.role).includes(role)
      };

      // Log de l'accès autorisé
      logger.log(LOG_TYPES.ACCESS, `Access granted for user ${user.username}`, {
        userId: user._id,
        role: user.role,
        resource,
        action,
        context
      });

      next();
    } catch (error) {
      logger.log(LOG_TYPES.ERROR, 'RBAC middleware error', {
        error: error.message,
        stack: error.stack,
        resource,
        action
      });

      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'RBAC_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware pour vérifier les permissions multiples (OU logique)
 */
export function requireAnyPermission(permissionChecks = [], options = {}) {
  return async (req, res, next) => {
    try {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      const context = buildPermissionContext(req, options);

      // Vérifier si l'utilisateur a au moins une des permissions requises
      const hasAnyPermission = permissionChecks.some(({ resource, action }) => {
        return RBAC.hasPermission(user, resource, action, context);
      });

      if (!hasAnyPermission) {
        logger.log(LOG_TYPES.SECURITY, `Multiple access denied for user ${user.username}`, {
          userId: user._id,
          role: user.role,
          requiredPermissions: permissionChecks,
          context
        });

        return res.status(403).json({ 
          message: 'Permissions insuffisantes',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissionChecks,
          userRole: user.role
        });
      }

      req.user = user;
      req.rbac = {
        context,
        userPermissions: RBAC.getUserPermissions(user),
        hasPermission: (res, act, ctx = {}) => RBAC.hasPermission(user, res, act, { ...context, ...ctx })
      };

      next();
    } catch (error) {
      logger.log(LOG_TYPES.ERROR, 'Multi-permission RBAC middleware error', {
        error: error.message,
        permissionChecks
      });

      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'RBAC_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware spécialisé pour la gestion des utilisateurs
 */
export function requireUserManagement(action = ACTIONS.READ) {
  return async (req, res, next) => {
    try {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      // Pour la gestion des utilisateurs, vérifier le niveau hiérarchique
      if (req.method === 'PUT' || req.method === 'DELETE') {
        const targetUserId = req.query.id || req.body.userId;
        if (targetUserId) {
          // Récupérer l'utilisateur cible pour vérifier son rôle
          const { default: User } = await import('@/models/User');
          const targetUser = await User.findById(targetUserId);
          
          if (targetUser && !RBAC.isRoleHigher(user.role, targetUser.role)) {
            return res.status(403).json({
              message: 'Impossible de gérer un utilisateur de niveau égal ou supérieur',
              code: 'INSUFFICIENT_HIERARCHY'
            });
          }
        }
      }

      // Vérifier la permission de base
      const hasPermission = RBAC.hasPermission(user, RESOURCES.USERS, action);

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Permission de gestion des utilisateurs requise',
          code: 'USER_MANAGEMENT_REQUIRED'
        });
      }

      req.user = user;
      req.rbac = {
        manageableRoles: RBAC.getManageableRoles(user.role),
        hasPermission: (res, act, ctx = {}) => RBAC.hasPermission(user, res, act, ctx)
      };

      next();
    } catch (error) {
      logger.log(LOG_TYPES.ERROR, 'User management RBAC middleware error', {
        error: error.message,
        action
      });

      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'USER_MANAGEMENT_ERROR'
      });
    }
  };
}

/**
 * Middleware pour vérifier les permissions sur le contenu avec workflow
 */
export function requireContentPermission(resource, action = ACTIONS.READ) {
  return async (req, res, next) => {
    try {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }

      const context = buildPermissionContext(req, {
        includeContent: true,
        includeOwnership: true
      });

      // Si c'est une action sur un contenu spécifique, récupérer ses informations
      if (req.query.id || req.params.id) {
        const contentId = req.query.id || req.params.id;
        const content = await getContentById(resource, contentId);
        
        if (content) {
          context.ownerId = content.author || content.createdBy;
          context.contentState = content.status || content.state;
          context.establishmentId = content.establishmentId;
        }
      }

      const hasPermission = RBAC.hasPermission(user, resource, action, context);

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Accès refusé pour ${resource}:${action}`,
          code: 'CONTENT_ACCESS_DENIED',
          resource,
          action,
          contentState: context.contentState
        });
      }

      req.user = user;
      req.rbac = {
        resource,
        action,
        context,
        hasPermission: (res, act, ctx = {}) => RBAC.hasPermission(user, res, act, { ...context, ...ctx })
      };

      next();
    } catch (error) {
      logger.log(LOG_TYPES.ERROR, 'Content RBAC middleware error', {
        error: error.message,
        resource,
        action
      });

      return res.status(500).json({ 
        message: 'Erreur interne du serveur',
        code: 'CONTENT_RBAC_ERROR'
      });
    }
  };
}

/**
 * Construit le contexte pour la vérification des permissions
 */
function buildPermissionContext(req, options = {}) {
  const context = {};

  // Informations de la requête
  if (options.includeQuery && req.query) {
    context.query = req.query;
  }

  // Informations du corps de la requête
  if (options.includeBody && req.body) {
    context.body = req.body;
  }

  // Domaine depuis les paramètres
  if (req.query.domain || req.body.domain) {
    context.domain = req.query.domain || req.body.domain;
  }

  // Établissement depuis les paramètres
  if (req.query.establishmentId || req.body.establishmentId) {
    context.establishmentId = req.query.establishmentId || req.body.establishmentId;
  }

  // Propriétaire du contenu
  if (options.includeOwnership && (req.query.author || req.body.author || req.query.createdBy || req.body.createdBy)) {
    context.ownerId = req.query.author || req.body.author || req.query.createdBy || req.body.createdBy;
  }

  // État du contenu
  if (options.includeContent && (req.query.status || req.body.status || req.query.state || req.body.state)) {
    context.contentState = req.query.status || req.body.status || req.query.state || req.body.state;
  }

  // Métadonnées de la requête
  context.method = req.method;
  context.path = req.path;
  context.ip = req.ip;

  return context;
}

/**
 * Récupère les informations d'un contenu par son ID
 */
async function getContentById(resource, contentId) {
  try {
    let Model;
    switch (resource) {
      case RESOURCES.NEWS:
        Model = (await import('@/models/News')).default;
        break;
      case RESOURCES.DOCUMENTS:
        Model = (await import('@/models/Document')).default;
        break;
      case RESOURCES.COMMUNICATIONS:
        Model = (await import('@/models/Communication')).default;
        break;
      default:
        return null;
    }

    return await Model.findById(contentId).select('author createdBy status state establishmentId');
  } catch (error) {
    logger.log(LOG_TYPES.ERROR, 'Error fetching content for RBAC', {
      resource,
      contentId,
      error: error.message
    });
    return null;
  }
}

/**
 * Utilitaire pour créer des middlewares combinés
 */
export function combinePermissions(...middlewares) {
  return (req, res, next) => {
    let index = 0;

    function runNext() {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    }

    runNext();
  };
}

// Exports des middlewares prêts à l'emploi
export const requireAdmin = () => requirePermission(RESOURCES.USERS, ACTIONS.MANAGE);
export const requireContentAdmin = () => requirePermission(RESOURCES.SETTINGS, ACTIONS.MANAGE);
export const requireSystemAdmin = () => requirePermission(RESOURCES.LOGS, ACTIONS.READ);

export const requireNewsAccess = (action = ACTIONS.READ) => requireContentPermission(RESOURCES.NEWS, action);
export const requireDocumentAccess = (action = ACTIONS.READ) => requireContentPermission(RESOURCES.DOCUMENTS, action);
export const requireEstablishmentAccess = (action = ACTIONS.READ) => requirePermission(RESOURCES.ESTABLISHMENTS, action);

const rbacMiddleware = {
  requirePermission,
  requireAnyPermission,
  requireUserManagement,
  requireContentPermission,
  combinePermissions,
  requireAdmin,
  requireContentAdmin,
  requireSystemAdmin,
  requireNewsAccess,
  requireDocumentAccess,
  requireEstablishmentAccess
};

export default rbacMiddleware;