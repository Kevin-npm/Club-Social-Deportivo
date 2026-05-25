import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
  MapPin,
  User,
  Hash,
  BadgeInfo,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AgendaDetailsModal from "../components/Agendadeatilsmodal";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toYMD = (date) => date.toISOString().split("T")[0];

const isSameDay = (dateStr, date) => dateStr === toYMD(date);

const formatDateLabel = (date) =>
  date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getWeekRange = (baseDate) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

const isDateWithinRange = (dateStr, start, end) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date >= start && date <= end;
};

// ── Componente principal ─────────────────────────────────────────────────────
const CalendarioInstructor = () => {
  const today = new Date();
  const { fakeInstructorId } = useRoleSimulator();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSesion, setSelectedSesion] = useState(null);
  const [isAgendaDetailOpen, setIsAgendaDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const cargarSesiones = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/agenda?id_instructor=${fakeInstructorId}`
        );
        const result = await res.json();

        if (result.status === "success") {
          setSesiones(result.data || []);
        }
      } catch (error) {
        console.error("Error cargando sesiones del instructor:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarSesiones();
  }, [fakeInstructorId]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};

    sesiones.forEach((sesion) => {
      if (!map[sesion.fecha]) {
        map[sesion.fecha] = 0;
      }
      map[sesion.fecha] += 1;
    });

    return map;
  }, [sesiones]);

  const selectedYMD = toYMD(selectedDate);

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .filter((sesion) => sesion.fecha === selectedYMD)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }, [sesiones, selectedYMD]);

  const { monday, sunday } = getWeekRange(today);

  const stats = useMemo(() => {
    const clasesHoy = sesiones.filter((sesion) =>
      isSameDay(sesion.fecha, today)
    ).length;

    const clasesSemana = sesiones.filter((sesion) =>
      isDateWithinRange(sesion.fecha, monday, sunday)
    ).length;

    const monthPrefix = toYMD(currentMonth).slice(0, 7);
    const clasesMes = sesiones.filter((sesion) =>
      sesion.fecha?.startsWith(monthPrefix)
    ).length;

    const instalacionesHoy = new Set(
      sesiones
        .filter((sesion) => isSameDay(sesion.fecha, today))
        .map((sesion) => sesion.espacio?.nombre_especifico || sesion.id_espacio)
        .filter(Boolean)
    ).size;

    return {
      clasesHoy,
      clasesSemana,
      clasesMes,
      instalacionesHoy,
    };
  }, [sesiones, today, monday, sunday, currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const monthLabel = currentMonth.toLocaleString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const handleViewSesion = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`http://localhost:8000/api/agenda/${id}`);
      const result = await res.json();

      if (result.status === "success") {
        setSelectedSesion(result.data);
        setIsAgendaDetailOpen(true);
      }
    } catch (error) {
      console.error("Error cargando detalle de sesión:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="bg-[#14171c] rounded-xl border border-gray-800 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Mi Calendario
          </h1>
          <p className="text-sm text-gray-400">
            Consulta tus clases asignadas, horarios e instalaciones desde una
            sola vista.
          </p>
          <p className="text-xs text-blue-400">
            Instructor simulado ID: {fakeInstructorId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Clases de hoy"
          value={stats.clasesHoy}
          icon={<Activity size={20} />}
          color="text-blue-400"
        />
        <StatCard
          title="Clases de esta semana"
          value={stats.clasesSemana}
          icon={<Calendar size={20} />}
          color="text-green-400"
        />
        <StatCard
          title="Clases de este mes"
          value={stats.clasesMes}
          icon={<Clock size={20} />}
          color="text-yellow-400"
        />
        <StatCard
          title="Instalaciones hoy"
          value={stats.instalacionesHoy}
          icon={<MapPin size={20} />}
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold capitalize text-white">
                {monthLabel}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Vista mensual de tus clases asignadas
              </p>
            </div>

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
                    new Date(today.getFullYear(), today.getMonth(), 1)
                  );
                  setSelectedDate(today);
                }}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors font-semibold text-white"
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

          <div className="grid grid-cols-7 border-b border-gray-800">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-bold text-gray-500 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-24 border-b border-r border-gray-800/50"
                  />
                );
              }

              const ymd = toYMD(day);
              const isTodayCell = ymd === toYMD(today);
              const isSelected = ymd === selectedYMD;
              const classesCount = eventsByDay[ymd] || 0;

              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(day)}
                  className={`h-24 p-2 border-b border-r border-gray-800/50 text-left transition-colors flex flex-col ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/30"
                      : "hover:bg-gray-800/40"
                  }`}
                >
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isTodayCell ? "bg-blue-600 text-white" : ""
                    } ${
                      isSelected && !isTodayCell ? "text-blue-400" : ""
                    } ${
                      !isTodayCell && !isSelected ? "text-gray-300" : ""
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {classesCount > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-[10px] text-green-400 font-semibold">
                        {classesCount} clase{classesCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-800 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-xs text-gray-400">
              Días con clases asignadas
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#14171c] rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-bold capitalize text-white">
              {formatDateLabel(selectedDate)}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {sesionesDelDia.length} clase
              {sesionesDelDia.length !== 1 ? "s" : ""} programada
              {sesionesDelDia.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <Activity size={16} className="text-green-400" />
              <h4 className="font-bold text-sm text-white">
                Clases del día seleccionado
              </h4>
            </div>

            <div className="p-4 space-y-4 max-h-[32rem] overflow-y-auto">
              {loading ? (
                <p className="text-center py-8 text-gray-500 text-sm">
                  Cargando clases...
                </p>
              ) : sesionesDelDia.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-sm italic">
                  No tienes clases programadas para este día.
                </p>
              ) : (
                sesionesDelDia.map((sesion) => (
                  <ClassBlock
                    key={sesion.id_sesion}
                    sesion={sesion}
                    onClick={() => handleViewSesion(sesion.id_sesion)}
                  />
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

      {loadingDetail && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-gray-800 bg-[#14171c] px-4 py-3 text-sm text-gray-300 shadow-lg">
          Cargando detalle de la sesión...
        </div>
      )}
    </div>
  );
};

// ── Subcomponentes ───────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-4 rounded-xl border border-gray-800 flex items-center space-x-3">
    <div className={`p-2.5 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-[10px] font-medium uppercase leading-tight">
        {title}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ClassBlock = ({ sesion, onClick }) => {
  const className =
    sesion.disciplina?.nombre_disciplina || `Clase #${sesion.id_sesion}`;

  const instructorName =
    sesion.instructor?.nombre_completo || "Instructor no disponible";

  const locationName =
    sesion.espacio?.nombre_especifico || `Espacio #${sesion.id_espacio}`;

  const sessionTime = `${sesion.hora_inicio} - ${sesion.hora_fin}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-gray-800 bg-gradient-to-br from-[#171b22] to-[#11151b] p-4 shadow-sm transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Activity size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">
                {className}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                Haz clic para ver más detalles
              </p>
            </div>
          </div>
        </div>

        <EstadoBadge status={sesion.estado} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <DetailChip
          icon={<Clock size={14} />}
          label="Horario"
          value={sessionTime}
          valueClassName="text-white font-semibold"
        />
        <DetailChip
          icon={<MapPin size={14} />}
          label="Instalación"
          value={locationName}
        />
        <DetailChip
          icon={<User size={14} />}
          label="Instructor"
          value={instructorName}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <Hash size={12} />
          <span>ID de sesión: {sesion.id_sesion}</span>
        </div>

        <div className="flex items-center gap-2 text-blue-400">
          <BadgeInfo size={13} />
          <span className="font-medium">Abrir detalle</span>
        </div>
      </div>
    </button>
  );
};

const DetailChip = ({
  icon,
  label,
  value,
  valueClassName = "text-gray-200",
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-[#0f1319]/70 px-3 py-3">
    <div className="mt-0.5 text-gray-400">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`text-sm break-words ${valueClassName}`}>{value}</p>
    </div>
  </div>
);

const EstadoBadge = ({ status }) => {
  const styles = {
    Programada: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    Activa: "bg-green-500/10 text-green-400 border border-green-500/20",
    Cancelada: "bg-red-500/10 text-red-400 border border-red-500/20",
    Finalizada: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  };

  const style =
    styles[status] || "bg-gray-700 text-gray-300 border border-gray-600";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style}`}
    >
      {status || "Sin estado"}
    </span>
  );
};

export default CalendarioInstructor;