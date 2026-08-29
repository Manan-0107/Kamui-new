'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '@/lib/types';

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="kamui-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`kamui-toast ${toast.type}`}>
            <span className="kamui-toast-icon">✦</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
