// hooks/usePermission.js - Version RBAC Simplifiée
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import RBAC, { RESOURCES, ACTIONS } from '@/lib/rbac';

export function usePermission() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        // Toutes les permissions false par défaut
        canAccessDashboard: false,
        canCreateContent: false,
        canManageUsers: false,
        canManageSettings: false,
        canManageSystem: false,
        canManageDocuments: false,
        canManageCommunications: false,
        canManageEstablishments: false,
        canViewEstablishments: false,
        canManageServices: false,
        canViewServices: false,
        canManageDirectors: false,
        canViewDirectors: false,
        canManageNotifications: false,
        canManageNewsletter: false,
        canManageFAQ: false,
        canViewLogs: false,
        canAccessAdvancedStats: false,
        isAdmin: false,
        isContentAdmin: false,
        isEditor: false,
        hasPermission: () => false
      };
    }

    const permsObj = {
      // Dashboard
      canAccessDashboard: RBAC.hasPermission(user, RESOURCES.DASHBOARD, ACTIONS.READ),
      // Contenu
      canCreateContent: RBAC.hasPermission(user, RESOURCES.NEWS, ACTIONS.CREATE),
      canManageDocuments: RBAC.hasPermission(user, RESOURCES.DOCUMENTS, ACTIONS.CREATE),
      canManageCommunications: RBAC.hasPermission(user, RESOURCES.COMMUNICATIONS, ACTIONS.CREATE),
      canViewCommunications: RBAC.hasPermission(user, RESOURCES.COMMUNICATIONS, ACTIONS.READ),
      // Entités
      canManageEstablishments: RBAC.hasPermission(user, RESOURCES.ESTABLISHMENTS, ACTIONS.CREATE),
      canViewEstablishments: RBAC.hasPermission(user, RESOURCES.ESTABLISHMENTS, ACTIONS.READ),
      canManageServices: RBAC.hasPermission(user, RESOURCES.SERVICES, ACTIONS.CREATE),
      canViewServices: RBAC.hasPermission(user, RESOURCES.SERVICES, ACTIONS.READ),
      canManageDirectors: RBAC.hasPermission(user, RESOURCES.DIRECTORS, ACTIONS.CREATE),
      canViewDirectors: RBAC.hasPermission(user, RESOURCES.DIRECTORS, ACTIONS.READ),
      // Communication
      canManageNotifications: RBAC.hasPermission(user, RESOURCES.NOTIFICATIONS, ACTIONS.CREATE),
      canSendNotifications: RBAC.hasPermission(user, RESOURCES.NOTIFICATIONS, ACTIONS.SEND),
      canManageNewsletter: RBAC.hasPermission(user, RESOURCES.NEWSLETTER, ACTIONS.CREATE),
      canSendNewsletter: RBAC.hasPermission(user, RESOURCES.NEWSLETTER, ACTIONS.SEND),
      canManageFAQ: RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.CREATE),
      canViewFAQ: RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.READ),
      // Administration
      canManageUsers: RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.CREATE),
      canViewUsers: RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.READ),
      canManageSettings: RBAC.hasPermission(user, RESOURCES.SETTINGS, ACTIONS.UPDATE),
      canViewSettings: RBAC.hasPermission(user, RESOURCES.SETTINGS, ACTIONS.READ),
      canManageSystem: RBAC.hasPermission(user, RESOURCES.SECURITY, ACTIONS.READ),
      canViewLogs: RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.READ),
      canExportLogs: RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.EXPORT),
      canAccessAdvancedStats: RBAC.hasPermission(user, RESOURCES.STATS, ACTIONS.EXPORT),
      canViewStats: RBAC.hasPermission(user, RESOURCES.STATS, ACTIONS.READ),
      // Utilitaires de rôle
      isAdmin: ['super-admin', 'system-admin'].includes(user.role),
      isContentAdmin: ['super-admin', 'system-admin', 'content-admin'].includes(user.role),
      isEditor: user.role === 'editor',
      isSuperAdmin: user.role === 'super-admin',
      isSystemAdmin: user.role === 'system-admin',
      // Fonction générique pour vérifications avancées
      hasPermission: (resource, action, context = {}) => {
        try {
          return RBAC.hasPermission(user, resource, action, context);
        } catch (error) {
          console.error('Erreur vérification permission:', error);
          return false;
        }
      },
      // Fonction pour vérifier la propriété du contenu
      canEditContent: (contentOwnerId) => {
        if (["super-admin", "system-admin", "content-admin"].includes(user.role)) {
          return true;
        }
        if (user.role === "editor") {
          return user._id?.toString() === contentOwnerId?.toString();
        }
        return false;
      },
      canDeleteContent: (contentOwnerId) => {
        return ["super-admin", "system-admin", "content-admin"].includes(user.role);
      },
      canPublishContent: () => {
        return ["super-admin", "system-admin", "content-admin"].includes(user.role);
      },
      canManageRole: (targetRole) => {
        const roleHierarchy = {
          "super-admin": 4,
          "system-admin": 3,
          "content-admin": 2,
          "editor": 1
        };
        const userLevel = roleHierarchy[user.role] || 0;
        const targetLevel = roleHierarchy[targetRole] || 0;
        return userLevel > targetLevel;
      },
    };
    permsObj.hasAnyPermission = (perms) => perms.some(p => !!permsObj[p]);
    permsObj.hasAllPermissions = (perms) => perms.every(p => !!permsObj[p]);
    return permsObj;
  }, [user]);
}

