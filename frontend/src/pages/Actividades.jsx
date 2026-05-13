import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Ellipsis,
  RefreshCw,
  Eye,
  Bolt,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  BookOpen,
  CalendarCheck,
  Search,
  X
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

// ── Modales (los crearemos en los siguientes pasos) ──────────────────────────
import AgendaDetailsModal from "../components/Agendadeatilsmodal";
import AddAgendaModal from "../components/AddAgendamodal";
import EditAgendaModal from "../components/EditAgendamodal";
import ReservaDetailsModal from "../components/ReservaDetailsModal";
import AddReservaModal from "../components/AddReservaModal";
import EditReservaModal from "../components/EditReservaModal";

const Actividades = () => {
  // ── Tab activo ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("agenda"); // "agenda" | "reservas"

  // ── Datos ───────────────────────────────────────────────────────────────────
  const [agenda, setAgenda] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Ordenamiento ────────────────────────────────────────────────────────────
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ── Menú contextual ─────────────────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const buttonRefs = useRef({});

  // ── Modales agenda ──────────────────────────────────────────────────────────
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [isAgendaDetailOpen, setIsAgendaDetailOpen] = useState(false);
  const [sesionToEdit, setSesionToEdit] = useState(null);
  const [isEditAgendaOpen, setIsEditAgendaOpen] = useState(false);
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);

  // ── Modales reservas ────────────────────────────────────────────────────────
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isReservaDetailOpen, setIsReservaDetailOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState(null);
  const [isEditReservaOpen, setIsEditReservaOpen] = useState(false);
  const [isAddReservaOpen, setIsAddReservaOpen] = useState(false);

  // ── Fetch de datos ──────────────────────────────────────────────────────────
  const getAgenda = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/agenda");
      const result = await res.json();
      if (result.status === "success") setAgenda(result.data);
    } catch (err) {
      console.error("Error cargando agenda:", err);
    }
  };

  const getReservas = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reservas");
      const result = await res.json();
      if (result.status === "success") setReservas(result.data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([getAgenda(), getReservas()]);
    setLoading(false);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await Promise.all([getAgenda(), getReservas()]);
      setLoading(false);
    };
    cargarDatos();
  }, []);

  // ── Cerrar menú al hacer clic fuera ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        const isBtn = Object.values(buttonRefs.current).some(
          (btn) => btn && btn.contains(e.target),
        );
        if (!isBtn) setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escuchar evento global para abrir modales desde TopHeader ───────────────
  useEffect(() => {
    const handleAddAgenda = () => setIsAddAgendaOpen(true);
    const handleAddReserva = () => setIsAddReservaOpen(true);
    window.addEventListener("open-add-agenda-modal", handleAddAgenda);
    window.addEventListener("open-add-reserva-modal", handleAddReserva);
    return () => {
      window.removeEventListener("open-add-agenda-modal", handleAddAgenda);
      window.removeEventListener("open-add-reserva-modal", handleAddReserva);
    };
  }, []);

  // ── Ordenamiento ────────────────────────────────────────────────────────────
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedAgenda = useMemo(() => {
    let items = [...agenda];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (s) =>
          String(s.id_sesion).includes(q) || (s.fecha && s.fecha.includes(q)),
      );
    }

    // Ordenamiento
    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [agenda, sortConfig, searchQuery]);

  const sortedReservas = useMemo(() => {
    let items = [...reservas];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (r) =>
          String(r.id_reserva).includes(q) ||
          (r.folio_reserva && r.folio_reserva.toLowerCase().includes(q)) ||
          (r.fecha && r.fecha.includes(q)),
      );
    }

    // Ordenamiento
    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [reservas, sortConfig, searchQuery]);

  // ── Menú contextual con cálculo de posición ─────────────────────────────────
  const toggleMenu = (id, e) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_W = 192;
    const MENU_H = 160;
    const PAD = 8;
    const spaceRight = window.innerWidth - rect.right;
    const spaceBottom = window.innerHeight - rect.bottom;
    const left =
      spaceRight >= MENU_W + PAD
        ? rect.right - MENU_W
        : Math.max(PAD, rect.left - MENU_W);
    const top =
      spaceBottom >= MENU_H + PAD ? rect.bottom + 8 : rect.top - MENU_H - 8;
    setMenuPosition({ top: Math.max(PAD, top), left });
    setOpenMenuId(id);
  };

  // ── Detalle de sesión ────────────────────────────────────────────────────────
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

  // ── Detalle de reserva ───────────────────────────────────────────────────────
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

  // ── Eliminar sesión ──────────────────────────────────────────────────────────
  const handleDeleteSesion = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta sesión?")) return;
    try {
      await fetch(`http://localhost:8000/api/agenda/${id}`, {
        method: "DELETE",
      });
      getAgenda();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Eliminar reserva ─────────────────────────────────────────────────────────
  const handleDeleteReserva = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta reserva?")) return;
    try {
      await fetch(`http://localhost:8000/api/reservas/${id}`, {
        method: "DELETE",
      });
      getReservas();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    sesiones: agenda.length,
    programadas: agenda.filter((s) => s.estado === "Programada").length,
    activas: agenda.filter((s) => s.estado === "Activa").length,
    reservas: reservas.length,
    reservasActivas: reservas.filter((r) => r.estatus === "Activa").length,
    reservasCanceladas: reservas.filter((r) => r.estatus === "Cancelada")
      .length,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── StatCards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Sesiones"
          value={stats.sesiones}
          icon={<Calendar size={20} />}
          color="text-blue-400"
        />
        <StatCard
          title="Programadas"
          value={stats.programadas}
          icon={<Clock size={20} />}
          color="text-yellow-400"
        />
        <StatCard
          title="Activas"
          value={stats.activas}
          icon={<CheckCircle size={20} />}
          color="text-green-400"
        />
        <StatCard
          title="Total Reservas"
          value={stats.reservas}
          icon={<CalendarCheck size={20} />}
          color="text-purple-400"
        />
        <StatCard
          title="Reservas Activas"
          value={stats.reservasActivas}
          icon={<BookOpen size={20} />}
          color="text-cyan-400"
        />
        <StatCard
          title="Canceladas"
          value={stats.reservasCanceladas}
          icon={<XCircle size={20} />}
          color="text-red-400"
        />
      </div>

      {/* ── Panel principal ── */}
      <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
        {/* Header con tabs y acciones */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Barra de búsqueda */}
            <div className="px-6 py-3 border-b border-gray-800">
              <div className="relative max-w-xl">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === "agenda"
                      ? "Buscar por ID de sesión o fecha..."
                      : "Buscar por ID, folio o fecha..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
              <TabButton
                label="Agenda de Sesiones"
                icon={<Calendar size={15} />}
                active={activeTab === "agenda"}
                onClick={() => {
                  setActiveTab("agenda");
                  setSortConfig({ key: null, direction: "asc" });
                  setSearchQuery("");
                }}
              />
              <TabButton
                label="Reservas"
                icon={<CalendarCheck size={15} />}
                active={activeTab === "reservas"}
                onClick={() => {
                  setActiveTab("reservas");
                  setSortConfig({ key: null, direction: "asc" });
                  setSearchQuery("");
                }}
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={refreshAll}
                title="Actualizar tabla"
                className="p-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all duration-200"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() =>
                  activeTab === "agenda"
                    ? setIsAddAgendaOpen(true)
                    : setIsAddReservaOpen(true)
                }
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
              >
                + {activeTab === "agenda" ? "Nueva Sesión" : "Nueva Reserva"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabla Agenda ── */}
        {activeTab === "agenda" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <SortableHeader
                    label="Disciplina"
                    sortKey="id_disciplina"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Instructor"
                    sortKey="id_instructor"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Instalación"
                    sortKey="id_espacio"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Fecha"
                    sortKey="fecha"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <th className="px-6 py-4 font-medium">Horario</th>
                  <SortableHeader
                    label="Estado"
                    sortKey="estado"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <th className="px-6 py-4 font-medium">Cupo</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-500">
                      Cargando sesiones...
                    </td>
                  </tr>
                ) : sortedAgenda.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-10 text-gray-500 italic"
                    >
                      No hay sesiones registradas.
                    </td>
                  </tr>
                ) : (
                  sortedAgenda.map((s) => (
                    <tr
                      key={s.id_sesion}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">
                        {s.disciplina?.nombre_disciplina ??
                          `ID ${s.id_disciplina}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {s.instructor?.nombre_completo ??
                          `ID ${s.id_instructor}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {s.espacio?.nombre_especifico ?? `ID ${s.id_espacio}`}
                      </td>
                      <td className="px-6 py-4 text-sm">{s.fecha}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {s.hora_inicio} – {s.hora_fin}
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge status={s.estado} type="agenda" />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.cupo_maximo ? `${s.cupo_maximo} pax` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          ref={(el) =>
                            (buttonRefs.current[`a-${s.id_sesion}`] = el)
                          }
                          onClick={(e) => toggleMenu(`a-${s.id_sesion}`, e)}
                          className="p-2 hover:bg-gray-700 rounded-full text-gray-400"
                        >
                          <Ellipsis size={18} />
                        </button>
                        {openMenuId === `a-${s.id_sesion}` && (
                          <ActionMenuPortal
                            position={menuPosition}
                            menuRef={menuRef}
                            onClose={() => setOpenMenuId(null)}
                            onView={() => handleViewSesion(s.id_sesion)}
                            onEdit={() => {
                              setSesionToEdit(s);
                              setIsEditAgendaOpen(true);
                            }}
                            onDelete={() => handleDeleteSesion(s.id_sesion)}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tabla Reservas ── */}
        {activeTab === "reservas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <SortableHeader
                    label="Folio"
                    sortKey="folio_reserva"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Socio"
                    sortKey="id_socio"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Instalación"
                    sortKey="id_espacio"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Fecha"
                    sortKey="fecha"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <th className="px-6 py-4 font-medium">Horario</th>
                  <SortableHeader
                    label="Estatus"
                    sortKey="estatus"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <th className="px-6 py-4 font-medium">No Show</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-500">
                      Cargando reservas...
                    </td>
                  </tr>
                ) : sortedReservas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-10 text-gray-500 italic"
                    >
                      No hay reservas registradas.
                    </td>
                  </tr>
                ) : (
                  sortedReservas.map((r) => (
                    <tr
                      key={r.id_reserva}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium font-mono text-blue-400">
                        {r.folio_reserva}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {r.socio
                          ? `${r.socio.nombre} ${r.socio.apellidos}`
                          : `ID ${r.id_socio}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.espacio?.nombre_especifico ?? `ID ${r.id_espacio}`}
                      </td>
                      <td className="px-6 py-4 text-sm">{r.fecha}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.hora_inicio} – {r.hora_fin}
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge status={r.estatus} type="reserva" />
                      </td>
                      <td className="px-6 py-4">
                        {r.estatus_noshow ? (
                          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                            Sí
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          ref={(el) =>
                            (buttonRefs.current[`r-${r.id_reserva}`] = el)
                          }
                          onClick={(e) => toggleMenu(`r-${r.id_reserva}`, e)}
                          className="p-2 hover:bg-gray-700 rounded-full text-gray-400"
                        >
                          <Ellipsis size={18} />
                        </button>
                        {openMenuId === `r-${r.id_reserva}` && (
                          <ActionMenuPortal
                            position={menuPosition}
                            menuRef={menuRef}
                            onClose={() => setOpenMenuId(null)}
                            onView={() => handleViewReserva(r.id_reserva)}
                            onEdit={() => {
                              setReservaToEdit(r);
                              setIsEditReservaOpen(true);
                            }}
                            onDelete={() => handleDeleteReserva(r.id_reserva)}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AgendaDetailsModal
        isOpen={isAgendaDetailOpen}
        onClose={() => setIsAgendaDetailOpen(false)}
        data={selectedSesion}
      />
      <AddAgendaModal
        isOpen={isAddAgendaOpen}
        onClose={() => setIsAddAgendaOpen(false)}
        onRefresh={getAgenda}
      />
      <EditAgendaModal
        isOpen={isEditAgendaOpen}
        onClose={() => setIsEditAgendaOpen(false)}
        data={sesionToEdit}
        onUpdate={getAgenda}
      />
      <ReservaDetailsModal
        isOpen={isReservaDetailOpen}
        onClose={() => setIsReservaDetailOpen(false)}
        data={selectedReserva}
      />
      <AddReservaModal
        isOpen={isAddReservaOpen}
        onClose={() => setIsAddReservaOpen(false)}
        onRefresh={getReservas}
      />
      <EditReservaModal
        isOpen={isEditReservaOpen}
        onClose={() => setIsEditReservaOpen(false)}
        data={reservaToEdit}
        onUpdate={getReservas}
      />
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

const TabButton = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`}
  >
    {icon}
    {label}
  </button>
);

const SortableHeader = ({ label, sortKey, currentSort, requestSort }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <th
      className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-800/50 transition-colors group select-none"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span
          className={`${isActive ? "text-yellow-400" : "text-gray-600 group-hover:text-gray-400"} transition-colors`}
        >
          {isActive ? (
            currentSort.direction === "asc" ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )
          ) : (
            <ArrowUpDown size={13} />
          )}
        </span>
      </div>
    </th>
  );
};

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
    <span className={`px-2 py-1 rounded-md text-xs font-bold ${style}`}>
      {status}
    </span>
  );
};

const MenuOption = ({ icon, label, onClick, color = "text-gray-300" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors ${color}`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

const ActionMenuPortal = ({
  position,
  menuRef,
  onClose,
  onView,
  onEdit,
  onDelete,
}) =>
  createPortal(
    <div
      ref={menuRef}
      className="fixed w-48 bg-[#1c1f26] border border-gray-800 rounded-lg shadow-2xl z-50 py-2"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <MenuOption
        icon={<Eye size={16} />}
        label="Ver Detalles"
        onClick={() => {
          onClose();
          onView();
        }}
      />
      <MenuOption
        icon={<Bolt size={16} />}
        label="Editar"
        onClick={() => {
          onClose();
          onEdit();
        }}
      />
      <div className="border-t border-gray-800 my-1" />
      <MenuOption
        icon={<Trash2 size={16} />}
        label="Eliminar"
        onClick={() => {
          onClose();
          onDelete();
        }}
        color="text-red-400"
      />
    </div>,
    document.body,
  );

export default Actividades;
