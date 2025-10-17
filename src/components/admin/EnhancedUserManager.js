// src/components/admin/EnhancedUserManager.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff,
  UserCheck,
  UserX,
  Key,
  Mail,
  Calendar,
  Activity,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import PermissionGuard from '@/components/admin/PermissionGuard';
import { useToast } from '@/components/ui/toast';
import { useSimpleNotification, NotificationContainer } from '@/components/ui/notification';
import { ROLES_HIERARCHY } from '@/lib/rbac';

export default function EnhancedUserManager() {
  const permissions = usePermission();
  const { execute, loading } = useApiAction();
  const { toast } = useToast();
  const { notifications, notify, removeNotification } = useSimpleNotification();
  
  // Fonction utilitaire pour afficher les notifications (plus de fallback en prod)
  const showNotification = (type, message, options = {}) => {
    toast[type](message, options);
  };

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [selected2FAUser, setSelected2FAUser] = useState(null);
  const [userSecurityInfo, setUserSecurityInfo] = useState({});


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Utiliser secureApi au lieu de fetch direct pour la sécurité
        const usersData = await secureApi.get('/api/users', true);
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
  showNotification('error', "Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
  setUsers([]);
  setFilteredUsers([]);
      }
    };

    execute(fetchUsers);
  }, [execute]);

  // Charger les informations de sécurité pour chaque utilisateur
  useEffect(() => {
    const loadAllSecurityInfo = async () => {
      for (const user of users) {
        await loadUserSecurityInfo(user._id || user.id);
      }
    };

    if (users.length > 0) {
      loadAllSecurityInfo();
    }
  }, [users]);

  // Fonction pour recharger les utilisateurs
  const reloadUsers = () => {
    const fetchUsers = async () => {
      try {
        const usersData = await secureApi.get('/api/users', true);
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
  showNotification('error', "Impossible de recharger les utilisateurs. Veuillez réessayer plus tard.");
  setUsers([]);
  setFilteredUsers([]);
      }
    };

    execute(fetchUsers);
  };

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = [...users];

    // Filtrer par rôle
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filtrer par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Filtrer par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-niger-orange text-white',
      editor: 'bg-niger-green text-white'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role === 'admin' ? 'Administrateur' : 'Éditeur'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'active' ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prev => [...prev, result.user]);
        setShowCreateModal(false);
        showNotification('success', 'Utilisateur créé avec succès');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
  showNotification('error', error.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  // Fonctions de gestion 2FA
  const loadUserSecurityInfo = async (userId) => {
    try {
      const response = await secureApi.get(`/api/admin/users/${userId}/security`, true);
      if (response.success) {
        setUserSecurityInfo(prev => ({
          ...prev,
          [userId]: response.data
        }));
      }
    } catch (error) {
  showNotification('error', error.message || 'Erreur lors du chargement des infos sécurité');
    }
  };

  const handle2FAToggle = async (userId, enable) => {
    if (!confirm(`${enable ? 'Activer' : 'Désactiver'} le 2FA pour cet utilisateur ?`)) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.post(`/api/admin/users/${userId}/2fa`, {
          action: enable ? 'enable' : 'disable'
        }, true);
        
        if (response.success) {
          await loadUserSecurityInfo(userId);
          showNotification('success', `2FA ${enable ? 'activé' : 'désactivé'} avec succès`);
        }
      });
    } catch (error) {
  showNotification('error', `Erreur: ${error.message}`);
    }
  };

  const handleResetUserSessions = async (userId) => {
    if (!confirm('Réinitialiser toutes les sessions de cet utilisateur ?')) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.post(`/api/admin/users/${userId}/sessions/reset`, {}, true);
        
        if (response.success) {
          showNotification('success', 'Sessions réinitialisées avec succès');
        }
      });
    } catch (error) {
  showNotification('error', `Erreur: ${error.message}`);
    }
  };

  const handleViewUserActivity = async (userId) => {
    try {
      const response = await secureApi.get(`/api/admin/users/${userId}/activity`, true);
      if (response.success) {
        // Ouvrir une modale avec l'activité de l'utilisateur
        setSelected2FAUser({
          ...users.find(u => u.id === userId),
          activity: response.data
        });
        setShow2FAModal(true);
      }
    } catch (error) {
  showNotification('error', `Erreur: ${error.message}`);
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user =>
          user._id === userId ? updatedUser : user
        ));
        setEditingUser(null);
        showNotification('success', 'Utilisateur modifié avec succès');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la modification');
      }
    } catch (error) {
  showNotification('error', error.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        showNotification('success', 'Utilisateur supprimé avec succès');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
  showNotification('error', error.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user._id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
        showNotification('success', `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
  showNotification('error', error.message || 'Erreur lors du changement de statut');
    }
  };

  const handleResetPassword = async (userId) => {
    // Fonctionnalité désactivée par sécurité - doit utiliser une modale dédiée
    showNotification('error', "La réinitialisation du mot de passe doit se faire via une modale sécurisée en production.");
  };

  const roleOptions = Object.entries(ROLES_HIERARCHY).map(([key, value]) => ({ value: key, label: value.label }));

  return (
    <PermissionGuard permission="canManageUsers">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-niger-orange/20 rounded-lg">
                <Users className="w-6 h-6 text-niger-orange" />
              </div>
              <div>
                <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  {users.length}
                </div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Total utilisateurs</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-niger-orange/20 rounded-lg">
                <Shield className="w-6 h-6 text-niger-orange" />
              </div>
              <div>
                <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Administrateurs</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-niger-green/20 rounded-lg">
                <Edit className="w-6 h-6 text-niger-green" />
              </div>
              <div>
                <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  {users.filter(u => u.role === 'editor').length}
                </div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Éditeurs</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Utilisateurs actifs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et actions */}
  <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Filtre par rôle */}
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Tous les rôles</option>
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Filtre par statut */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-readable-muted dark:text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 min-w-64 placeholder:text-readable-muted dark:placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel utilisateur</span>
            </button>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-niger-orange/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    2FA
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-niger-orange/10">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          user.role === 'admin' ? 'bg-niger-orange/20' : 'bg-niger-green/20'
                        }`}>
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-niger-orange" />
                          ) : (
                            <Edit className="w-5 h-5 text-niger-green" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-niger-green dark:text-niger-green-light">
                            {user.username}
                            {user.isFirstLogin && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Première connexion
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-readable-muted dark:text-muted-foreground flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {userSecurityInfo[user._id || user.id]?.twoFactorEnabled ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Activé</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Désactivé</span>
                          </div>
                        )}
                        <button
                          onClick={() => handle2FAToggle(
                            user._id || user.id, 
                            !userSecurityInfo[user._id || user.id]?.twoFactorEnabled
                          )}
                          className="p-1 text-niger-orange hover:bg-niger-orange/10 rounded transition-colors"
                          title={userSecurityInfo[user._id || user.id]?.twoFactorEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-readable-muted dark:text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString('fr-FR')
                          : 'Jamais connecté'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-niger-green hover:bg-niger-green/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user._id || user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                        >
                          {user.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleResetPassword(user._id || user.id)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResetUserSessions(user._id || user.id)}
                          className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Réinitialiser les sessions"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleViewUserActivity(user._id || user.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Voir l'activité"
                        >
                          <Activity className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user._id || user.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-readable-muted dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-readable-muted dark:text-muted-foreground">
                Aucun utilisateur ne correspond aux critères de filtrage sélectionnés.
              </p>
            </div>
          )}
        </div>

        {/* Modals pour création/édition d'utilisateurs */}
        {showCreateModal && (
          <UserModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
            title="Créer un nouvel utilisateur"
          />
        )}

        {editingUser && (
          <UserModal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            onSubmit={(data) => handleEditUser(editingUser._id || editingUser.id, data)}
            user={editingUser}
            title="Modifier l'utilisateur"
          />
        )}

        {/* Modale d'activité utilisateur */}
        {show2FAModal && selected2FAUser && (
          <UserActivityModal
            isOpen={show2FAModal}
            onClose={() => {
              setShow2FAModal(false);
              setSelected2FAUser(null);
            }}
            user={selected2FAUser}
          />
        )}

  {/* Conteneur de notifications de fallback (désactivé en production) */}
        <NotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </div>
    </PermissionGuard>
  );
}

