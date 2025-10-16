// src/components/ui/toast.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      ...toast,
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Helper functions for different toast types
  const toast = {
    success: (message, options = {}) => addToast({ 
      type: 'success', 
      message, 
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: 'error', 
      message, 
      duration: 0, // Don't auto-dismiss errors
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: 'warning', 
      message, 
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: 'info', 
      message, 
      ...options 
    }),
    loading: (message, options = {}) => addToast({ 
      type: 'loading', 
      message, 
      duration: 0, // Don't auto-dismiss loading toasts
      ...options 
    }),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        toast,
        addToast,
        removeToast,
        removeAllToasts,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Component
const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    const iconProps = { className: 'w-5 h-5 flex-shrink-0' };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-success-600" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-error-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 text-warning-600" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-info-600" />;
      case 'loading':
        return (
          <div className="w-5 h-5 flex-shrink-0">
            <div className="w-4 h-4 border-2 border-niger-orange border-t-transparent rounded-full animate-spin" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-success-600 bg-success-50 dark:bg-success-900/20 text-success-900 dark:text-success-100`;
      case 'error':
        return `${baseStyles} border-error-600 bg-error-50 dark:bg-error-900/20 text-error-900 dark:text-error-100`;
      case 'warning':
        return `${baseStyles} border-warning-600 bg-warning-50 dark:bg-warning-900/20 text-warning-900 dark:text-warning-100`;
      case 'info':
        return `${baseStyles} border-info-600 bg-info-50 dark:bg-info-900/20 text-info-900 dark:text-info-100`;
      case 'loading':
        return `${baseStyles} border-niger-orange bg-niger-cream dark:bg-secondary-800 text-niger-green dark:text-niger-green-light`;
      default:
        return `${baseStyles} border-secondary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100`;
    }
  };

  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-medium rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform',
        getStyles(),
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          {getIcon()}
          
          <div className="ml-3 flex-1">
            {toast.title && (
              <h4 className="text-sm font-medium mb-1">
                {toast.title}
              </h4>
            )}
            <p className="text-sm">
              {toast.message}
            </p>
            {toast.description && (
              <p className="text-xs mt-1 opacity-80">
                {toast.description}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleClose}
            className="ml-3 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-niger-orange transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[1080] space-y-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };