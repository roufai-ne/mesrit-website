// src/lib/rbac.js - Role-Based Access Control System pour Site Web MESRIT
export const ROLES_HIERARCHY = {
  'super-admin': {
    level: 100,
    inherits: [],
    label: 'Super Administrateur',
    description: 'Accès complet au système'
  },
  'system-admin': {
    level: 80,
    inherits: [],
    label: 'Administrateur Système',
    description: 'Administration technique et utilisateurs'
  },
  'content-admin': {
    level: 60,
    inherits: [],
    label: 'Administrateur Contenu',
    description: 'Supervision complète du contenu'
  },
  'editor': {
    level: 40,
    inherits: [],
    label: 'Éditeur',
    description: 'Création et modification de contenu'
  }
};

export const RESOURCES = {
  // Contenu
  NEWS: 'news',
  DOCUMENTS: 'documents',
  COMMUNICATIONS: 'communications',
  
  // Entités
  ESTABLISHMENTS: 'establishments',
  SERVICES: 'services',
  DIRECTORS: 'directors',
  
  // Système
  USERS: 'users',
  SETTINGS: 'settings',
  LOGS: 'logs',
  STATS: 'stats',
  SECURITY: 'security',
  
  // Communication
  NOTIFICATIONS: 'notifications',
  NEWSLETTER: 'newsletter',
  FAQ: 'faq',
  
  // Dashboard
  DASHBOARD: 'dashboard'
};

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  ARCHIVE: 'archive',
  EXPORT: 'export',
  MANAGE: 'manage',
  SEND: 'send',
  CONFIGURE: 'configure'
};

export const CONTENT_STATES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Définition des permissions par rôle selon les fonctionnalités MESRIT
export const ROLE_PERMISSIONS = {
  'super-admin': {
    // Accès complet à tout
    [RESOURCES.DASHBOARD]: [ACTIONS.READ, ACTIONS.MANAGE],
    [RESOURCES.NEWS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.DOCUMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.COMMUNICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.SEND],
    [RESOURCES.ESTABLISHMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.SERVICES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.DIRECTORS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
    [RESOURCES.SECURITY]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
    [RESOURCES.LOGS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.STATS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND],
    [RESOURCES.NEWSLETTER]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND, ACTIONS.CONFIGURE],
    [RESOURCES.FAQ]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
  },

  'system-admin': {
    // Administration technique + contenu complet (sauf gestion super-admin)
    [RESOURCES.DASHBOARD]: [ACTIONS.READ],
    [RESOURCES.NEWS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.DOCUMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.COMMUNICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.SEND],
    [RESOURCES.ESTABLISHMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.SERVICES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.DIRECTORS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE], // Pas MANAGE (config sécurité)
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE], // Pas MANAGE (config critique)
    [RESOURCES.SECURITY]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
    [RESOURCES.LOGS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.STATS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND],
    [RESOURCES.NEWSLETTER]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND, ACTIONS.CONFIGURE],
    [RESOURCES.FAQ]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
  },

  'content-admin': {
    // Supervision complète du contenu
    [RESOURCES.DASHBOARD]: [ACTIONS.READ],
    [RESOURCES.NEWS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.DOCUMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.ARCHIVE],
    [RESOURCES.COMMUNICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.SEND],
    [RESOURCES.ESTABLISHMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE], // Pas DELETE
    [RESOURCES.SERVICES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE], // Pas DELETE
    [RESOURCES.DIRECTORS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE], // Pas DELETE
    [RESOURCES.USERS]: [], // Pas d'accès gestion utilisateurs
    [RESOURCES.SETTINGS]: [], // Pas d'accès paramètres
    [RESOURCES.SECURITY]: [], // Pas d'accès sécurité
    [RESOURCES.LOGS]: [], // Pas d'accès logs système
    [RESOURCES.STATS]: [ACTIONS.READ], // Stats contenu seulement
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND],
    [RESOURCES.NEWSLETTER]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.SEND, ACTIONS.CONFIGURE],
    [RESOURCES.FAQ]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
  },

  'editor': {
    // Création et modification de contenu personnel
    [RESOURCES.DASHBOARD]: [ACTIONS.READ], // Dashboard personnel
    [RESOURCES.NEWS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.PUBLISH], // Ses propres contenus
    [RESOURCES.DOCUMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.PUBLISH], // Ses propres contenus
    [RESOURCES.COMMUNICATIONS]: [ACTIONS.READ], // Lecture seule
    [RESOURCES.ESTABLISHMENTS]: [ACTIONS.READ], // Lecture seule
    [RESOURCES.SERVICES]: [ACTIONS.READ], // Lecture seule
    [RESOURCES.DIRECTORS]: [ACTIONS.READ], // Lecture seule
    [RESOURCES.USERS]: [], // Pas d'accès
    [RESOURCES.SETTINGS]: [], // Pas d'accès
    [RESOURCES.SECURITY]: [], // Pas d'accès
    [RESOURCES.LOGS]: [], // Pas d'accès
    [RESOURCES.STATS]: [ACTIONS.READ], // Stats personnelles
    [RESOURCES.NOTIFICATIONS]: [], // Pas d'accès
    [RESOURCES.NEWSLETTER]: [], // Pas d'accès
    [RESOURCES.FAQ]: [ACTIONS.READ] // Lecture seule
  }
};

// Classe principale RBAC
export class RBAC {
  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  static hasPermission(user, resource, action, context = {}) {
    if (!user || !user.role) return false;

    // Super admin a tous les droits
    if (user.role === 'super-admin') return true;

    // Vérifier les permissions directes du rôle
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions || !rolePermissions[resource]) return false;

    const hasDirectPermission = rolePermissions[resource].includes(action);

