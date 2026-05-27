import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Ellipsis,
  RefreshCcw,
  Eye,
  Bolt,
  Trash2,
  BookOpen,
  CalendarCheck,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import AgendaDetailsModal from "../components/Agendadeatilsmodal";
import AddAgendaModal from "../components/AddAgendamodal";
import EditAgendaModal from "../components/EditAgendamodal";
import ReservaDetailsModal from "../components/ReservaDetailsModal";
import AddReservaModal from "../components/AddReservaModal";
import EditReservaModal from "../components/EditReservaModal";

const ITEMS_PER_PAGE = 10;

const Actividades = () => {
  const [activeTab, setActiveTab] = useState("agenda");

  const [agenda, setAgenda] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [windowSize, setWindowSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const [selectedSesion, setSelectedSesion] = useState(null);
  const [isAgendaDetailOpen, setIsAgendaDetailOpen] = useState(false);
  const [sesionToEdit, setSesionToEdit] = useState(null);
  const [isEditAgendaOpen, setIsEditAgendaOpen] = useState(false);
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);

  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isReservaDetailOpen, setIsReservaDetailOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState(null);
  const [isEditReservaOpen, setIsEditReservaOpen] = useState(false);
  const [isAddReservaOpen, setIsAddReservaOpen] = useState(false);

  useEffect(() => {
    const check = () => setWindowSize(window.innerWidth < 768 ? 3 : 10);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getAgenda = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/agenda", {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al cargar agenda");
      if (result.status === "success") setAgenda(result.data);
    } catch (err) {
      console.error("Error cargando agenda:", err);
      setError("Error al cargar agenda.");
    }
  };

  const getReservas = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reservas", {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al cargar reservas");
      if (result.status === "success") setReservas(result.data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
      setError("Error al cargar reservas.");
    }
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([getAgenda(), getReservas()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

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

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab]);

  const filteredAgenda = useMemo(() => {
    if (!searchQuery.trim()) return agenda;
    const q = searchQuery.toLowerCase();
    return agenda.filter(
      (s) =>
        String(s.id_sesion).includes(q) ||
        (s.fecha && s.fecha.includes(q)) ||
        (s.disciplina?.nombre_disciplina && s.disciplina.nombre_disciplina.toLowerCase().includes(q)) ||
        (s.instructor?.nombre_completo && s.instructor.nombre_completo.toLowerCase().includes(q)),
    );
  }, [agenda, searchQuery]);

  const filteredReservas = useMemo(() => {
    if (!searchQuery.trim()) return reservas;
    const q = searchQuery.toLowerCase();
    return reservas.filter(
      (r) =>
        String(r.id_reserva).includes(q) ||
        (r.folio_reserva && r.folio_reserva.toLowerCase().includes(q)) ||
        (r.fecha && r.fecha.includes(q)) ||
        (r.socio?.nombre && r.socio.nombre.toLowerCase().includes(q)) ||
        (r.socio?.apellidos && r.socio.apellidos.toLowerCase().includes(q)),
    );
  }, [reservas, searchQuery]);

  const agendaTotalPages = Math.max(1, Math.ceil(filteredAgenda.length / ITEMS_PER_PAGE));
  const paginatedAgenda = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgenda.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAgenda, currentPage]);

  const reservasTotalPages = Math.max(1, Math.ceil(filteredReservas.length / ITEMS_PER_PAGE));
  const paginatedReservas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReservas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservas, currentPage]);

  const stats = {
    sesiones: agenda.length,
    programadas: agenda.filter((s) => s.estado === "Programada").length,
    activas: agenda.filter((s) => s.estado === "Activa").length,
    reservas: reservas.length,
    reservasActivas: reservas.filter((r) => r.estatus === "Activa").length,
    reservasCanceladas: reservas.filter((r) => r.estatus === "Cancelada").length,
  };

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

  const handleDeleteSesion = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sesión?")) return;
    try {
      await fetch(`http://localhost:8000/api/agenda/${id}`, { method: "DELETE" });
      getAgenda();
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDeleteReserva = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta reserva?")) return;
    try {
      await fetch(`http://localhost:8000/api/reservas/${id}`, { method: "DELETE" });
      getReservas();
    } catch (err) {
      console.error(err);
    }
  };

  const Pagination = ({ current, total, onPageChange, count, winSize = 10 }) => {
    if (total <= 1) return null;
    const curWin = Math.ceil(current / winSize);
    const startP = (curWin - 1) * winSize + 1;
    const endP = Math.min(startP + winSize - 1, total);
    return (
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">{count} registros — Pág. {current} de {total}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(Math.max(1, current - winSize))}
            disabled={curWin === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Anterior ventana">
            <ChevronsLeft size={16} />
          </button>
          <button onClick={() => onPageChange(Math.max(1, current - 1))}
            disabled={current === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: endP - startP + 1 }, (_, i) => startP + i).map((page) => (
            <button key={page} onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                page === current
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                  : "text-gray-500 hover:bg-gray-800 hover:text-white"
              }`}>{page}</button>
          ))}
          <button onClick={() => onPageChange(Math.min(total, current + 1))}
            disabled={current === total}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => onPageChange(Math.min(total, startP + winSize))}
            disabled={endP === total}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Siguiente ventana">
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total Sesiones" value={stats.sesiones} icon={<Calendar size={16} />} color="text-blue-400" />
        <StatCard title="Programadas" value={stats.programadas} icon={<Clock size={16} />} color="text-yellow-400" />
        <StatCard title="Activas" value={stats.activas} icon={<CheckCircle size={16} />} color="text-green-400" />
        <StatCard title="Total Reservas" value={stats.reservas} icon={<CalendarCheck size={16} />} color="text-purple-400" />
        <StatCard title="Reservas Activas" value={stats.reservasActivas} icon={<BookOpen size={16} />} color="text-cyan-400" />
        <StatCard title="Canceladas" value={stats.reservasCanceladas} icon={<XCircle size={16} />} color="text-red-400" />
      </div>

      <div className="bg-[#14171c] rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-gray-800">
          <h2 className="text-base md:text-lg font-bold text-white">
            {activeTab === "agenda" ? "Agenda de sesiones" : "Reservas"}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-900 rounded-lg p-0.5 gap-0.5">
              <TabButton
                label="Sesiones"
                icon={<Calendar size={14} />}
                active={activeTab === "agenda"}
                onClick={() => { setActiveTab("agenda"); setSearchQuery(""); setCurrentPage(1); }}
              />
              <TabButton
                label="Reservas"
                icon={<CalendarCheck size={14} />}
                active={activeTab === "reservas"}
                onClick={() => { setActiveTab("reservas"); setSearchQuery(""); setCurrentPage(1); }}
              />
            </div>
            <button onClick={cargarTodo}
              className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition"
              title="Recargar datos">
              <RefreshCcw size={16} />
            </button>
            <button onClick={() => activeTab === "agenda" ? setIsAddAgendaOpen(true) : setIsAddReservaOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
              + {activeTab === "agenda" ? "Nueva Sesión" : "Nueva Reserva"}
            </button>
          </div>
        </div>

        <div className="px-4 md:px-5 py-3 border-b border-gray-800">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={activeTab === "agenda" ? "Buscar por disciplina, instructor o fecha..." : "Buscar por folio, socio o fecha..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f131a] border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-400 outline-none transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {activeTab === "agenda" && (
          <>
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">Cargando sesiones...</div>
            ) : filteredAgenda.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 text-sm">No hay sesiones registradas.</div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="px-4 py-3 font-medium">Disciplina</th>
                        <th className="px-4 py-3 font-medium">Instructor</th>
                        <th className="px-4 py-3 font-medium">Instalación</th>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Horario</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Cupo</th>
                        <th className="px-4 py-3 font-medium text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {paginatedAgenda.map((s, idx) => (
                        <tr key={s.id_sesion} className={`transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"} hover:bg-gray-800/30`}>
                          <td className="px-4 py-3 text-sm font-semibold text-white">
                            {s.disciplina?.nombre_disciplina ?? `ID ${s.id_disciplina}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {s.instructor?.nombre_completo ?? `ID ${s.id_instructor}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {s.espacio?.nombre_especifico ?? `ID ${s.id_espacio}`}
                          </td>
                          <td className="px-4 py-3 text-sm">{s.fecha}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {s.hora_inicio} – {s.hora_fin}
                          </td>
                          <td className="px-4 py-3">
                            <EstadoBadge status={s.estado} type="agenda" />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {s.cupo_maximo ? `${s.cupo_maximo} pax` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + 8, left: rect.right - 192 });
                                setActiveMenu(activeMenu === `a-${s.id_sesion}` ? null : `a-${s.id_sesion}`);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition mx-auto">
                              <Ellipsis size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-gray-800">
                  {paginatedAgenda.map((s) => (
                    <div key={s.id_sesion} className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-white">
                            {s.disciplina?.nombre_disciplina ?? `Sesión #${s.id_sesion}`}
                          </h3>
                          <p className="text-xs text-gray-500">{s.instructor?.nombre_completo ?? "—"}</p>
                        </div>
                        <EstadoBadge status={s.estado} type="agenda" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{s.fecha}</span>
                        <span>{s.hora_inicio} – {s.hora_fin}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {s.espacio?.nombre_especifico ?? `ID ${s.id_espacio}`}
                        {s.cupo_maximo ? ` · ${s.cupo_maximo} pax` : ""}
                      </p>
                      <div className="flex justify-end">
                        <button onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 8, left: Math.max(8, rect.right - 192) });
                            setActiveMenu(activeMenu === `a-${s.id_sesion}` ? null : `a-${s.id_sesion}`);
                          }}
                          className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-full transition">
                          <Ellipsis size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination current={currentPage} total={agendaTotalPages} onPageChange={setCurrentPage} count={filteredAgenda.length} winSize={windowSize} />
              </>
            )}
          </>
        )}

        {activeTab === "reservas" && (
          <>
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">Cargando reservas...</div>
            ) : filteredReservas.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 text-sm">No hay reservas registradas.</div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="px-4 py-3 font-medium">Folio</th>
                        <th className="px-4 py-3 font-medium">Socio</th>
                        <th className="px-4 py-3 font-medium">Instalación</th>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Horario</th>
                        <th className="px-4 py-3 font-medium">Estatus</th>
                        <th className="px-4 py-3 font-medium">No Show</th>
                        <th className="px-4 py-3 font-medium text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {paginatedReservas.map((r, idx) => (
                        <tr key={r.id_reserva} className={`transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"} hover:bg-gray-800/30`}>
                          <td className="px-4 py-3 text-sm font-mono text-blue-400 font-semibold">{r.folio_reserva}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {r.socio ? `${r.socio.nombre} ${r.socio.apellidos}` : `ID ${r.id_socio}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {r.espacio?.nombre_especifico ?? `ID ${r.id_espacio}`}
                          </td>
                          <td className="px-4 py-3 text-sm">{r.fecha}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {r.hora_inicio} – {r.hora_fin}
                          </td>
                          <td className="px-4 py-3">
                            <EstadoBadge status={r.estatus} type="reserva" />
                          </td>
                          <td className="px-4 py-3">
                            {r.estatus_noshow ? (
                              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">Sí</span>
                            ) : (
                              <span className="text-xs text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + 8, left: rect.right - 192 });
                                setActiveMenu(activeMenu === `r-${r.id_reserva}` ? null : `r-${r.id_reserva}`);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition mx-auto">
                              <Ellipsis size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-gray-800">
                  {paginatedReservas.map((r) => (
                    <div key={r.id_reserva} className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-blue-400 font-mono">{r.folio_reserva}</h3>
                          <p className="text-xs text-gray-500">
                            {r.socio ? `${r.socio.nombre} ${r.socio.apellidos}` : `ID ${r.id_socio}`}
                          </p>
                        </div>
                        <EstadoBadge status={r.estatus} type="reserva" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{r.fecha}</span>
                        <span>{r.hora_inicio} – {r.hora_fin}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {r.espacio?.nombre_especifico ?? `ID ${r.id_espacio}`}
                        {r.estatus_noshow ? " · No Show" : ""}
                      </p>
                      <div className="flex justify-end">
                        <button onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 8, left: Math.max(8, rect.right - 192) });
                            setActiveMenu(activeMenu === `r-${r.id_reserva}` ? null : `r-${r.id_reserva}`);
                          }}
                          className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-full transition">
                          <Ellipsis size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination current={currentPage} total={reservasTotalPages} onPageChange={setCurrentPage} count={filteredReservas.length} winSize={windowSize} />
              </>
            )}
          </>
        )}
      </div>

      {activeMenu && menuPos && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setActiveMenu(null); setMenuPos(null); }}></div>
          <div className="fixed z-50 w-48 rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none"
            style={{ top: menuPos.top, left: menuPos.left }}>
            <div className="py-1.5">
              {(() => {
                const isAgenda = activeMenu?.startsWith("a-");
                const id = activeMenu?.replace(/^[ar]-/, "");
                if (!id) return null;

                if (isAgenda) {
                  const s = agenda.find(item => String(item.id_sesion) === id);
                  if (!s) return null;
                  return (
                    <>
                      <button onClick={() => { handleViewSesion(s.id_sesion); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                        <Eye size={15} className="mr-3 text-blue-400" /> Ver detalles
                      </button>
                      <button onClick={() => { setSesionToEdit(s); setIsEditAgendaOpen(true); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                        <Bolt size={15} className="mr-3 text-amber-400" /> Editar
                      </button>
                      <div className="border-t border-gray-700/50 my-1" />
                      <button onClick={() => { handleDeleteSesion(s.id_sesion); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition">
                        <Trash2 size={15} className="mr-3 text-red-400" /> Eliminar
                      </button>
                    </>
                  );
                } else {
                  const r = reservas.find(item => String(item.id_reserva) === id);
                  if (!r) return null;
                  return (
                    <>
                      <button onClick={() => { handleViewReserva(r.id_reserva); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                        <Eye size={15} className="mr-3 text-blue-400" /> Ver detalles
                      </button>
                      <button onClick={() => { setReservaToEdit(r); setIsEditReservaOpen(true); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                        <Bolt size={15} className="mr-3 text-amber-400" /> Editar
                      </button>
                      <div className="border-t border-gray-700/50 my-1" />
                      <button onClick={() => { handleDeleteReserva(r.id_reserva); setActiveMenu(null); setMenuPos(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition">
                        <Trash2 size={15} className="mr-3 text-red-400" /> Eliminar
                      </button>
                    </>
                  );
                }
              })()}
            </div>
          </div>
        </>,
        document.body
      )}

      <AgendaDetailsModal isOpen={isAgendaDetailOpen} onClose={() => setIsAgendaDetailOpen(false)} data={selectedSesion} />
      <AddAgendaModal isOpen={isAddAgendaOpen} onClose={() => setIsAddAgendaOpen(false)} onRefresh={getAgenda} />
      <EditAgendaModal isOpen={isEditAgendaOpen} onClose={() => setIsEditAgendaOpen(false)} data={sesionToEdit} onUpdate={getAgenda} />
      <ReservaDetailsModal isOpen={isReservaDetailOpen} onClose={() => setIsReservaDetailOpen(false)} data={selectedReserva} />
      <AddReservaModal isOpen={isAddReservaOpen} onClose={() => setIsAddReservaOpen(false)} onRefresh={getReservas} />
      <EditReservaModal isOpen={isEditReservaOpen} onClose={() => setIsEditReservaOpen(false)} data={reservaToEdit} onUpdate={getReservas} />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
    <div className={`p-2 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">{title}</p>
      <p className="text-lg md:text-xl font-bold">{value}</p>
    </div>
  </div>
);

const TabButton = ({ label, icon, active, onClick }) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
      active ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`}>
    {icon}{label}
  </button>
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
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${style}`}>
      {status}
    </span>
  );
};

export default Actividades;
