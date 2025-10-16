// hooks/usePermission.js - Version RBAC Simplifiée
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import RBAC, { RESOURCES, ACTIONS } from '@/lib/rbac';

export function usePermission() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
    return {
  hasAnyPermission: (perms) => perms.some(p => !!userPermissions[p] || !!userPermissions.hasPermission?.(p)),
  hasAllPermissions: (perms) => perms.every(p => !!userPermissions[p] || !!userPermissions.hasPermission?.(p)),
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

  return {
  hasAnyPermission: (perms) => perms.some(p => !!userPermissions[p] || !!userPermissions.hasPermission?.(p)),
  hasAllPermissions: (perms) => perms.every(p => !!userPermissions[p] || !!userPermissions.hasPermission?.(p)),
      // Dashboard
      canAccessDashboard: RBAC.hasPermission(user, RESOURCES.DASHBOARD, ACTIONS.READ),
      
      // Contenu
      canCreateContent: RBAC.hasPermission(user, RESOURCES.NEWS, ACTIONS.CREATE),
      canManageDocuments: RBAC.hasPermission(user, RESOURCES.DOCUMENTS, ACTIONS.CREATE),
      canManageCommunications: RBAC.hasPermission(user, RESOURCES.COMMUNICATIONS, ACTIONS.CREATE),
      
      // Entités
      canManageEstablishments: RBAC.hasPermission(user, RESOURCES.ESTABLISHMENTS, ACTIONS.CREATE),
      canViewEstablishments: RBAC.hasPermission(user, RESOURCES.ESTABLISHMENTS, ACTIONS.READ),
      canManageServices: RBAC.hasPermission(user, RESOURCES.SERVICES, ACTIONS.CREATE),
      canViewServices: RBAC.hasPermission(user, RESOURCES.SERVICES, ACTIONS.READ),
      canManageDirectors: RBAC.hasPermission(user, RESOURCES.DIRECTORS, ACTIONS.CREATE),
      canViewDirectors: RBAC.hasPermission(user, RESOURCES.DIRECTORS, ACTIONS.READ),
      
      // Communication
      canManageNotifications: RBAC.hasPermission(user, RESOURCES.NOTIFICATIONS, ACTIONS.CREATE),
      canManageNewsletter: RBAC.hasPermission(user, RESOURCES.NEWSLETTER, ACTIONS.CREATE),
      canManageFAQ: RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.CREATE),
      
      // Administration
      canManageUsers: RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.CREATE),
      canManageSettings: RBAC.hasPermission(user, RESOURCES.SETTINGS, ACTIONS.READ),
      canManageSystem: RBAC.hasPermission(user, RESOURCES.SECURITY, ACTIONS.READ),
      canViewLogs: RBAC.hasPermission(user, RESOURCES.LOGS, ACTIONS.READ),
      canAccessAdvancedStats: RBAC.hasPermission(user, RESOURCES.STATS, ACTIONS.EXPORT),
      
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
        // Admins peuvent éditer tout
        if (['super-admin', 'system-admin', 'content-admin'].includes(user.role)) {
          return true;
        }
        // Editeurs peuvent éditer leur propre contenu
        if (user.role === 'editor') {
          return user._id?.toString() === contentOwnerId?.toString();
        }
        return false;
      },
      
      // Fonction pour vérifier la possibilité de supprimer
      canDeleteContent: (contentOwnerId) => {
        // Seuls les admins peuvent supprimer
        return ['super-admin', 'system-admin', 'content-admin'].includes(user.role);
      },
      
      // Fonction pour vérifier la publication
      canPublishContent: () => {
        return ['super-admin', 'system-admin', 'content-admin'].includes(user.role);
      },
      
      // Fonction pour vérifier la gestion des rôles
      canManageRole: (targetRole) => {
        const roleHierarchy = {
          'super-admin': 4,
          'system-admin': 3,
          'content-admin': 2,
          'editor': 1
        };
        
        const userLevel = roleHierarchy[user.role] || 0;
        const targetLevel = roleHierarchy[targetRole] || 0;
        
        // Peut gérer les rôles de niveau inférieur uniquement
        return userLevel > targetLevel;
      }
    };
  }, [user]);
}