    // Vérifier les permissions héritées
    const hasInheritedPermission = this.checkInheritedPermissions(user.role, resource, action);

    // Vérifier les restrictions contextuelles
    const isContextAllowed = this.checkContextualPermissions(user, resource, action, context);

    return (hasDirectPermission || hasInheritedPermission) && isContextAllowed;
  }

  /**
   * Vérifie les permissions héritées des rôles inférieurs
   */
  static checkInheritedPermissions(role, resource, action) {
    const roleConfig = ROLES_HIERARCHY[role];
    if (!roleConfig || !roleConfig.inherits) return false;

    return roleConfig.inherits.some(inheritedRole => {
      const inheritedPermissions = ROLE_PERMISSIONS[inheritedRole];
      if (!inheritedPermissions || !inheritedPermissions[resource]) return false;
      
      return inheritedPermissions[resource].includes(action) ||
             this.checkInheritedPermissions(inheritedRole, resource, action);
    });
  }

  /**
   * Vérifie les permissions contextuelles (domaine, propriétaire, etc.)
   */
  static checkContextualPermissions(user, resource, action, context) {
    // Vérification du domaine assigné
    if (context.domain && user.assignedDomains) {
      if (!user.assignedDomains.includes(context.domain)) return false;
    }

    // Vérification du propriétaire (pour modification/suppression)
    if (context.ownerId && [ACTIONS.UPDATE, ACTIONS.DELETE].includes(action)) {
      // Les rôles inférieurs ne peuvent modifier que leur propre contenu
      const roleLevel = ROLES_HIERARCHY[user.role]?.level || 0;
      if (roleLevel < 70 && context.ownerId !== user._id.toString()) {
        return false;
      }
    }

    // Vérification de l'état du contenu
    if (context.contentState) {
      return this.canAccessContentState(user.role, action, context.contentState);
    }

    // Vérification des établissements assignés
    if (context.establishmentId && user.assignedEstablishments) {
      if (!user.assignedEstablishments.includes(context.establishmentId)) return false;
    }

    // Vérification des permissions temporaires
    if (user.temporaryPermissions) {
      return this.checkTemporaryPermissions(user, resource, action, context);
    }

    return true;
  }

  /**
   * Vérifie l'accès selon l'état du contenu
   */
  static canAccessContentState(role, action, contentState) {
    const roleLevel = ROLES_HIERARCHY[role]?.level || 0;

    switch (contentState) {
      case CONTENT_STATES.DRAFT:
        return roleLevel >= 40; // Contributor et plus

      case CONTENT_STATES.PENDING:
        if (action === ACTIONS.APPROVE) return roleLevel >= 60; // Senior Editor et plus
        return roleLevel >= 50; // Editor et plus pour lecture/modification

      case CONTENT_STATES.APPROVED:
        if (action === ACTIONS.PUBLISH) return roleLevel >= 70; // Content Manager et plus
        return roleLevel >= 50; // Editor et plus pour lecture/modification

      case CONTENT_STATES.PUBLISHED:
        if ([ACTIONS.UPDATE, ACTIONS.DELETE].includes(action)) return roleLevel >= 60; // Senior Editor et plus
        return roleLevel >= 10; // Tous pour lecture

      case CONTENT_STATES.ARCHIVED:
        if (action === ACTIONS.READ) return roleLevel >= 50; // Editor et plus
        if (action === ACTIONS.UPDATE) return roleLevel >= 80; // Content Admin et plus
        return false;

      default:
        return true;
    }
  }

  /**
   * Vérifie les permissions temporaires
   */
  static checkTemporaryPermissions(user, resource, action, context) {
    const now = new Date();
    
    return user.temporaryPermissions.some(tempPerm => {
      // Vérifier la validité temporelle
      if (tempPerm.startDate && new Date(tempPerm.startDate) > now) return false;
      if (tempPerm.endDate && new Date(tempPerm.endDate) < now) return false;

      // Vérifier la permission
      const hasPermission = tempPerm.permissions.includes(`${resource}:${action}`);

      // Vérifier le domaine si spécifié
      if (tempPerm.domains && context.domain) {
        return hasPermission && tempPerm.domains.includes(context.domain);
      }

      return hasPermission;
    });
  }

  /**
   * Obtient toutes les permissions d'un utilisateur
   */
  static getUserPermissions(user) {
    if (!user || !user.role) return {};

    const permissions = { ...ROLE_PERMISSIONS[user.role] };

    // Ajouter les permissions héritées
    const roleConfig = ROLES_HIERARCHY[user.role];
    if (roleConfig && roleConfig.inherits) {
      roleConfig.inherits.forEach(inheritedRole => {
        const inheritedPermissions = ROLE_PERMISSIONS[inheritedRole];
        Object.keys(inheritedPermissions).forEach(resource => {
          if (!permissions[resource]) {
            permissions[resource] = [];
          }
          inheritedPermissions[resource].forEach(action => {
            if (!permissions[resource].includes(action)) {
              permissions[resource].push(action);
            }
          });
        });
      });
    }

    return permissions;
  }

  /**
   * Vérifie si un rôle est supérieur à un autre
   */
  static isRoleHigher(role1, role2) {
    const level1 = ROLES_HIERARCHY[role1]?.level || 0;
    const level2 = ROLES_HIERARCHY[role2]?.level || 0;
    return level1 > level2;
  }

  /**
   * Obtient les rôles que l'utilisateur peut gérer
   */
  static getManageableRoles(userRole) {
    const userLevel = ROLES_HIERARCHY[userRole]?.level || 0;
    
    return Object.keys(ROLES_HIERARCHY).filter(role => {
      const roleLevel = ROLES_HIERARCHY[role]?.level || 0;
      return roleLevel < userLevel;
    });
  }
}

export default RBAC;