"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle, Error as ErrorIcon, Warning, Info, Close } from "@mui/icons-material";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    warning: (msg: string) => addToast("warning", msg),
    info: (msg: string) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container floating element */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => {
          let icon = <Info className="w-5 h-5 text-blue-500" />;
          let borderClass = "border-blue-500/20";
          if (t.type === "success") {
            icon = <CheckCircle className="w-5 h-5 text-primary-teal" />;
            borderClass = "border-primary-teal/20";
          } else if (t.type === "error") {
            icon = <ErrorIcon className="w-5 h-5 text-red-500" />;
            borderClass = "border-red-500/20";
          } else if (t.type === "warning") {
            icon = <Warning className="w-5 h-5 text-amber-500" />;
            borderClass = "border-amber-500/20";
          }

          return (
            <div
              key={t.id}
              className={`
                flex items-center gap-3 p-4 rounded-lg shadow-2xl border
                bg-white  text-zinc-900 
                transition-all duration-300 transform translate-y-0 scale-100
                animate-fade-in
                ${borderClass}
              `}
            >
              <div className="shrink-0">{icon}</div>
              <div className="flex-1 text-xs font-semibold tracking-wide uppercase text-left">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-zinc-400 hover:text-zinc-600  transition-colors"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
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
