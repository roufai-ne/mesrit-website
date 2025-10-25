// hooks/useUserManagement.js - Hook spécialisé pour la gestion des utilisateurs
import { usePermission } from './usePermission';
import { useAuth } from '@/contexts/AuthContext';
import { RBAC } from '@/lib/rbac';

export function useUserManagement() {
  const { user: currentUser } = useAuth();
  const permissions = usePermission();

  // Obtenir les rôles que l'utilisateur peut gérer
  const getManageableRoles = () => {
    if (!currentUser) return [];
    
    const allRoles = ['super-admin', 'system-admin', 'content-admin', 'editor'];
    return allRoles.filter(role => permissions.canManageRole(role));
  };

  // Obtenir les domaines disponibles selon le rôle
  const getAvailableDomains = (role) => {
    const allDomains = ['news', 'documents', 'communications', 'establishments', 'services', 'directors'];
    
    switch (role) {
      case 'super-admin':
      case 'system-admin':
      case 'content-admin':
        return allDomains;
      case 'editor':
        return ['news', 'documents'];
      default:
        return [];
    }
  };

  // Obtenir les domaines par défaut selon le rôle
  const getDefaultDomains = (role) => {
    switch (role) {
      case 'super-admin':
      case 'system-admin':
      case 'content-admin':
        return ['news', 'documents', 'communications', 'establishments', 'services', 'directors'];
      case 'editor':
        return ['news', 'documents'];
      default:
        return [];
    }
  };

  // Obtenir le label d'un rôle
  const getRoleLabel = (role) => {
    const labels = {
      'super-admin': 'Super Administrateur',
      'system-admin': 'Administrateur Système',
      'content-admin': 'Administrateur de Contenu',
      'editor': 'Éditeur'
    };
    return labels[role] || role;
  };

  // Obtenir la couleur CSS d'un rôle
  const getRoleColor = (role) => {
    const colors = {
      'super-admin': 'bg-red-100 text-red-800',
      'system-admin': 'bg-orange-100 text-orange-800',
      'content-admin': 'bg-yellow-100 text-yellow-800',
      'editor': 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Vérifier si on peut effectuer une action spécifique sur un utilisateur
  const canPerformUserAction = (action, targetUser) => {
    if (!currentUser || !targetUser) return false;

    switch (action) {
      case 'edit':
        return permissions.canManageUsers && permissions.canManageRole(targetUser.role);
      
      case 'delete':
        return permissions.canManageUsers && 
               permissions.canManageRole(targetUser.role) &&
               targetUser._id !== currentUser._id; // Ne peut pas se supprimer
      
      case 'reset_password':
        return permissions.canManageUsers && permissions.canManageRole(targetUser.role);
      
      case 'change_role':
        return permissions.canManageUsers && 
               permissions.canManageRole(targetUser.role);
      
      case 'view':
        return permissions.canManageUsers || targetUser._id === currentUser._id;
      
      default:
        return false;
    }
  };

  // Valider les données d'un formulaire utilisateur
  const validateUserForm = (formData, isEdit = false) => {
    const errors = {};

    // Validation du nom d'utilisateur
    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'L\'email doit être valide';
    }

    // Validation du mot de passe (obligatoire pour nouveau, optionnel pour édition)
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (isEdit && formData.password && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation du rôle
    if (!formData.role || !getManageableRoles().includes(formData.role)) {
      errors.role = 'Rôle invalide ou non autorisé';
    }

    // Validation des domaines
    if (!formData.assignedDomains || formData.assignedDomains.length === 0) {
      errors.assignedDomains = 'Au moins un domaine doit être assigné';
    }

    const availableDomains = getAvailableDomains(formData.role);
    const invalidDomains = formData.assignedDomains?.filter(domain => 
      !availableDomains.includes(domain)
    ) || [];
    
    if (invalidDomains.length > 0) {
      errors.assignedDomains = `Domaines non autorisés pour ce rôle: ${invalidDomains.join(', ')}`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Préparer les données pour l'API
  const prepareUserData = (formData, isEdit = false) => {
    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      status: formData.status || 'active',
      assignedDomains: formData.assignedDomains || []
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (formData.password && formData.password.trim()) {
      userData.password = formData.password;
    }

    return userData;
  };

  // Obtenir les statistiques des utilisateurs par rôle
  const getUserStats = (users) => {
    const stats = {
      total: users.length,
      byRole: {},
      byStatus: { active: 0, inactive: 0 },
      byDomains: {}
    };

    users.forEach(user => {
      // Stats par rôle
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      
      // Stats par statut
      stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
      
      // Stats par domaines
      if (user.assignedDomains) {
        user.assignedDomains.forEach(domain => {
          stats.byDomains[domain] = (stats.byDomains[domain] || 0) + 1;
        });
      }
    });

    return stats;
  };

  return {
    // Permissions
    canManageUsers: permissions.canManageUsers,
    canCreateUsers: permissions.canManageUsers,
    canDeleteUsers: permissions.canManageUsers,
    canViewUsers: permissions.canManageUsers,

    // Fonctions de gestion des rôles
    getManageableRoles,
    getAvailableDomains,
    getDefaultDomains,
    getRoleLabel,
    getRoleColor,

    // Fonctions d'actions utilisateur
    canPerformUserAction,

    // Fonctions de validation
    validateUserForm,
    prepareUserData,

    // Fonctions utilitaires
    getUserStats,

    // Informations sur l'utilisateur actuel
    currentUser,
    currentUserRole: currentUser?.role,
    isCurrentUserAdmin: permissions.isAdmin,
    isCurrentUserSuperAdmin: permissions.isSuperAdmin
  };
}