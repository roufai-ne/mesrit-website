// components/admin/UserManager.js
import React, { useState, useEffect } from 'react';
import { ROLES_HIERARCHY } from '@/lib/rbac';
import { UserPlus, Edit, Trash, Key, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { secureApi } from '@/lib/secureApi';

export default function UserManager() {
  const { user: currentUser } = useAuth();
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
    status: 'active'
  });

  const fetchUsers = async () => {
    try {
      const data = await secureApi.get('/api/users', true);
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset form data when editing status changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username,
        email: editingUser.email,
        password: '', // On ne récupère jamais le mot de passe
        role: editingUser.role,
        status: editingUser.status
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'editor',
        status: 'active'
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Ne pas envoyer le mot de passe s'il n'a pas été modifié
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;

        const updatedUser = await secureApi.put(`/api/users/${editingUser._id}`, updateData, true);
        setUsers(users.map(user => user._id === editingUser._id ? updatedUser : user));
        setEditingUser(null);
      } else {
        const result = await secureApi.post('/api/users', formData, true);
        setUsers(prev => [...prev, result.user || result]);
        setShowAddForm(false);
      }

      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'editor',
        status: 'active'
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Ne pas permettre la suppression de son propre compte
    if (userId === currentUser?._id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await secureApi.delete(`/api/users/${userId}`, true);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Entrez le nouveau mot de passe:');
    if (!newPassword) return;

    try {
      await secureApi.put(`/api/users/${userId}`, { password: newPassword }, true);
      alert('Mot de passe mis à jour avec succès');
    } catch (error) {
      setError(error.message);
    }
  };

  const closeModal = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'editor',
      status: 'active'
    });
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Gestion des utilisateurs</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-secondary-800">
      <table className="min-w-full">
  <thead className="bg-gray-50 dark:bg-secondary-700">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-muted-foreground">Nom d'utilisateur</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-muted-foreground">Email</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-muted-foreground">Rôle</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-muted-foreground">Statut</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-muted-foreground">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 dark:divide-secondary-600">
    {users.map((user) => (
      <tr key={user._id}>
        <td className="px-6 py-4">{user.username}</td>
        <td className="px-6 py-4">{user.email}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            user.role === 'admin' 
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role === 'admin' ? 'Administrateur' : 'Éditeur'}
          </span>
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
            <button 
              onClick={() => setEditingUser(user)}
              className="text-niger-orange dark:text-niger-orange"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeleteUser(user._id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleResetPassword(user._id)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>

      {/* Modal Form */}
      {(showAddForm || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto dark:bg-secondary-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-niger-green-light dark:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-niger-orange/20 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:border-niger-orange duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:border-niger-orange transition-colors duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
                  {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas modifier)' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:border-niger-orange transition-colors duration-300"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:border-niger-orange transition-colors duration-300"
                  required
                >
                  {Object.entries(ROLES_HIERARCHY).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:border-niger-orange transition-colors duration-300"
                  required
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors dark:bg-secondary-700 dark:border-secondary-600 dark:hover:bg-secondary-700/50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {editingUser ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}