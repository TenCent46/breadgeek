"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => onRemove(toast.id), 300);
      return () => clearTimeout(timer);
    }
  }, [exiting, toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-success shrink-0" />,
    error: <AlertCircle size={18} className="text-error shrink-0" />,
    info: <Info size={18} className="text-info shrink-0" />,
  };

  const borderColors = {
    success: "border-l-success",
    error: "border-l-error",
    info: "border-l-info",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-white border border-border-light ${borderColors[toast.type]} border-l-[3px] rounded-xl px-4 py-3 shadow-lg min-w-[280px] max-w-[380px] ${
        exiting ? "opacity-0 translate-y-[-8px]" : "toast-enter"
      } transition-all duration-300`}
    >
      {icons[toast.type]}
      <p className="text-sm text-text-primary flex-1">{toast.message}</p>
      <button
        onClick={() => setExiting(true)}
        className="text-text-tertiary hover:text-text-secondary transition-colors p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
