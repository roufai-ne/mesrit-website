import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';

const NotificationForm = ({ notification, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    message: notification?.message || '',
    type: notification?.type || 'info',
    recipients: notification?.recipients || 'all',
    status: notification?.status || 'draft',
    scheduledFor: notification?.scheduledFor ? new Date(notification.scheduledFor).toISOString().split('T')[0] : '',
    recipientEmails: notification?.recipientEmails || ''
  });

 return (
   <form onSubmit={(e) => {
     e.preventDefault();
     onSubmit(formData);
   }} className="space-y-4">
     <div>
       <label className="block font-medium mb-1">Titre</label>
       <input
         value={formData.title}
         onChange={e => setFormData({...formData, title: e.target.value})}
         className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
         required
       />
     </div>

     <div>
       <label className="block font-medium mb-1">Message</label>
       <textarea
         value={formData.message}
         onChange={e => setFormData({...formData, message: e.target.value})}
         className="w-full p-2 border rounded min-h-[100px] border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
         required
       />
     </div>

     <div className="grid grid-cols-2 gap-4">
       <div>
         <label className="block font-medium mb-1">Type</label>
         <select
           value={formData.type}
           onChange={e => setFormData({...formData, type: e.target.value})}
           className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
         >
           <option value="info">Information</option>
           <option value="success">Succès</option>
           <option value="warning">Avertissement</option>
           <option value="error">Erreur</option>
         </select>
       </div>

       <div>
         <label className="block font-medium mb-1">Destinataires</label>
         <select
           value={formData.recipients}
           onChange={e => setFormData({...formData, recipients: e.target.value})}
           className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
         >
           <option value="all">Tous</option>
           <option value="roles">Par rôle</option>
           <option value="specific">Spécifiques</option>
         </select>
       </div>
     </div>

     {formData.recipients === 'specific' && (
       <div>
         <label className="block font-medium mb-1">Emails (séparés par des virgules)</label>
         <input
           value={formData.recipientEmails}
           onChange={e => setFormData({...formData, recipientEmails: e.target.value})}
           className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
           placeholder="email1@exemple.com, email2@exemple.com"
         />
       </div>
     )}

     <div>
       <label className="block font-medium mb-1">Date d'envoi (optionnel)</label>
       <input
         type="datetime-local"
         value={formData.scheduledFor}
         onChange={e => setFormData({...formData, scheduledFor: e.target.value})}
         className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
       />
     </div>
     <div>
        <label className="block font-medium mb-1">Statut</label>
        <select
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value})}
          className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
        >
          <option value="draft">Brouillon</option>
          <option value="scheduled">Planifié</option>
          <option value="sent">Envoyer maintenant</option>
        </select>
      </div>

     <div className="flex justify-end gap-2 pt-4">
       <button
         type="button"
         onClick={onClose}
         className="px-4 py-2 border rounded hover:bg-gray-50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
       >
         Annuler
       </button>
       <button
         type="submit"
         className="px-4 py-2 text-white rounded bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
       >
         Envoyer
       </button>
     </div>
   </form>
 );
};



export default function NotificationManager() {
  const { user } = useAuth();
  const permissions = usePermission();
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Permissions RBAC pour les notifications
  const canCreateNotification = permissions.canManageNotifications;
  const canEditAllNotifications = permissions.isContentAdmin || permissions.isAdmin;
  const canEditOwnNotification = permissions.canManageNotifications;
  const canDeleteNotification = permissions.isContentAdmin || permissions.isAdmin;

  // Vérifie si l'utilisateur peut éditer une notification spécifique
  const canEditNotification = (notif) => {
    if (canEditAllNotifications) return true;
    if (canEditOwnNotification && notif.createdBy === user?._id) return true;
    return false;
  };

  // Vérifie si l'utilisateur peut supprimer une notification spécifique
  const canDeleteNotificationItem = (notif) => {
    if (canDeleteNotification) return true;
    return false;
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Voulez-vous vraiment supprimer cette notification ?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      toast.success('Notification supprimée');
      fetchNotifications();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const method = selectedNotification ? 'PUT' : 'POST';
      const url = selectedNotification 
        ? `/api/notifications/${selectedNotification._id}`
        : '/api/notifications';

      if (formData.status === 'sent') {
        formData.sentAt = new Date();
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi');

      toast.success(selectedNotification ? 'Notification modifiée' : 'Notification créée');
      setSelectedNotification(null);
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Notifications</h2>
        {canCreateNotification && (
          <button 
            onClick={() => {
              setSelectedNotification(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
          >
            <Bell className="w-4 h-4" />
            Nouvelle Notification
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        >
          <option value="all">Tous les types</option>
          <option value="info">Information</option>
          <option value="success">Succès</option>
          <option value="warning">Avertissement</option>
          <option value="error">Erreur</option>
        </select>
      </div>

      <div className="space-y-4">
        {Array.isArray(notifications) && notifications
          .filter(notif => {
            const matchesSearch = 
              notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              notif.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || notif.type === typeFilter;
            return matchesSearch && matchesType;
          })
          .map(notif => (
            <div key={notif._id} className="bg-white p-4 rounded-lg shadow border dark:bg-secondary-800">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  {
                    info: 'bg-blue-100 text-blue-600',
                    success: 'bg-green-100 text-green-600',
                    warning: 'bg-yellow-100 text-yellow-600',
                    error: 'bg-red-100 text-red-600'
                  }[notif.type]
                }`}>
                  {notif.type === 'info' && <Info className="w-5 h-5" />}
                  {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {notif.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold mb-2">{notif.title}</h3>
                  <p className="text-gray-600 mb-3 dark:text-muted-foreground">{notif.message}</p>
                  
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-muted-foreground">
                    <span>Destinataires: {notif.recipients}</span>
                    <span>•</span>
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded ${
                      notif.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notif.status}
                    </span>
                    <div className="flex gap-2">
                      {canEditNotification(notif) && (
                        <button
                          onClick={() => {
                            setSelectedNotification(notif);
                            setShowForm(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded dark:bg-secondary-700 dark:hover:bg-secondary-700/50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteNotificationItem(notif) && (
                        <button
                          onClick={() => handleDelete(notif._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full dark:bg-secondary-800">
            <h3 className="text-xl font-bold mb-4 text-niger-green dark:text-niger-green-light">
              {selectedNotification ? 'Modifier la notification' : 'Nouvelle notification'}
            </h3>
            <NotificationForm
              notification={selectedNotification}
              onSubmit={handleSubmit}
              onClose={() => {
                setShowForm(false);
                setSelectedNotification(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}