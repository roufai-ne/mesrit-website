// src/components/ui/notification.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Composant de notification simple et fiable
export const Notification = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  duration = 5000,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-info-600" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4 bg-white dark:bg-secondary-800 shadow-lg';
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-success-600`;
      case 'error':
        return `${baseStyles} border-error-600`;
      case 'warning':
        return `${baseStyles} border-warning-600`;
      case 'info':
      default:
        return `${baseStyles} border-info-600`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${getStyles()}
        rounded-lg p-4 mb-3 transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            {message}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleClose}
          className="ml-3 flex-shrink-0 rounded-md p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-niger-orange transition-colors"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
        </button>
      </div>
    </div>
  );
};

// Hook simple pour gérer les notifications
export const useSimpleNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = { id, ...notification };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const notify = {
    success: (message, options = {}) => addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) => addNotification({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addNotification({ type: 'info', message, ...options }),
  };

  return {
    notifications,
    notify,
    removeNotification,
    clearAll
  };
};

// Conteneur de notifications
export const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[1080] space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};