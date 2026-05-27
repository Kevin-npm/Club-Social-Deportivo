import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Activity,
  RefreshCcw,
  Ellipsis,
  Eye,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

import AgendaDetailsModal from "../components/Agendadeatilsmodal";
import ReservaDetailsModal from "../components/ReservaDetailsModal";
import AsistenciasModal from "../components/AsistenciasModal";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const toYMD = (date) => date.toISOString().split("T")[0];
const isSameDay = (dateStr, date) => dateStr === toYMD(date);

const Sesiones = () => {
  const { token } = useAuth();
  const today = new Date();

  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const [agenda, setAgenda] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSesion, setSelectedSesion] = useState(null);
  const [isAgendaDetailOpen, setIsAgendaDetailOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isReservaDetailOpen, setIsReservaDetailOpen] = useState(false);
  const [menuSesionId, setMenuSesionId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [sesionAsistencias, setSesionAsistencias] = useState(null);
  const [isAsistenciasOpen, setIsAsistenciasOpen] = useState(false);

  const parseJsonResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`El servidor no respondió con JSON válido. HTTP ${response.status}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuSesionId &&
        !event.target.closest(".menu-sesion-button") &&
        !event.target.closest(".menu-sesion-dropdown")
      ) {
        setMenuSesionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuSesionId]);

  const cargarDatos = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [agendaResponse, reservasResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/agenda`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/reservas`, {
          headers: authHeaders,
        }),
      ]);

      const agendaResult = await parseJsonResponse(agendaResponse);
      const reservasResult = await parseJsonResponse(reservasResponse);

      if (!agendaResponse.ok) {
        throw new Error(agendaResult.message || "Error al cargar agenda");
      }

      if (!reservasResponse.ok) {
        throw new Error(reservasResult.message || "Error al cargar reservas");
      }

      if (agendaResult.status === "success") {
        setAgenda(agendaResult.data || []);
      }

      if (reservasResult.status === "success") {
        setReservas(reservasResult.data || []);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};

    agenda.forEach((s) => {
      if (!map[s.fecha]) map[s.fecha] = { agenda: 0, reservas: 0 };
      map[s.fecha].agenda++;
    });

    reservas.forEach((r) => {
      if (!map[r.fecha]) map[r.fecha] = { agenda: 0, reservas: 0 };
      map[r.fecha].reservas++;
    });

    return map;
  }, [agenda, reservas]);

  const selectedYMD = toYMD(selectedDate);

  const sesionesDelDia = useMemo(
    () =>
      agenda
        .filter((s) => s.fecha === selectedYMD)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [agenda, selectedYMD]
  );

  const reservasDelDia = useMemo(
    () =>
      reservas
        .filter((r) => r.fecha === selectedYMD)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [reservas, selectedYMD]
  );

  const stats = {
    sesionesHoy: agenda.filter((s) => isSameDay(s.fecha, today)).length,
    reservasHoy: reservas.filter((r) => isSameDay(r.fecha, today)).length,
    sesionesMes: agenda.filter((s) =>
      s.fecha?.startsWith(toYMD(currentMonth).slice(0, 7))
    ).length,
    reservasMes: reservas.filter((r) =>
      r.fecha?.startsWith(toYMD(currentMonth).slice(0, 7))
    ).length,
  };

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const handleViewSesion = async (id) => {
    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/agenda/${id}`, {
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(result.message || "No se pudo cargar la sesión.");
      }

      if (result.status === "success") {
        setSelectedSesion(result.data);
        setIsAgendaDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar detalle de sesión.");
    }
  };

  const handleViewReserva = async (id) => {
    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/reservas/${id}`, {
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(result.message || "No se pudo cargar la reserva.");
      }

      if (result.status === "success") {
        setSelectedReserva(result.data);
        setIsReservaDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar detalle de reserva.");
    }
  };

  const monthLabel = currentMonth.toLocaleString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const selectedLabel = selectedDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Sesiones hoy" value={stats.sesionesHoy} icon={<Activity size={16} />} color="text-blue-400" />
        <StatCard title="Reservas hoy" value={stats.reservasHoy} icon={<BookOpen size={16} />} color="text-purple-400" />
        <StatCard title="Sesiones mes" value={stats.sesionesMes} icon={<Calendar size={16} />} color="text-green-400" />
        <StatCard title="Reservas mes" value={stats.reservasMes} icon={<Users size={16} />} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#14171c] rounded-xl border border-gray-800">
          <div className="p-4 md:p-5 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold capitalize">
              {monthLabel}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={cargarDatos}
                className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition"
                title="Recargar datos"
              >
                <RefreshCcw size={16} />
              </button>

              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => {
                  setCurrentMonth(
                    new Date(today.getFullYear(), today.getMonth(), 1)
                  );
                  setSelectedDate(today);
                }}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                Hoy
              </button>

              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-800">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-bold text-gray-500 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 md:h-20 border-b border-r border-gray-800/50"
                  />
                );
              }

              const ymd = toYMD(day);
              const isToday = ymd === toYMD(today);
              const isSelected = ymd === selectedYMD;
              const events = eventsByDay[ymd];
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(day)}
                  className={`h-16 md:h-20 p-1.5 border-b border-r border-gray-800/50 text-left transition-colors flex flex-col
                    ${isSelected ? "bg-blue-600/20 border-blue-500/30" : "hover:bg-gray-800/40"}
                    ${!isCurrentMonth ? "opacity-30" : ""}`}
                >
                  <span
                    className={`text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? "bg-blue-600 text-white" : ""}
                    ${isSelected && !isToday ? "text-blue-400" : ""}
                    ${!isToday && !isSelected ? "text-gray-300" : ""}`}
                  >
                    {day.getDate()}
                  </span>

                  {events && (
                    <div className="flex gap-1 mt-auto flex-wrap">
                      {events.agenda > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          {events.agenda > 1 && (
                            <span className="text-[9px] text-green-400">
                              {events.agenda}
                            </span>
                          )}
                        </span>
                      )}

                      {events.reservas > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {events.reservas > 1 && (
                            <span className="text-[9px] text-purple-400">
                              {events.reservas}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-800 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">Sesiones</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-xs text-gray-400">Reservas</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-[#14171c] rounded-xl border border-gray-800 p-4">
            <h3 className="text-base md:text-lg font-bold capitalize">
              {selectedLabel}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {sesionesDelDia.length} sesión(es) · {reservasDelDia.length} reserva(s)
            </p>
          </div>

          <div className="bg-[#14171c] rounded-xl border border-gray-800">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <Activity size={15} className="text-green-400" />
              <h4 className="font-bold text-sm">Sesiones</h4>
            </div>

            {loading ? (
              <p className="text-center py-6 text-gray-500 text-sm">
                Cargando...
              </p>
            ) : sesionesDelDia.length === 0 ? (
              <p className="text-center py-6 text-gray-500 text-sm italic">
                Sin sesiones este día
              </p>
            ) : (
              <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
                {sesionesDelDia.map((s) => (
                  <div
                    key={s.id_sesion}
                    className="relative p-3 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {s.disciplina?.nombre_disciplina ?? `Sesión #${s.id_sesion}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {s.instructor?.nombre_completo ?? "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {s.hora_inicio}
                          </p>
                          <EstadoBadge status={s.estado} type="agenda" />
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            x: rect.right - 192,
                            y: rect.bottom,
                          });
                          setMenuSesionId(
                            menuSesionId === s.id_sesion ? null : s.id_sesion
                          );
                        }}
                        className="menu-sesion-button p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition shrink-0"
                      >
                        <Ellipsis size={16} />
                      </button>
                    </div>

                    {menuSesionId === s.id_sesion &&
                      createPortal(
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuSesionId(null)}
                          />

                          <div
                            className="menu-sesion-dropdown fixed z-50 w-48 rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none py-1"
                            style={{
                              left: menuPosition.x,
                              top: menuPosition.y,
                            }}
                          >
                            <button
                              onClick={() => {
                                setMenuSesionId(null);
                                handleViewSesion(s.id_sesion);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                            >
                              <Eye size={15} /> Ver detalles
                            </button>

                            <button
                              onClick={() => {
                                setMenuSesionId(null);
                                setSesionAsistencias(s);
                                setIsAsistenciasOpen(true);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                            >
                              <CheckCircle size={15} /> Ver asistencia
                            </button>
                          </div>
                        </>,
                        document.body
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#14171c] rounded-xl border border-gray-800">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <BookOpen size={15} className="text-purple-400" />
              <h4 className="font-bold text-sm">Reservas</h4>
            </div>

            {loading ? (
              <p className="text-center py-6 text-gray-500 text-sm">
                Cargando...
              </p>
            ) : reservasDelDia.length === 0 ? (
              <p className="text-center py-6 text-gray-500 text-sm italic">
                Sin reservas este día
              </p>
            ) : (
              <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
                {reservasDelDia.map((r) => (
                  <button
                    key={r.id_reserva}
                    onClick={() => handleViewReserva(r.id_reserva)}
                    className="w-full text-left p-3 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white font-mono truncate">
                          {r.folio_reserva}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {r.socio
                            ? `${r.socio.nombre} ${r.socio.apellidos}`
                            : `Socio #${r.id_socio}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {r.hora_inicio}
                        </p>
                        <EstadoBadge status={r.estatus} type="reserva" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AgendaDetailsModal
        isOpen={isAgendaDetailOpen}
        onClose={() => setIsAgendaDetailOpen(false)}
        data={selectedSesion}
      />

      <ReservaDetailsModal
        isOpen={isReservaDetailOpen}
        onClose={() => setIsReservaDetailOpen(false)}
        data={selectedReserva}
      />

      {isAsistenciasOpen && sesionAsistencias && (
        <AsistenciasModal
          sesion={sesionAsistencias}
          onClose={() => {
            setIsAsistenciasOpen(false);
            setSesionAsistencias(null);
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
    <div className={`p-2 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
        {title}
      </p>
      <p className="text-lg md:text-xl font-bold">{value}</p>
    </div>
  </div>
);

const EstadoBadge = ({ status, type }) => {
  const agenda = {
    Programada: "bg-yellow-500/10 text-yellow-400",
    Activa: "bg-green-500/10  text-green-400",
    Cancelada: "bg-red-500/10    text-red-400",
    Finalizada: "bg-gray-500/10   text-gray-400",
  };

  const reserva = {
    Activa: "bg-green-500/10  text-green-400",
    Cancelada: "bg-red-500/10    text-red-400",
    Liberada: "bg-blue-500/10   text-blue-400",
    Completada: "bg-purple-500/10 text-purple-400",
  };

  const map = type === "agenda" ? agenda : reserva;
  const style = map[status] ?? "bg-gray-700 text-gray-300";

  return (
    <span
      className={`mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ${style}`}
    >
      {status}
    </span>
  );
};

export default Sesiones;