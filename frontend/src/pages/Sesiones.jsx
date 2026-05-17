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
  Ellipsis,
  Eye,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import AgendaDetailsModal from "../components/Agendadeatilsmodal";
import ReservaDetailsModal from "../components/ReservaDetailsModal";
import AsistenciasModal from "../components/AsistenciasModal";

// ── Helpers ──────────────────────────────────────────────────────────────────

const toYMD = (date) => date.toISOString().split("T")[0];

const isSameDay = (dateStr, date) => dateStr === toYMD(date);

// ── Componente principal ─────────────────────────────────────────────────────

const Sesiones = () => {
  const today = new Date();

  // ── Estado del calendario ────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);

  // ── Datos ────────────────────────────────────────────────────────────────
  const [agenda, setAgenda] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modales ──────────────────────────────────────────────────────────────
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [isAgendaDetailOpen, setIsAgendaDetailOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isReservaDetailOpen, setIsReservaDetailOpen] = useState(false);
  const [menuSesionId, setMenuSesionId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Agrega este estado para el modal de asistencias
  const [sesionAsistencias, setSesionAsistencias] = useState(null);
  const [isAsistenciasOpen, setIsAsistenciasOpen] = useState(false);

  // ── Cerrar menú al hacer clic fuera ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuSesionId && !event.target.closest('.menu-sesion-button') && !event.target.closest('.menu-sesion-dropdown')) {
        setMenuSesionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuSesionId]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [a, r] = await Promise.all([
          fetch("http://localhost:8000/api/agenda").then((res) => res.json()),
          fetch("http://localhost:8000/api/reservas").then((res) => res.json()),
        ]);
        if (a.status === "success") setAgenda(a.data);
        if (r.status === "success") setReservas(r.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Días del calendario ──────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Días vacíos antes del primero
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  // ── Eventos por día (para los puntos del calendario) ────────────────────
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

  // ── Sesiones y reservas del día seleccionado ─────────────────────────────
  const selectedYMD = toYMD(selectedDate);

  const sesionesDelDia = useMemo(
    () =>
      agenda
        .filter((s) => s.fecha === selectedYMD)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [agenda, selectedYMD],
  );

  const reservasDelDia = useMemo(
    () =>
      reservas
        .filter((r) => r.fecha === selectedYMD)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [reservas, selectedYMD],
  );

  // ── Stats generales ──────────────────────────────────────────────────────
  const stats = {
    sesionesHoy: agenda.filter((s) => isSameDay(s.fecha, today)).length,
    reservasHoy: reservas.filter((r) => isSameDay(r.fecha, today)).length,
    sesionesMes: agenda.filter((s) =>
      s.fecha?.startsWith(toYMD(currentMonth).slice(0, 7)),
    ).length,
    reservasMes: reservas.filter((r) =>
      r.fecha?.startsWith(toYMD(currentMonth).slice(0, 7)),
    ).length,
  };

  // ── Navegación del mes ───────────────────────────────────────────────────
  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  // ── Ver detalle de sesión ────────────────────────────────────────────────
  const handleViewSesion = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/agenda/${id}`);
      const result = await res.json();
      if (result.status === "success") {
        setSelectedSesion(result.data);
        setIsAgendaDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Ver detalle de reserva ───────────────────────────────────────────────
  const handleViewReserva = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reservas/${id}`);
      const result = await res.json();
      if (result.status === "success") {
        setSelectedReserva(result.data);
        setIsReservaDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── StatCards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Sesiones hoy"
          value={stats.sesionesHoy}
          icon={<Activity size={20} />}
          color="text-blue-400"
        />
        <StatCard
          title="Reservas hoy"
          value={stats.reservasHoy}
          icon={<BookOpen size={20} />}
          color="text-purple-400"
        />
        <StatCard
          title="Sesiones mes"
          value={stats.sesionesMes}
          icon={<Calendar size={20} />}
          color="text-green-400"
        />
        <StatCard
          title="Reservas mes"
          value={stats.reservasMes}
          icon={<Users size={20} />}
          color="text-yellow-400"
        />
      </div>

      {/* ── Layout principal: Calendario + Panel del día ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Calendario mensual (ocupa 2 columnas) ── */}
        <div className="lg:col-span-2 bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
          {/* Header del calendario */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold capitalize">{monthLabel}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(
                    new Date(today.getFullYear(), today.getMonth(), 1),
                  );
                  setSelectedDate(today);
                }}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                Hoy
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-800">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div
                key={d}
                className="py-3 text-center text-xs font-bold text-gray-500 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day)
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-20 border-b border-r border-gray-800/50"
                  />
                );

              const ymd = toYMD(day);
              const isToday = ymd === toYMD(today);
              const isSelected = ymd === selectedYMD;
              const events = eventsByDay[ymd];
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 p-2 border-b border-r border-gray-800/50 text-left transition-colors flex flex-col
                    ${isSelected ? "bg-blue-600/20 border-blue-500/30" : "hover:bg-gray-800/40"}
                    ${!isCurrentMonth ? "opacity-30" : ""}
                  `}
                >
                  {/* Número del día */}
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday ? "bg-blue-600 text-white" : ""}
                    ${isSelected && !isToday ? "text-blue-400" : ""}
                    ${!isToday && !isSelected ? "text-gray-300" : ""}
                  `}
                  >
                    {day.getDate()}
                  </span>

                  {/* Puntos de eventos */}
                  {events && (
                    <div className="flex gap-1 mt-1 flex-wrap">
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

          {/* Leyenda */}
          <div className="p-4 border-t border-gray-800 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">Sesiones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-xs text-gray-400">Reservas</span>
            </div>
          </div>
        </div>

        {/* ── Panel del día seleccionado (1 columna) ── */}
        <div className="space-y-4">
          {/* Título del día */}
          <div className="bg-[#14171c] rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-bold capitalize">{selectedLabel}</h3>
            <p className="text-gray-500 text-sm mt-0.5">
              {sesionesDelDia.length} sesión(es) · {reservasDelDia.length}{" "}
              reserva(s)
            </p>
          </div>

          {/* Sesiones del día */}
          <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <Activity size={16} className="text-green-400" />
              <h4 className="font-bold text-sm">Sesiones</h4>
            </div>
            <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
              {loading ? (
                <p className="text-center py-6 text-gray-500 text-sm">
                  Cargando...
                </p>
              ) : sesionesDelDia.length === 0 ? (
                <p className="text-center py-6 text-gray-500 text-sm italic">
                  Sin sesiones este día
                </p>
              ) : (
                sesionesDelDia.map((s) => (
                  <div key={s.id_sesion} className="relative">
                    <div className="w-full text-left px-5 py-3 hover:bg-gray-800/50 transition-colors flex items-start justify-between gap-2">
                      {/* Info de la sesión */}
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {s.disciplina?.nombre_disciplina ??
                            `Sesión #${s.id_sesion}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.instructor?.nombre_completo ?? "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} /> {s.hora_inicio}
                          </p>
                          <EstadoBadge status={s.estado} type="agenda" />
                        </div>
                        {/* Botón de menú */}
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const menuWidth = 192; // w-48 = 12rem = 192px
                            setMenuPosition({ 
                              x: rect.right - menuWidth, 
                              y: rect.bottom 
                            });
                            setMenuSesionId(
                              menuSesionId === s.id_sesion ? null : s.id_sesion,
                            );
                          }}
                          className="menu-sesion-button p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                        >
                          <Ellipsis size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Menú desplegable */}
                    {menuSesionId === s.id_sesion &&
                      createPortal(
                        <div
                          className="menu-sesion-dropdown fixed w-48 bg-[#1c1f26] border border-gray-700 rounded-lg shadow-2xl z-50 py-1"
                          style={{ left: menuPosition.x, top: menuPosition.y }}
                        >
                          <button
                            onClick={() => {
                              setMenuSesionId(null);
                              handleViewSesion(s.id_sesion);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            <Eye size={15} /> Ver detalles
                          </button>
                          <button
                            onClick={() => {
                              setMenuSesionId(null);
                              setSesionAsistencias(s);
                              setIsAsistenciasOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            <CheckCircle size={15} /> Ver asistencia
                          </button>
                        </div>,
                        document.body,
                      )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reservas del día */}
          <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <BookOpen size={16} className="text-purple-400" />
              <h4 className="font-bold text-sm">Reservas</h4>
            </div>
            <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
              {loading ? (
                <p className="text-center py-6 text-gray-500 text-sm">
                  Cargando...
                </p>
              ) : reservasDelDia.length === 0 ? (
                <p className="text-center py-6 text-gray-500 text-sm italic">
                  Sin reservas este día
                </p>
              ) : (
                reservasDelDia.map((r) => (
                  <button
                    key={r.id_reserva}
                    onClick={() => handleViewReserva(r.id_reserva)}
                    className="w-full text-left px-5 py-3 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white font-mono">
                          {r.folio_reserva}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.socio
                            ? `${r.socio.nombre} ${r.socio.apellidos}`
                            : `Socio #${r.id_socio}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {r.hora_inicio}
                        </p>
                        <EstadoBadge status={r.estatus} type="reserva" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
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

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-4 rounded-xl border border-gray-800 flex items-center space-x-3">
    <div className={`p-2.5 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-[10px] font-medium uppercase leading-tight">
        {title}
      </p>
      <p className="text-2xl font-bold">{value}</p>
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
      className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${style}`}
    >
      {status}
    </span>
  );
};

export default Sesiones;
