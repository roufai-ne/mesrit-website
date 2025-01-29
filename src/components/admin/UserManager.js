// components/admin/UserManager.js
import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash, Key, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
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

        const response = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        
        const updatedUser = await response.json();
        setUsers(users.map(user => user._id === editingUser._id ? updatedUser : user));
        setEditingUser(null);
      } else {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Erreur lors de la création');
        
        const result = await response.json();
        setUsers(prev => [...prev, result.user]);
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
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Entrez le nouveau mot de passe:');
    if (!newPassword) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du mot de passe');
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
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom d'utilisateur</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
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
              className="text-blue-600 hover:text-blue-800"
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
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="editor">Éditeur</option>
                  <option value="admin">Administrateur</option>
                </select>
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

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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