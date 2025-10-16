// src/pages/admin/communications.js
import React, { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secureApi';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermissionRBAC';
import { 
  Bell, 
  Calendar,
  Plus, 
  Edit, 
  Trash, 
  MapPin,
  Users,
  X,
  Loader2 
} from 'lucide-react';

export default function CommunicationsManager() {
  const { user } = useAuth();
  const permissions = usePermission();
  const [activeTab, setActiveTab] = useState('alerts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);

  // Permissions RBAC granulaires pour les communications
  const canCreateCommunications = permissions.canManageCommunications;
  const canEditOwnCommunications = permissions.canManageCommunications;
  const canEditAllCommunications = permissions.isContentAdmin || permissions.isAdmin;
  const canDeleteCommunications = permissions.isContentAdmin || permissions.isAdmin;
  const canPublishCommunications = permissions.isContentAdmin || permissions.isAdmin;

  // Fonction pour vérifier si l'utilisateur peut éditer une communication spécifique
  const canEditCommunication = (communication) => {
    if (canEditAllCommunications) return true;
    if (canEditOwnCommunications && communication.createdBy === user?._id) return true;
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut supprimer une communication spécifique
  const canDeleteCommunication = (communication) => {
    if (canDeleteCommunications) return true;
    return false;
  };
  

  const alertInitialState = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  const eventInitialState = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    participants: '',
    status: 'upcoming'
  };

  const [formData, setFormData] = useState(alertInitialState);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'alerts' ? '/api/alerts' : '/api/events';
      const data = await secureApi.get(endpoint, true);
      const formattedData = Array.isArray(data) ? data : [];
      
      if (activeTab === 'events') {
        formattedData.forEach(event => {
          if (event.date && !(event.date instanceof Date)) {
            event.date = new Date(event.date);
          }
        });
      }
      
      setItems(formattedData);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(
        `Erreur lors du chargement des ${activeTab === 'alerts' ? 'alertes' : 'événements'}: ${error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // Retirer showNotification des dépendances

  // UseEffect pour le fetch initial et les changements d'onglet
  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(activeTab === 'alerts' ? alertInitialState : eventInitialState);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item._id);
    if (activeTab === 'alerts') {
      setFormData({
        ...item,
        startDate: new Date(item.startDate).toISOString().split('T')[0],
        endDate: new Date(item.endDate).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...item,
        date: new Date(item.date).toISOString().split('T')[0]
      });
    }
    setShowForm(true);
  };

  const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  };

  // Mise à jour de handleSubmit pour la validation des données
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Valider les données avant l'envoi
      if (activeTab === 'events') {
        if (!isValidDate(formData.date)) {
          throw new Error('Date invalide');
        }
        if (!formData.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
          throw new Error('Format d\'heure invalide');
        }
      }

      const endpoint = activeTab === 'alerts' ? 'alerts' : 'events';
      const url = editingItem 
        ? `/api/${endpoint}/${editingItem}` 
        : `/api/${endpoint}`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = editingItem 
        ? await secureApi.put(url, formData, true)
        : await secureApi.post(url, formData, true);

      showNotification(
        editingItem ? 
          `${activeTab === 'alerts' ? 'Alerte' : 'Événement'} mis(e) à jour avec succès` : 
          `${activeTab === 'alerts' ? 'Alerte' : 'Événement'} créé(e) avec succès`
      );
      
      setShowForm(false);
      fetchItems(); // Rafraîchir la liste après la création/modification
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet(te) ${activeTab === 'alerts' ? 'alerte' : 'événement'} ?`)) return;

    try {
      const endpoint = activeTab === 'alerts' ? 'alerts' : 'events';
      await secureApi.delete(`/api/${endpoint}/${id}`, true);

      showNotification(`${activeTab === 'alerts' ? 'Alerte' : 'Événement'} supprimé(e) avec succès`);
      fetchItems();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="p-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-niger-orange" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="p-8 text-center text-readable-muted dark:text-muted-foreground">
          {activeTab === 'alerts' ? (
            <Bell className="w-12 h-12 mx-auto mb-4 text-niger-orange" />
          ) : (
            <Calendar className="w-12 h-12 mx-auto mb-4 text-niger-orange" />
          )}
          <p>Aucun élément pour le moment</p>
        </div>
      );
    }

    return activeTab === 'alerts' ? renderAlertsTable() : renderEventsTable();
  };

  // ... suite du composant CommunicationsManager

  const renderAlertsTable = () => (
    <table className="w-full">
      <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Priorité</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Titre</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Dates</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Statut</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-niger-orange/10">
        {items.map((alert) => (
          <tr key={alert._id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                alert.priority === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400' :
                alert.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400' :
                'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
              }`}>
                {alert.priority === 'high' ? 'Haute' :
                 alert.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-niger-green dark:text-niger-green-light">{alert.title}</div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">{alert.description}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-muted-foreground">
              <div>Du: {new Date(alert.startDate).toLocaleDateString('fr-FR')}</div>
              <div>Au: {new Date(alert.endDate).toLocaleDateString('fr-FR')}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                alert.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {alert.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex space-x-3">
                {canEditCommunication(alert) && (
                  <button
                    onClick={() => handleEdit(alert)}
                    className="text-niger-green dark:text-niger-green-light hover:text-niger-orange transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {canDeleteCommunication(alert) && (
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderEventsTable = () => (
    <table className="w-full">
      <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Date/Heure</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Événement</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Lieu</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Statut</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-niger-orange/10">
        {items.map((event) => (
          <tr key={event._id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="font-medium text-niger-green dark:text-niger-green-light">
                {new Date(event.date).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">{event.time}</div>
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-niger-green dark:text-niger-green-light">{event.title}</div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">{event.description}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              {event.participants && (
                <div className="flex items-center mt-1">
                  <Users className="w-4 h-4 mr-2" />
                  {event.participants}
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status === 'upcoming' ? 'À venir' :
                 event.status === 'ongoing' ? 'En cours' : 'Terminé'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex space-x-3">
                {canEditCommunication(event) && (
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-niger-green dark:text-niger-green-light hover:text-niger-orange transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {canDeleteCommunication(event) && (
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderForm = () => {
    const isAlert = activeTab === 'alerts';
    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Titre</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>

        {isAlert ? (
          // Champs spécifiques aux alertes
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Date de début</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Date de fin</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                />
              </div>
            </div>
          </>
        ) : (
          // Champs spécifiques aux événements
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Heure</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Lieu</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Participants</label>
              <input
                type="text"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-niger-orange/20 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            {editingItem ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white'
                : 'bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/20 transition-colors'
            }`}
          >
            Alertes
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white'
                : 'bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/20 transition-colors'
            }`}
          >
            Événements
          </button>
        </div>
        {canCreateCommunications && (
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            {activeTab === 'alerts' ? 'Nouvelle alerte' : 'Nouvel événement'}
          </button>
        )}
      </div>

    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-niger-orange/10 overflow-hidden transition-colors duration-300">
        {renderTable()}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl border border-niger-orange/10 w-full max-w-2xl mx-4 transition-colors duration-300">
            <div className="flex justify-between items-center p-6 border-b border-niger-orange/10">
              <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                {editingItem 
                  ? `Modifier ${activeTab === 'alerts' ? 'l\'alerte' : 'l\'événement'}`
                  : `Nouv${activeTab === 'alerts' ? 'elle alerte' : 'el événement'}`}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-readable-muted dark:text-muted-foreground hover:text-niger-orange transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderForm()}
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 dark:bg-green-600' 
            : 'bg-red-500 dark:bg-red-600'
        } text-white z-50`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}