import { useState } from "react";
import { MessageSquare, Smile, AlertTriangle, Wrench, HelpCircle, Star, Send, CheckCircle2 } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { api } from "../api/client";

const TIPOS = [
  { value: "SUGERENCIA", label: "Sugerencia", icon: MessageSquare },
  { value: "FELICITACION", label: "Felicitación", icon: Smile },
  { value: "RECLAMO", label: "Reclamo", icon: AlertTriangle },
  { value: "PROBLEMA_SERVICIO", label: "Problema con un servicio", icon: Wrench },
  { value: "OTRO", label: "Otro", icon: HelpCircle },
];

const CATEGORIAS = [
  { value: "RESTO", label: "Restó" },
  { value: "SPA", label: "Spa" },
  { value: "RECREACION", label: "Recreación" },
  { value: "TEATRO", label: "Teatro" },
  { value: "HABITACION", label: "Habitación" },
  { value: "ATENCION", label: "Atención" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "INSTALACIONES", label: "Instalaciones" },
  { value: "OTRO", label: "Otro" },
];

export default function Sugerencias() {
  const [tipo, setTipo] = useState("SUGERENCIA");
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [valoracion, setValoracion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!habitacion.trim() || !categoria || !mensaje.trim()) {
      setError("Completá habitación, categoría y mensaje antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      await api.crearSugerencia({
        tipo,
        nombre: nombre.trim() || undefined,
        habitacion: habitacion.trim(),
        categoria,
        mensaje: mensaje.trim(),
        valoracion: valoracion || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg py-16 px-4 text-center">
          <CheckCircle2 className="mx-auto mb-4 text-[#4F7A6C]" size={48} />
          <h1 className="text-2xl font-bold text-[#123832]">¡Gracias por tu mensaje!</h1>
          <p className="mt-2 text-[#123832]/70">
            Lo recibimos y lo va a revisar el equipo correspondiente.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg py-10 px-4">
        <h1 className="text-2xl font-bold text-[#123832]">Sugerencias y comentarios</h1>
        <p className="mt-1 text-[#123832]/70">
          Tu opinión nos ayuda a mejorar tu estadía.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#123832]">Tipo</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIPOS.map((t) => {
                const Icon = t.icon;
                const activo = tipo === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      activo
                        ? "border-[#C97C4D] bg-[#C97C4D]/10 text-[#123832] font-semibold"
                        : "border-[#123832]/15 text-[#123832]/70 hover:border-[#123832]/30"
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#123832]">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-[#123832]/20 px-3 py-2 text-sm focus:border-[#C97C4D] focus:outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#123832]">
                Habitación *
              </label>
              <input
                type="text"
                value={habitacion}
                onChange={(e) => setHabitacion(e.target.value)}
                className="w-full rounded-lg border border-[#123832]/20 px-3 py-2 text-sm focus:border-[#C97C4D] focus:outline-none"
                placeholder="Ej: 204"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#123832]">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-[#123832]/20 px-3 py-2 text-sm focus:border-[#C97C4D] focus:outline-none"
              required
            >
              <option value="">Seleccioná una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#123832]">
              Mensaje *
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#123832]/20 px-3 py-2 text-sm focus:border-[#C97C4D] focus:outline-none"
              placeholder="Contanos qué pasó o qué se te ocurre..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#123832]">
              Valoración (opcional)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setValoracion(valoracion === n ? 0 : n)}
                  aria-label={`${n} estrellas`}
                >
                  <Star
                    size={26}
                    className={n <= valoracion ? "fill-[#C97C4D] text-[#C97C4D]" : "text-[#123832]/20"}
                  />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-[#7A3B36]/10 px-3 py-2 text-sm text-[#7A3B36]">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123832] py-3 font-semibold text-white transition hover:bg-[#123832]/90 disabled:opacity-60"
          >
            <Send size={16} />
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}
