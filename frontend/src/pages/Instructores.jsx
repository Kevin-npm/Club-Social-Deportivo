import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  RefreshCcw,
  Pencil,
  CircleOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
} from "lucide-react";

const API_URL = "http://localhost:8000/api/instructors";
const ITEMS_PER_PAGE = 10;

const Instructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [windowSize, setWindowSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    especialidad: "",
    contacto: "",
    id_usuario: 1,
    estatus: "Activo",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = () => setWindowSize(window.innerWidth < 768 ? 3 : 10);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchInstructores = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "No se pudieron cargar los instructores");
      }
      setInstructores(Array.isArray(result) ? result : (result.data || []));
    } catch (err) {
      console.error(err);
      setError("Error al cargar instructores.");
    }
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError("");
      await fetchInstructores();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterEspecialidad, filterEstatus]);

  useEffect(() => {
    const handleOpenModal = () => {
      resetForm();
      setModalOpen(true);
    };
    window.addEventListener("abrir-modal-instructor", handleOpenModal);
    return () => window.removeEventListener("abrir-modal-instructor", handleOpenModal);
  }, []);

  const especialidadesUnicas = useMemo(() => {
    return [...new Set(instructores.map((ins) => ins.especialidad))].filter(Boolean);
  }, [instructores]);

  const filteredInstructors = useMemo(() => {
    let result = [...instructores];
    if (searchTerm) {
      result = result.filter((ins) =>
        ins.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterEspecialidad) {
      result = result.filter((ins) => ins.especialidad === filterEspecialidad);
    }
    if (filterEstatus) {
      result = result.filter((ins) => ins.estatus === filterEstatus);
    }
    return result;
  }, [instructores, searchTerm, filterEspecialidad, filterEstatus]);

  const totalPages = Math.max(1, Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE));
  const paginatedInstructors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInstructors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInstructors, currentPage]);

  const stats = useMemo(() => {
    return {
      total: filteredInstructors.length,
      activos: filteredInstructors.filter((i) => i.estatus === "Activo").length,
      inactivos: filteredInstructors.filter((i) => i.estatus === "Inactivo").length,
    };
  }, [filteredInstructors]);

  const resetForm = () => {
    setFormData({
      nombre_completo: "",
      especialidad: "",
      contacto: "",
      id_usuario: 1,
      estatus: "Activo",
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const openEdit = (ins) => {
    setEditMode(true);
    setCurrentId(ins.id_instructor);
    setFormData({
      nombre_completo: ins.nombre_completo,
      especialidad: ins.especialidad,
      contacto: ins.contacto || "",
      id_usuario: ins.id_usuario || 1,
      estatus: ins.estatus || "Activo",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const method = editMode ? "PUT" : "POST";
      const url = editMode ? `${API_URL}/${currentId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "No se pudo guardar el instructor");
      }

      await cargarTodo();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar instructor.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Inactivar a este instructor?")) return;

    try {
      setError("");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "No se pudo eliminar el instructor");
      }

      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar instructor.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Activo") {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    }
    if (status === "Inactivo") {
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    }
    return "bg-slate-500/15 text-slate-300 border border-slate-500/20";
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400"><Users size={16} /></div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">Total Instructores</p>
            <p className="text-lg md:text-xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400"><Users size={16} /></div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">Activos</p>
            <p className="text-lg md:text-xl font-bold">{stats.activos}</p>
          </div>
        </div>
        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-900/30 text-red-400"><CircleOff size={16} /></div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">Inactivos</p>
            <p className="text-lg md:text-xl font-bold">{stats.inactivos}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#14171c] rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-gray-800">
          <h2 className="text-base md:text-lg font-bold text-white">Directorio de instructores</h2>
          <button onClick={cargarTodo}
            className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition w-max"
            title="Recargar instructores">
            <RefreshCcw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 md:p-5 border-b border-gray-800">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />
          <select
            value={filterEspecialidad}
            onChange={(e) => setFilterEspecialidad(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="">Todas las Especialidades</option>
            {especialidadesUnicas.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          <select
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="">Todos los Estatus</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Cargando instructores...</div>
        ) : filteredInstructors.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">No hay instructores registrados.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="px-4 py-3 font-medium">Instructor</th>
                    <th className="px-4 py-3 font-medium">Especialidad</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Estatus</th>
                    <th className="px-4 py-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedInstructors.map((ins, idx) => (
                    <tr key={ins.id_instructor} className={`transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"} hover:bg-gray-800/30`}>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{ins.nombre_completo}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{ins.especialidad}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 italic">{ins.contacto || "Sin dato"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(ins.estatus)}`}>
                          {ins.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 8, left: rect.right - 192 });
                            setActiveMenu(activeMenu === ins.id_instructor ? null : ins.id_instructor);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition mx-auto block">
                          <Ellipsis size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-800">
              {paginatedInstructors.map((ins) => (
                <div key={ins.id_instructor} className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-white">{ins.nombre_completo}</h3>
                      <p className="text-xs text-gray-500">{ins.especialidad}</p>
                    </div>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(ins.estatus)}`}>
                      {ins.estatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic">{ins.contacto || "Sin dato"}</p>
                  <div className="flex justify-end">
                    <button onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 8, left: Math.max(8, rect.right - 192) });
                        setActiveMenu(activeMenu === ins.id_instructor ? null : ins.id_instructor);
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-full transition">
                      <Ellipsis size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} count={filteredInstructors.length} winSize={windowSize} />
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
                const ins = filteredInstructors.find(i => i.id_instructor === activeMenu);
                if (!ins) return null;
                return (
                  <>
                    <button onClick={() => { openEdit(ins); setActiveMenu(null); setMenuPos(null); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                      <Pencil size={15} className="mr-3 text-amber-400" /> Editar
                    </button>
                    <button onClick={() => { handleEliminar(ins.id_instructor); setActiveMenu(null); setMenuPos(null); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                      <CircleOff size={15} className="mr-3 text-red-400" /> Dar de baja
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </>,
        document.body
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {editMode ? "Editar perfil" : "Nuevo instructor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Nombre completo</label>
                <input
                  type="text" required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Especialidad</label>
                <input
                  type="text" required
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Contacto (Tel/Email)</label>
                <input
                  type="text"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
              {editMode && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Estatus</label>
                  <select
                    value={formData.estatus}
                    onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal}
                  className="rounded-lg border border-gray-700 bg-[#0f131a] px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-[#1a2029] hover:text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60">
                  {saving ? "Guardando..." : editMode ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructores;
