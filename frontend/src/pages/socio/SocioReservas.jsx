import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  RefreshCcw,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

function formatDate(val) {
  if (!val) return "—";

  return new Date(val + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "—";

  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);

  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
}

function getEspacioNombre(reserva) {
  return (
    reserva?.espacio?.nombre_especifico ||
    reserva?.espacio?.nombre ||
    reserva?.espacio?.nombre_espacio ||
    reserva?.espacio?.nombre_instalacion ||
    "Sin espacio"
  );
}

function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function todayStr() {
  return localDateStr();
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  return localDateStr(d);
}

const FRANJAS = Array.from({ length: 16 }, (_, i) => {
  const h = String(i + 6).padStart(2, "0");
  return {
    inicio: `${h}:00`,
    fin: `${String(i + 7).padStart(2, "0")}:00`,
  };
});

function StatusPill({ status }) {
  const map = {
    Activa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Cancelada: "bg-red-500/15 text-red-400 border-red-500/30",
    Completada: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Liberada: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        map[status] || map.Liberada
      }`}
    >
      {status}
    </span>
  );
}

function NuevaReserva({ token, onReservaCreada }) {
  const [instalaciones, setInstalaciones] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedInst, setSelectedInst] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState(todayStr());
  const [ocupados, setOcupados] = useState([]);
  const [selectedFranja, setSelectedFranja] = useState(null);
  const [loadingInst, setLoadingInst] = useState(true);
  const [loadingOcup, setLoadingOcup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchInstalaciones = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/instalaciones`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const disponibles = (data.data || []).filter(
          (i) => i.permite_reserva && i.estatus !== "Mantenimiento"
        );

        setInstalaciones(disponibles);
      } catch {
        setError("No se pudieron cargar las instalaciones.");
      } finally {
        setLoadingInst(false);
      }
    };

    fetchInstalaciones();
  }, [token]);

  const fetchOcupados = useCallback(
    async (idEspacio, fecha) => {
      setLoadingOcup(true);
      setOcupados([]);
      setSelectedFranja(null);

      try {
        const res = await fetch(
          `${API_BASE_URL}/socio/reservas/disponibilidad?id_espacio=${idEspacio}&fecha=${fecha}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        const normalizarHora = (h) => (h || "").substring(0, 5);

        setOcupados(
          (data.ocupados || []).map((o) => ({
            hora_inicio: normalizarHora(o.hora_inicio),
            hora_fin: normalizarHora(o.hora_fin),
          }))
        );
      } catch {
        setError("No se pudo verificar disponibilidad.");
      } finally {
        setLoadingOcup(false);
      }
    },
    [token]
  );

  const handleSelectInst = (inst) => {
    setSelectedInst(inst);
    setStep(2);
    setError("");
    setSuccess("");
  };

  const handleConfirmarFecha = () => {
    fetchOcupados(selectedInst.id_espacio, selectedFecha);
    setStep(3);
    setError("");
  };

  const isFranjaOcupada = (franja) =>
    ocupados.some(
      (o) => o.hora_inicio < franja.fin && o.hora_fin > franja.inicio
    );

  const handleConfirmarReserva = async () => {
    if (!selectedFranja) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/socio/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_espacio: selectedInst.id_espacio,
          fecha: selectedFecha,
          hora_inicio: selectedFranja.inicio,
          hora_fin: selectedFranja.fin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo crear la reserva.");
        return;
      }

      setOcupados((prev) => [
        ...prev,
        {
          hora_inicio: selectedFranja.inicio,
          hora_fin: selectedFranja.fin,
        },
      ]);

      setSuccess(`¡Reserva creada! Folio: ${data.data.folio_reserva}`);
      setSelectedFranja(null);
      onReservaCreada();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {["Instalación", "Fecha", "Horario"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                step > i + 1
                  ? "bg-emerald-500 text-white"
                  : step === i + 1
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {i + 1}
            </div>

            <span
              className={
                step === i + 1 ? "text-white font-semibold" : "text-gray-600"
              }
            >
              {label}
            </span>

            {i < 2 && <ChevronRight size={14} className="text-gray-700" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">
            Selecciona una instalación
          </h3>

          {loadingInst ? (
            <p className="text-sm text-gray-500">Cargando instalaciones...</p>
          ) : instalaciones.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay instalaciones disponibles para reservar.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {instalaciones.map((inst) => (
                <button
                  key={inst.id_espacio}
                  onClick={() => handleSelectInst(inst)}
                  className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-[#1b2130] p-4 text-left transition hover:border-yellow-400/40 hover:bg-yellow-400/5 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                    <MapPin size={18} className="text-yellow-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm break-words">
                      {inst.nombre_especifico}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 break-words">
                      {inst.ubicacion || "Sin ubicación"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {inst.tipo_superficie || ""}
                      {inst.capacidad_max ? ` · Cap. ${inst.capacidad_max}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedInst && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-white transition"
            >
              ← Volver
            </button>

            <h3 className="text-sm font-semibold text-gray-300">
              <span className="text-white">{selectedInst.nombre_especifico}</span>
            </h3>
          </div>

          <p className="text-sm text-gray-400">
            Solo puedes reservar para{" "}
            <strong className="text-white">hoy o mañana</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                val: todayStr(),
                label: "Hoy",
                sub: new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }),
              },
              {
                val: tomorrowStr(),
                label: "Mañana",
                sub: (() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  return d.toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  });
                })(),
              },
            ].map(({ val, label, sub }) => (
              <button
                key={val}
                onClick={() => setSelectedFecha(val)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedFecha === val
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-gray-800 bg-[#1b2130] hover:border-gray-700"
                }`}
              >
                <p
                  className={`text-lg font-bold ${
                    selectedFecha === val ? "text-yellow-400" : "text-white"
                  }`}
                >
                  {label}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{sub}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirmarFecha}
            className="w-full rounded-2xl bg-yellow-400 py-3 text-sm font-bold text-black hover:bg-yellow-500 transition"
          >
            Ver horarios disponibles →
          </button>
        </div>
      )}

      {step === 3 && selectedInst && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 hover:text-white transition"
            >
              ← Volver
            </button>

            <div>
              <h3 className="text-sm font-semibold text-white">
                {selectedInst.nombre_especifico}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(selectedFecha)}
              </p>
            </div>
          </div>

          {loadingOcup ? (
            <p className="text-sm text-gray-500">
              Verificando disponibilidad...
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  <span className="inline-block w-3 h-3 rounded bg-gray-700 mr-1 align-middle" />
                  Ocupado
                </span>
                <span>
                  <span className="inline-block w-3 h-3 rounded bg-yellow-400/30 border border-yellow-400 mr-1 align-middle" />
                  Seleccionado
                </span>
                <span>
                  <span className="inline-block w-3 h-3 rounded bg-[#1b2130] border border-gray-700 mr-1 align-middle" />
                  Disponible
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {FRANJAS.map((franja) => {
                  const ocupada = isFranjaOcupada(franja);
                  const seleccion = selectedFranja?.inicio === franja.inicio;

                  return (
                    <button
                      key={franja.inicio}
                      disabled={ocupada}
                      onClick={() => setSelectedFranja(franja)}
                      className={`rounded-xl border p-3 text-sm font-semibold transition ${
                        ocupada
                          ? "cursor-not-allowed border-gray-800 bg-gray-800/40 text-gray-600"
                          : seleccion
                          ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                          : "border-gray-700 bg-[#1b2130] text-gray-300 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      {formatTime(franja.inicio)}
                      <span className="block text-[10px] font-normal text-gray-500 mt-0.5">
                        {ocupada
                          ? "Ocupado"
                          : `hasta ${formatTime(franja.fin)}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedFranja && (
                <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-4">
                  <p className="text-sm font-semibold text-yellow-400">
                    Resumen de tu reserva
                  </p>

                  <ul className="mt-2 space-y-1 text-xs text-gray-400">
                    <li>📍 {selectedInst.nombre_especifico}</li>
                    <li>📅 {formatDate(selectedFecha)}</li>
                    <li>
                      🕐 {formatTime(selectedFranja.inicio)} –{" "}
                      {formatTime(selectedFranja.fin)}
                    </li>
                  </ul>

                  <button
                    onClick={handleConfirmarReserva}
                    disabled={submitting}
                    className="mt-4 w-full rounded-xl bg-yellow-400 py-2.5 text-sm font-bold text-black hover:bg-yellow-500 disabled:opacity-50 transition"
                  >
                    {submitting ? "Confirmando..." : "Confirmar reserva"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MisReservas({ token, refresh }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [detalleLoad, setDetalleLoad] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [tab, setTab] = useState("futuras");

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/socio/reservas`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudieron cargar las reservas.");
        return;
      }

      setReservas(data.data || []);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas, refresh]);

  const hoy = todayStr();
  const futuras = reservas.filter(
    (r) => r.fecha >= hoy && r.estatus === "Activa"
  );
  const historial = reservas.filter(
    (r) => r.fecha < hoy || r.estatus !== "Activa"
  );

  const handleVerDetalle = async (id) => {
    setDetalleLoad(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/socio/reservas/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo cargar el detalle.");
        return;
      }

      setDetalle(data.data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setDetalleLoad(false);
    }
  };

  const handleCancelar = async () => {
    if (!detalle) return;
    if (!window.confirm("¿Cancelar esta reserva?")) return;

    setCancelando(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/socio/reservas/${detalle.id_reserva}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo cancelar la reserva.");
        return;
      }

      setDetalle(data.data);
      fetchReservas();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCancelando(false);
    }
  };

  const lista = tab === "futuras" ? futuras : historial;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { key: "futuras", label: `Futuras (${futuras.length})` },
          { key: "historial", label: `Historial (${historial.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? "bg-yellow-400 text-black"
                : "border border-gray-700 text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}

        <button
          onClick={fetchReservas}
          className="sm:ml-auto flex items-center gap-1 rounded-xl border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition"
        >
          <RefreshCcw size={13} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Cargando reservas...
        </p>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] py-12 px-4 text-center text-gray-500 text-sm">
          {tab === "futuras"
            ? "No tienes reservas activas próximas."
            : "No hay reservas en el historial."}
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <button
              key={r.id_reserva}
              onClick={() => handleVerDetalle(r.id_reserva)}
              disabled={detalleLoad}
              className="w-full flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gray-800 bg-[#14171c] p-4 text-left transition hover:border-gray-700 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <CalendarDays size={18} className="text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getEspacioNombre(r)}
                </p>

                <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} />
                    {formatDate(r.fecha)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(r.hora_inicio)} – {formatTime(r.hora_fin)}
                  </span>
                </p>
              </div>

              <StatusPill status={r.estatus} />
            </button>
          ))}
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-800 bg-[#14171c] p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                Detalle de reserva
              </h3>

              <button
                onClick={() => setDetalle(null)}
                className="text-gray-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              {[
                { label: "Folio", value: detalle.folio_reserva || "—" },
                { label: "Espacio", value: getEspacioNombre(detalle) },
                { label: "Fecha", value: formatDate(detalle.fecha) },
                {
                  label: "Hora",
                  value: `${formatTime(detalle.hora_inicio)} – ${formatTime(
                    detalle.hora_fin
                  )}`,
                },
                {
                  label: "Estatus",
                  value: <StatusPill status={detalle.estatus} />,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2.5 border-b border-gray-800 last:border-0"
                >
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-white break-words">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setDetalle(null)}
                className="flex-1 rounded-xl border border-gray-700 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition"
              >
                Cerrar
              </button>

              {detalle.estatus === "Activa" && (
                <button
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition"
                >
                  {cancelando ? "Cancelando..." : "Cancelar reserva"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SocioReservas() {
  const { token } = useAuth();
  const [tab, setTab] = useState("nueva");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReservaCreada = () => {
    setTab("mis");
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Reservas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aparta canchas y espacios del club.
        </p>
      </div>

      <div className="flex gap-0 border-b border-gray-800 overflow-x-auto">
        {[
          { key: "nueva", label: "Nueva Reserva", icon: Plus },
          { key: "mis", label: "Mis Reservas", icon: CalendarDays },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap ${
              tab === key
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-800 bg-[#14171c] p-4 sm:p-5 md:p-6">
        {tab === "nueva" ? (
          <NuevaReserva token={token} onReservaCreada={handleReservaCreada} />
        ) : (
          <MisReservas token={token} refresh={refreshKey} />
        )}
      </div>
    </div>
  );
}