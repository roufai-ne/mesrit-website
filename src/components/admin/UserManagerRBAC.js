// components/admin/UserManagerRBAC.js - Version RBAC
import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash, Key, X, Shield, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermissionRBAC';
import { useUserManagement } from '@/hooks/useUserManagement';
import { secureApi } from '@/lib/secureApi';

export default function UserManagerRBAC() {
  const { user: currentUser } = useAuth();
  const permissions = usePermission();
  const userManagement = useUserManagement();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'editor',
    status: 'active',
    assignedDomains: ['news', 'documents']
  });

  // Vérifier les permissions d'accès (flag utilisé pour le rendu)
  const noAccess = !permissions.canManageUsers;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/users', true);
      setUsers(data);
      setError('');
    } catch (error) {
      setError(error.message);
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Obtenir les rôles que l'utilisateur peut gérer
  const getManageableRoles = () => {
    return userManagement.getManageableRoles();
  };

  // Obtenir les domaines disponibles selon le rôle
  const getAvailableDomains = (role) => {
    return userManagement.getAvailableDomains(role);
  };

  // Obtenir les domaines par défaut selon le rôle
  const getDefaultDomains = (role) => {
    return userManagement.getDefaultDomains(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider les données
    const validation = userManagement.validateUserForm(formData, !!editingUser);
    if (!validation.isValid) {
      setError(`Erreurs de validation: ${Object.values(validation.errors).join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Préparer les données pour l'API
      const userData = userManagement.prepareUserData(formData, !!editingUser);

      if (editingUser) {
        // Modification d'utilisateur
        const updatedUser = await secureApi.put(`/api/users/${editingUser._id}`, userData, true);
        setUsers(users.map(user => user._id === editingUser._id ? updatedUser : user));
        setEditingUser(null);
      } else {
        // Création d'utilisateur
        const result = await secureApi.post('/api/users', userData, true);
        setUsers(prev => [...prev, result.user]);
        setShowAddForm(false);
      }

      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'editor',
        status: 'active',
        assignedDomains: ['news', 'documents']
      });

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Ne pas récupérer le mot de passe
      role: user.role,
      status: user.status,
      assignedDomains: user.assignedDomains || getDefaultDomains(user.role)
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await secureApi.delete(`/api/users/${userId}`, true);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) return;

    try {
      await secureApi.post(`/api/users/${userId}/reset-password`, {}, true);
      alert('Mot de passe réinitialisé avec succès');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      assignedDomains: getDefaultDomains(newRole)
    }));
  };

  const handleDomainToggle = (domain) => {
    setFormData(prev => ({
      ...prev,
      assignedDomains: prev.assignedDomains.includes(domain)
        ? prev.assignedDomains.filter(d => d !== domain)
        : [...prev.assignedDomains, domain]
    }));
  };

  const getRoleLabel = (role) => {
    return userManagement.getRoleLabel(role);
  };

  const getRoleColor = (role) => {
    return userManagement.getRoleColor(role);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (noAccess) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Accès refusé</h3>
            <p className="text-red-600">Vous n'avez pas les permissions pour gérer les utilisateurs.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
          <p className="text-gray-600 mt-1">
            Gérez les utilisateurs et leurs permissions ({users.length} utilisateur{users.length > 1 ? 's' : ''})
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingUser(null);
            setFormData({
              username: '',
              email: '',
              password: '',
              role: 'editor',
              status: 'active',
              assignedDomains: ['news', 'documents']
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Erreurs */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Informations sur les permissions actuelles */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-medium text-blue-900">Vos permissions actuelles</span>
        </div>
        <div className="text-sm text-blue-700">
          <p>Rôle: <span className="font-semibold">{getRoleLabel(currentUser?.role)}</span></p>
          <p>Vous pouvez gérer les rôles: {getManageableRoles().map(getRoleLabel).join(', ') || 'Aucun'}</p>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaines</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      {user.isFirstLogin && (
                        <div className="text-xs text-yellow-600">Première connexion</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(user.assignedDomains || []).map(domain => (
                      <span key={domain} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {userManagement.canPerformUserAction('edit', user) && (
                      <>
                        <button 
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {userManagement.canPerformUserAction('delete', user) && (
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                        {userManagement.canPerformUserAction('reset_password', user) && (
                          <button 
                            onClick={() => handleResetPassword(user._id)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Réinitialiser le mot de passe"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {!userManagement.canPerformUserAction('edit', user) && (
                      <span className="flex items-center text-gray-400 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Lecture seule
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas modifier)' : 'Mot de passe'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {getManageableRoles().map(role => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Domaines assignés</label>
                  <div className="space-y-2">
                    {getAvailableDomains(formData.role).map(domain => (
                      <label key={domain} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedDomains.includes(domain)}
                          onChange={() => handleDomainToggle(domain)}
                          className="mr-2"
                        />
                        <span className="text-sm">{domain}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'En cours...' : (editingUser ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}