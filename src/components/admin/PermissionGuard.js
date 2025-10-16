// src/components/admin/PermissionGuard.js
import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

/**
 * Composant pour protéger l'accès basé sur les permissions
 */
export function PermissionGuard({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  fallback = null, 
  showFallback = true,
  children 
}) {
  const userPermissions = usePermission();
  
  let hasAccess = false;
  
  if (permission) {
    // Vérification d'une permission unique - utiliser la propriété directe du hook
    hasAccess = userPermissions[permission] || false;
  } else if (permissions.length > 0) {
    // Vérification de plusieurs permissions
    hasAccess = requireAll 
      ? userPermissions.hasAllPermissions(permissions)
      : userPermissions.hasAnyPermission(permissions);
  } else {
    // Aucune permission spécifiée, accès autorisé
    hasAccess = true;
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return fallback;
  }
  
  if (!showFallback) {
    return null;
  }
  
  // Fallback par défaut
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
          <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
  <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">
        Accès restreint
      </h3>
      <p className="text-red-600 dark:text-red-400 text-sm">
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
      </p>
      <div className="mt-4 text-xs text-red-500 dark:text-red-400">
        Rôle requis : {permission || permissions.join(', ')}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher du contenu en lecture seule
 */
export function ReadOnlyGuard({ 
  editPermission, 
  viewPermission, 
  children, 
  readOnlyMessage = "Mode lecture seule" 
}) {
  const permissions = usePermission();
  
  const canEdit = permissions.hasPermission(editPermission);
  const canView = permissions.hasPermission(viewPermission);
  
  if (!canView && !canEdit) {
    return (
      <PermissionGuard permission={viewPermission}>
        {children}
      </PermissionGuard>
    );
  }
  
  if (canEdit) {
    return <>{children}</>;
  }
  
  // Mode lecture seule
  return (
    <div className="relative">
      {/* Bannière lecture seule */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 flex items-center">
        <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
        <span className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
          {readOnlyMessage}
        </span>
      </div>
      
      {/* Contenu en lecture seule */}
      <div className="pointer-events-none opacity-75">
        {children}
      </div>
      
      {/* Overlay pour empêcher les interactions */}
      <div className="absolute inset-0 bg-transparent cursor-not-allowed" />
    </div>
  );
}

/**
 * Composant pour afficher les informations de rôle
 */
export function RoleIndicator({ showPermissions = false }) {
  const permissions = usePermission();
  
  return (
    <div className="bg-niger-cream dark:bg-secondary-800 rounded-xl p-4 border border-niger-orange/20">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${
          permissions.isAdmin 
            ? 'bg-niger-orange text-white' 
            : 'bg-niger-green text-white'
        }`}>
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-niger-green dark:text-niger-green-light">
            {permissions.isAdmin ? 'Administrateur' : 'Éditeur'}
          </h3>
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            {permissions.isAdmin 
              ? 'Accès complet au système' 
              : 'Accès limité à la gestion de contenu'
            }
          </p>
        </div>
      </div>
      
      {showPermissions && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-niger-green dark:text-niger-green-light">
            Permissions principales :
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {permissions.content.canCreate && (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Créer du contenu
              </div>
            )}
            {permissions.content.canEdit && (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Modifier le contenu
              </div>
            )}
            {permissions.content.canDelete && (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Supprimer le contenu
              </div>
            )}
            {permissions.system.canManageUsers && (
              <div className="flex items-center text-niger-orange dark:text-niger-orange">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Gérer les utilisateurs
              </div>
            )}
            {permissions.system.canManageSettings && (
              <div className="flex items-center text-niger-orange dark:text-niger-orange">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Paramètres système
              </div>
            )}
            {permissions.stats.canViewAdvanced && (
              <div className="flex items-center text-purple-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                Statistiques avancées
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook pour créer des actions conditionnelles basées sur les permissions
 */
export function useConditionalActions() {
  const permissions = usePermission();
  
  return {
    // Créer une action conditionnelle
    createAction: (action, permission, fallbackAction = null) => {
      return permissions.hasPermission(permission) ? action : fallbackAction;
    },
    
    // Créer un handler d'événement conditionnel
    createHandler: (handler, permission, fallbackMessage = "Action non autorisée") => {
      return permissions.hasPermission(permission) 
        ? handler 
        : () => alert(fallbackMessage);
    },
    
    // Vérifier si une action est autorisée
    isActionAllowed: (permission) => permissions.hasPermission(permission),
    
    // Obtenir le style conditionnel pour un bouton
    getButtonStyle: (permission, enabledStyle = "", disabledStyle = "opacity-50 cursor-not-allowed") => {
      return permissions.hasPermission(permission) ? enabledStyle : disabledStyle;
    }
  };
}

export default PermissionGuard;