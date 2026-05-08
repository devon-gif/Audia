"use client";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  error: "bg-red-500/10 border-red-500/30 text-red-300",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
};

export default function Toast({ id, message, type, onClose }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl animate-slide-up ${styles[type]}`}
      role="alert"
    >
      <Icon size={18} className="shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
