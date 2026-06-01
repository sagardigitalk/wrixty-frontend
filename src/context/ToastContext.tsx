"use client";

import React, { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastMethods = {
    success: (msg: string) => toast.success(msg, {
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #0F766E20',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#0F766E',
        secondary: '#fff',
      },
    }),
    error: (msg: string) => toast.error(msg, {
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #ef444420',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    }),
    warning: (msg: string) => toast(msg, {
      icon: '⚠️',
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #f59e0b20',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    }),
    info: (msg: string) => toast(msg, {
      icon: 'ℹ️',
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #3b82f620',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    }),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
};