// Hook alternatif pour compatibilité avec l'ancien système
export function usePermissionLegacy() {
  const { user, loading } = useAuth();
  
  // Définition des permissions par rôle pour compatibilité
  const ROLE_PERMISSIONS = {
    'super-admin': {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: true,
      canPublishContent: true,
      canManageMedia: true,
      canManageUsers: true,
      canManageSettings: true,
      canViewLogs: true,
      canDeleteLogs: true,
      canExportData: true,
      canManageStats: true,
      canViewBasicStats: true
    },
    'system-admin': {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: true,
      canPublishContent: true,
      canManageMedia: true,
      canManageUsers: true,
      canManageSettings: true,
      canViewLogs: true,
      canDeleteLogs: false,
      canExportData: true,
      canManageStats: true,
      canViewBasicStats: true
    },
    'content-admin': {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: true,
      canPublishContent: true,
      canManageMedia: true,
      canManageUsers: false,
      canManageSettings: false,
      canViewLogs: false,
      canDeleteLogs: false,
      canExportData: false,
      canManageStats: false,
      canViewBasicStats: true
    },
    'editor': {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: false,
      canPublishContent: false,
      canManageMedia: true,
      canManageUsers: false,
      canManageSettings: false,
      canViewLogs: false,
      canDeleteLogs: false,
      canExportData: false,
      canManageStats: false,
      canViewBasicStats: true
    }
  };
  
  if (loading) {
    // Return loading state - all permissions false but indicate loading
    return Object.keys(ROLE_PERMISSIONS.editor).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {
      isLoading: true,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      role: null,
      isAdmin: false,
      isEditor: false,
      content: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canManageMedia: false
      },
      system: {
        canManageUsers: false,
        canManageSettings: false,
        canViewLogs: false,
        canExportData: false
      },
      stats: {
        canViewBasic: false,
        canViewAdvanced: false,
        canExport: false
      }
    });
  }
  
  if (!user || !user.role) {
    // Aucune permission si pas d'utilisateur ou de rôle
    return Object.keys(ROLE_PERMISSIONS.editor).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {
      isLoading: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      role: null,
      isAdmin: false,
      isEditor: false,
      content: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canManageMedia: false
      },
      system: {
        canManageUsers: false,
        canManageSettings: false,
        canViewLogs: false,
        canExportData: false
      },
      stats: {
        canViewBasic: false,
        canViewAdvanced: false,
        canExport: false
      }
    });
  }
  
  const permissions = ROLE_PERMISSIONS[user.role] || {};
  
  return {
    ...permissions,
    // Helpers pour vérifier les permissions
    isLoading: false,
    hasPermission: (permission) => permissions[permission] === true,
    hasAnyPermission: (permissionList) => permissionList.some(p => permissions[p] === true),
    hasAllPermissions: (permissionList) => permissionList.every(p => permissions[p] === true),
    
    // Informations sur le rôle
    role: user.role,
    isAdmin: user.role === 'admin',
    isEditor: user.role === 'editor',
    
    // Permissions groupées pour faciliter l'usage
    content: {
      canCreate: permissions.canCreateContent,
      canEdit: permissions.canEditContent,
      canDelete: permissions.canDeleteContent,
      canPublish: permissions.canPublishContent,
      canManageMedia: permissions.canManageMedia
    },
    
    system: {
      canManageUsers: permissions.canManageUsers,
      canManageSettings: permissions.canManageSettings,
      canViewLogs: permissions.canViewLogs,
      canDeleteLogs: permissions.canDeleteLogs,
      canExportData: permissions.canExportData
    },
    
    stats: {
      canViewBasic: permissions.canViewBasicStats || permissions.canManageStats,
      canViewAdvanced: permissions.canManageStats,
      canExport: permissions.canExportData
    }
  };
}

// Hook pour vérifier une permission spécifique
export function useHasPermission(permission) {
  const permissions = usePermission();
  return permissions.hasPermission(permission);
}

// Hook pour vérifier plusieurs permissions
export function useHasAnyPermission(permissionList) {
  const permissions = usePermission();
  return permissions.hasAnyPermission(permissionList);
}

// Hook pour vérifier toutes les permissions
export function useHasAllPermissions(permissionList) {
  const permissions = usePermission();
  return permissions.hasAllPermissions(permissionList);
}