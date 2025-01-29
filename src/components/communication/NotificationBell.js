import { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds

    // Handle clicks outside the dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unread');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications');
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/mark-as-read/${id}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification); // Show detailed view
    if (!notification.isRead) {
      markAsRead(notification._id); // Mark as read
    }
  };

  // Get notification style based on type
  const getNotificationStyle = (type) => {
    const styles = {
      info: 'border-blue-100 bg-blue-50',
      success: 'border-green-100 bg-green-50',
      warning: 'border-yellow-100 bg-yellow-50',
      error: 'border-red-100 bg-red-50',
    };
    return styles[type] || styles.info;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconColors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    };
    return iconColors[type] || iconColors.info;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-50 rounded-full transition-all duration-300"
      >
        <Bell
          className={`w-6 h-6 transition-colors duration-300 ${
            unreadCount > 0 ? 'text-blue-600 animate-subtle-ring' : 'text-gray-600'
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center animate-subtle-fade">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown with Notifications */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-30 max-h-[400px] overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <div className="font-medium">Notifications</div>
            {unreadCount > 0 && (
              <div className="text-sm text-gray-500">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Aucune nouvelle notification
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 border-l-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${getNotificationStyle(
                  notif.type
                )}`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${getNotificationIcon(notif.type)}`}>
                    {notif.type === 'info' && <Info className="w-5 h-5" />}
                    {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    {notif.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detailed Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNotification.title}</h2>
              <p className="text-gray-700">{selectedNotification.message}</p>
              <div className="text-sm text-gray-500">
                {new Date(selectedNotification.createdAt).toLocaleString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}