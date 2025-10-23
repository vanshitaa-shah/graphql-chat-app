import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { TOAST_CONFIG } from '../constants';
import type { ToastType } from '../constants';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global toast function that can be called from anywhere
let globalAddToast: ((message: string, type: Toast['type']) => void) | null = null;

export const showGlobalToast = (message: string, type: Toast['type']) => {
  if (globalAddToast) {
    globalAddToast(message, type);
  } else {
    // Fallback to console if toast system isn't ready
    console.warn(`Toast: [${type.toUpperCase()}] ${message}`);
  }
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastDuration = duration || TOAST_CONFIG.DEFAULT_DURATION;
    const newToast: Toast = { 
      id, 
      message, 
      type, 
      duration: toastDuration 
    };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit max toasts
      return updated.length > TOAST_CONFIG.MAX_TOASTS 
        ? updated.slice(-TOAST_CONFIG.MAX_TOASTS) 
        : updated;
    });

    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, toastDuration);
  }, [removeToast]);
  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = "flex items-center justify-between min-w-80 p-4 bg-white rounded-xl shadow-lg border-l-4 animate-slide-in cursor-pointer transform transition-all duration-300 hover:scale-[1.02]";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-success-500 bg-success-50 text-success-700`;
      case 'error':
        return `${baseStyles} border-l-error-500 bg-error-50 text-error-700`;
      case 'warning':
        return `${baseStyles} border-l-warning-500 bg-warning-50 text-warning-700`;
      case 'info':
        return `${baseStyles} border-l-primary-500 bg-primary-50 text-primary-700`;
      default:
        return baseStyles;
    }
  };

  const getIcon = (type: ToastType) => {
    const iconMap = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
    };
    return iconMap[type] || <Info className="w-5 h-5" />;
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type)}
          onClick={() => onRemove(toast.id)}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg">
              {getIcon(toast.type)}
            </span>
            <span className="font-medium text-sm">
              {toast.message}
            </span>
          </div>
          <button
            className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl font-bold p-1"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(toast.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
