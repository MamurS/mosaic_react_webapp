import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
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
export const ToastProvider = ({ children, maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      dismissible: true,
      ...toast,
      createdAt: Date.now()
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit number of toasts
      return updatedToasts.slice(0, maxToasts);
    });

    // Auto dismiss if duration is set
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({
      type: 'loading',
      message,
      duration: 0, // Don't auto-dismiss loading toasts
      dismissible: false,
      ...options
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      role="region"
      aria-label="Уведомления"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (!toast.dismissible) return;
    
    setIsLeaving(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  // Get toast styling based on type
  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm w-full transition-all duration-300 ease-in-out transform";
    
    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      loading: "bg-gray-50 border-gray-200 text-gray-800"
    };

    const visibilityStyles = isLeaving 
      ? "opacity-0 scale-95 translate-x-full" 
      : isVisible 
        ? "opacity-100 scale-100 translate-x-0" 
        : "opacity-0 scale-95 translate-x-full";

    return `${baseStyles} ${typeStyles[toast.type]} ${visibilityStyles}`;
  };

  // Get icon based on toast type
  const getIcon = () => {
    const iconProps = { size: 20, className: "flex-shrink-0 mt-0.5" };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="flex-shrink-0 mt-0.5 text-green-600" />;
      case 'error':
        return <AlertCircle {...iconProps} className="flex-shrink-0 mt-0.5 text-red-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="flex-shrink-0 mt-0.5 text-yellow-600" />;
      case 'info':
        return <Info {...iconProps} className="flex-shrink-0 mt-0.5 text-blue-600" />;
      case 'loading':
        return (
          <div className="flex-shrink-0 mt-1">
            <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
          </div>
        );
      default:
        return <Info {...iconProps} className="flex-shrink-0 mt-0.5 text-blue-600" />;
    }
  };

  // Progress bar for timed toasts
  const ProgressBar = () => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
      if (toast.duration <= 0) return;

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, toast.duration - elapsed);
        const newProgress = (remaining / toast.duration) * 100;
        
        setProgress(newProgress);
        
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }, [toast.duration]);

    if (toast.duration <= 0) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-current opacity-30 transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div 
      className={getToastStyles()}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      {getIcon()}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">
            {toast.title}
          </div>
        )}
        <div className="text-sm leading-relaxed">
          {toast.message}
        </div>
        {toast.description && (
          <div className="text-xs mt-1 opacity-80">
            {toast.description}
          </div>
        )}
        
        {/* Action Buttons */}
        {toast.actions && (
          <div className="flex gap-2 mt-3">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick?.();
                  if (action.dismiss !== false) {
                    handleDismiss();
                  }
                }}
                className="text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 rounded"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Dismiss Button */}
      {toast.dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 transition-colors"
          aria-label="Закрыть уведомление"
        >
          <X size={16} />
        </button>
      )}
      
      {/* Progress Bar */}
      <ProgressBar />
    </div>
  );
};

// Toast Hook with Shortcuts
export const useToastShortcuts = () => {
  const toast = useToast();

  return {
    ...toast,
    
    // Specific business context toasts
    clientCreated: (clientName) => 
      toast.success(`Клиент "${clientName}" успешно создан`),
      
    clientUpdated: (clientName) => 
      toast.success(`Информация о клиенте "${clientName}" обновлена`),
      
    policyCreated: (policyNumber) => 
      toast.success(`Полис №${policyNumber} успешно создан`),
      
    policyUpdated: (policyNumber) => 
      toast.success(`Полис №${policyNumber} обновлен`),
      
    dataExported: (type) => 
      toast.success(`${type} экспортированы`, {
        description: 'Файл готов к загрузке'
      }),
      
    saveError: (message = 'Не удалось сохранить данные') => 
      toast.error(message, {
        actions: [
          {
            label: 'Повторить',
            onClick: () => window.location.reload()
          }
        ]
      }),
      
    networkError: () => 
      toast.error('Ошибка сети', {
        description: 'Проверьте подключение к интернету',
        actions: [
          {
            label: 'Повторить',
            onClick: () => window.location.reload()
          }
        ]
      }),
      
    sessionExpired: () => 
      toast.warning('Сессия истекла', {
        description: 'Пожалуйста, войдите в систему заново',
        duration: 0,
        actions: [
          {
            label: 'Войти',
            onClick: () => window.location.href = '/login'
          }
        ]
      }),
      
    uploadProgress: (filename, progress) => 
      toast.loading(`Загрузка ${filename}... ${progress}%`, {
        description: progress < 100 ? 'Пожалуйста, подождите' : 'Завершение...'
      }),
      
    permissionDenied: () => 
      toast.error('Недостаточно прав', {
        description: 'Обратитесь к администратору'
      })
  };
};

// Standalone Toast Functions (for use without context)
let toastContainer = null;

const createToastContainer = () => {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
  toastContainer.setAttribute('role', 'region');
  toastContainer.setAttribute('aria-label', 'Уведомления');
  toastContainer.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastContainer);
  
  return toastContainer;
};

export const showToast = (message, type = 'info', options = {}) => {
  const container = createToastContainer();
  const toastElement = document.createElement('div');
  const id = Math.random().toString(36).substr(2, 9);
  
  const toast = {
    id,
    type,
    message,
    duration: 5000,
    dismissible: true,
    ...options
  };
  
  // Create toast HTML
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'loading': return '⏳';
      default: return 'ℹ️';
    }
  };
  
  const getStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm w-full transition-all duration-300 ease-in-out transform";
    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      loading: "bg-gray-50 border-gray-200 text-gray-800"
    };
    return `${baseStyles} ${typeStyles[type]} opacity-0 scale-95 translate-x-full`;
  };
  
  toastElement.className = getStyles();
  toastElement.innerHTML = `
    <span style="font-size: 20px; margin-top: 2px;">${getIcon()}</span>
    <div class="flex-1 min-w-0">
      <div class="text-sm leading-relaxed">${message}</div>
    </div>
    ${toast.dismissible ? `
      <button onclick="this.parentElement.remove()" class="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10">
        ✕
      </button>
    ` : ''}
  `;
  
  container.appendChild(toastElement);
  
  // Animate in
  setTimeout(() => {
    toastElement.className = toastElement.className.replace('opacity-0 scale-95 translate-x-full', 'opacity-100 scale-100 translate-x-0');
  }, 10);
  
  // Auto remove
  if (toast.duration > 0) {
    setTimeout(() => {
      if (toastElement.parentElement) {
        toastElement.className = toastElement.className.replace('opacity-100 scale-100 translate-x-0', 'opacity-0 scale-95 translate-x-full');
        setTimeout(() => toastElement.remove(), 300);
      }
    }, toast.duration);
  }
  
  return id;
};

// Standalone shortcuts
export const showSuccess = (message, options) => showToast(message, 'success', options);
export const showError = (message, options) => showToast(message, 'error', options);
export const showWarning = (message, options) => showToast(message, 'warning', options);
export const showInfo = (message, options) => showToast(message, 'info', options);
export const showLoading = (message, options) => showToast(message, 'loading', { duration: 0, ...options });

export default Toast;