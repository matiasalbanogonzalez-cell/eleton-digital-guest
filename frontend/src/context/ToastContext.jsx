import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { ToastContainer } from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = "success", title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    const newToast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, options) => {
        const opts = typeof options === "string" ? { title: options } : options || {};
        return showToast({
          type: "success",
          title: opts.title || "¡Reserva exitosa!",
          message,
          duration: opts.duration ?? 4000,
        });
      },
      error: (message, options) => {
        const opts = typeof options === "string" ? { title: options } : options || {};
        return showToast({
          type: "error",
          title: opts.title || "Error",
          message,
          duration: opts.duration ?? 5000,
        });
      },
      info: (message, options) => {
        const opts = typeof options === "string" ? { title: options } : options || {};
        return showToast({
          type: "info",
          title: opts.title || "Información",
          message,
          duration: opts.duration ?? 4000,
        });
      },
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe ser utilizado dentro de un ToastProvider");
  }
  return ctx;
}
