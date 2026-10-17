import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastItem({ toast, onRemove }) {
  const { id, type = "success", title, message, duration = 4000 } = toast;
  const [isClosing, setIsClosing] = useState(false);
  const [paused, setPaused] = useState(false);

  const remainingRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onRemove(id);
    }, 280);
  }, [id, onRemove]);

  // Iniciar temporizador con soporte para pausar en hover
  useEffect(() => {
    if (paused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingRef.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [paused, handleClose]);

  function handleMouseEnter() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setPaused(true);
  }

  function handleMouseLeave() {
    setPaused(false);
  }

  const IconComponent =
    type === "error"
      ? AlertCircle
      : type === "info"
      ? Info
      : CheckCircle2;

  const defaultTitle =
    type === "error"
      ? "Error en la operación"
      : type === "info"
      ? "Información"
      : "¡Reserva exitosa!";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-item ${isClosing ? "is-closing" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`toast-icon-wrap toast-type-${type}`}>
        <IconComponent size={22} strokeWidth={2.2} />
      </div>

      <div className="toast-content">
        <div className="toast-title">{title || defaultTitle}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>

      <button
        type="button"
        className="toast-close-btn"
        onClick={handleClose}
        aria-label="Cerrar notificación"
        title="Cerrar"
      >
        <X size={16} />
      </button>

      {duration > 0 && (
        <div
          className="toast-progress"
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