// Composant modal pour créer/éditer un utilisateur
function UserModal({ isOpen, onClose, onSubmit, user = null, title }) {
  const { toast } = useToast();
  const { notify } = useSimpleNotification();
  
  // Fonction utilitaire pour afficher les notifications avec fallback
  const showNotification = (type, message, options = {}) => {
    try {
      toast[type](message, options);
    } catch (error) {
      console.warn('Toast system failed, using fallback:', error);
      notify[type](message, options);
    }
  };
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'editor',
    password: ''
  });

  // Import RBAC pour la liste des rôles - utilisation dynamique
  const roleOptions = React.useMemo(() => {
    try {
      // Utilisation des constantes par défaut sans import dynamique
      return [
        { value: 'SUPER_ADMIN', label: 'Super Administrateur' },
        { value: 'ADMIN', label: 'Administrateur' },
        { value: 'EDITOR', label: 'Éditeur' },
        { value: 'USER', label: 'Utilisateur' }
      ];
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      return [];
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email) {
      showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user && !formData.password) {
      showNotification('warning', 'Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-md w-full border border-niger-orange/10">
        <div className="p-6 border-b border-niger-orange/10">
          <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
            {title}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Rôle *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            >
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                required
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-niger-orange/20 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {user ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Composant modal pour afficher l'activité d'un utilisateur
function UserActivityModal({ isOpen, onClose, user }) {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadUserActivity();
    }
  }, [isOpen, user]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      // Utiliser les données déjà chargées ou charger depuis l'API
      if (user.activity) {
        setActivityData(user.activity);
      } else {
        const response = await secureApi.get(`/api/admin/users/${user._id || user.id}/activity`, true);
        if (response.success) {
          setActivityData(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement activité:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-niger-orange/20 rounded-lg">
              <Activity className="w-6 h-6 text-niger-orange" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
                Activité de {user.username}
              </h2>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">
                Historique des 30 derniers jours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-readable-muted hover:text-niger-orange rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-niger-orange border-t-transparent"></div>
              <span className="ml-3">Chargement de l'activité...</span>
            </div>
          ) : activityData ? (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-niger-cream/50 dark:bg-secondary-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {activityData.stats?.totalActions || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Actions totales
                  </div>
                </div>
                <div className="bg-niger-cream/50 dark:bg-secondary-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {activityData.stats?.levelStats?.success || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Succès
                  </div>
                </div>
                <div className="bg-niger-cream/50 dark:bg-secondary-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {activityData.stats?.levelStats?.warning || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Avertissements
                  </div>
                </div>
                <div className="bg-niger-cream/50 dark:bg-secondary-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {activityData.stats?.levelStats?.error || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Erreurs
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div>
                <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Activité récente
                </h3>
                <div className="space-y-3">
                  {activityData.recentActivity?.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-3 p-4 bg-niger-cream/30 dark:bg-secondary-700 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getLevelIcon(activity.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-niger-green dark:text-niger-green-light">
                            {activity.message}
                          </p>
                          <span className="text-xs text-readable-muted dark:text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-readable-muted dark:text-muted-foreground">
                          <span>Type: {activity.type}</span>
                          <span>IP: {activity.ip}</span>
                        </div>
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-niger-orange cursor-pointer">
                              Détails
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-100 dark:bg-secondary-600 p-2 rounded overflow-x-auto">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-readable-muted dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-2">
                Aucune activité trouvée
              </h3>
              <p className="text-readable-muted dark:text-muted-foreground">
                Aucune activité récente pour cet utilisateur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}