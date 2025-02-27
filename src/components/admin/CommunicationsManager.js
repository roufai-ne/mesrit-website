// src/pages/admin/communications.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [activeTab, setActiveTab] = useState('alerts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);
  

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
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

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
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          {activeTab === 'alerts' ? (
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          ) : (
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {items.map((alert) => (
          <tr key={alert._id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.priority === 'high' ? 'Haute' :
                 alert.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{alert.title}</div>
              <div className="text-sm text-gray-500">{alert.description}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              <div>Du: {new Date(alert.startDate).toLocaleDateString('fr-FR')}</div>
              <div>Au: {new Date(alert.endDate).toLocaleDateString('fr-FR')}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                alert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {alert.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(alert)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderEventsTable = () => (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {items.map((event) => (
          <tr key={event._id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">
                {new Date(event.date).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-sm text-gray-500">{event.time}</div>
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{event.title}</div>
              <div className="text-sm text-gray-500">{event.description}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
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
                <button
                  onClick={() => handleEdit(event)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash className="w-5 h-5" />
                </button>
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
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isAlert ? (
          // Champs spécifiques aux alertes
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de début</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de fin</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        ) : (
          // Champs spécifiques aux événements
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Participants</label>
              <input
                type="text"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alertes
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Événements
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {activeTab === 'alerts' ? 'Nouvelle alerte' : 'Nouvel événement'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {renderTable()}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingItem 
                  ? `Modifier ${activeTab === 'alerts' ? 'l\'alerte' : 'l\'événement'}`
                  : `Nouv${activeTab === 'alerts' ? 'elle alerte' : 'el événement'}`}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
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
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}