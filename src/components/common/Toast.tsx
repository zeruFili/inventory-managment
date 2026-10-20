import React from "react";
import Icon from "./Icons";

interface ToastProps {
  toast: { message: string; type: "success" | "warning" | "error" | "info" } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: "bg-emerald-950 text-white border-emerald-800",
      icon: "check" as const,
      iconColor: "text-amber-400 bg-emerald-900",
    },
    warning: {
      bg: "bg-amber-950 text-white border-amber-800",
      icon: "alert" as const,
      iconColor: "text-amber-300 bg-amber-900",
    },
    error: {
      bg: "bg-rose-950 text-white border-rose-800",
      icon: "close" as const,
      iconColor: "text-rose-300 bg-rose-900",
    },
    info: {
      bg: "bg-emerald-950 text-white border-emerald-800",
      icon: "bell" as const,
      iconColor: "text-amber-400 bg-emerald-900",
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all animate-bounce-subtle text-xs font-semibold backdrop-blur-md max-w-md">
      <div className={`p-1 rounded-full ${config.iconColor}`}>
        <Icon name={config.icon} size={15} />
      </div>
      <span className="text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-md">
        {toast.message}
      </span>
    </div>
  );
};

export default Toast;
