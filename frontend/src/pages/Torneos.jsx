import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  MapPin,
  Eye,
  Plus,
  X,
  Pencil,
  Trash2,
  Calendar,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
} from "lucide-react";
import TorneoDetailsModal from "../components/TorneoDetailsModal";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

const API_URL = "http://127.0.0.1:8000/api/torneos";
const ITEMS_PER_PAGE = 6;

const Torneos = () => {
  const { isAdmin } = useRoleSimulator();

  const [torneos, setTorneos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [torneoDetalles, setTorneoDetalles] = useState(null);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [windowSize, setWindowSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const estadoInicial = {
    nombre_torneo: "",
    categoria: "Libre",
    sede_principal: "",
    id_disciplina: "",
    tipo_bracket: "",
    tipo: "Local",
    fecha_inicio: "",
    fecha_fin: "",
  };

  const [formData, setFormData] = useState(estadoInicial);

  const formatosPorDeporte = {
    "1": [
      { value: "Eliminacion directa", label: "Eliminatoria Directa" },
      { value: "Liga", label: "Liga" },
    ],
    "2": [
      { value: "Eliminacion directa", label: "Playoffs" },
      { value: "Temporada", label: "Temporada" },
    ],
    "3": [
      { value: "Eliminacion directa", label: "Llaves Singles" },
      { value: "Round Robin", label: "Round Robin" },
    ],
    "4": [
      { value: "Eliminacion directa", label: "Torneo Relámpago" },
      { value: "Liga", label: "Liga" },
    ],
  };

  useEffect(() => {
    const check = () => setWindowSize(window.innerWidth < 768 ? 3 : 10);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resInst = await fetch("http://127.0.0.1:8000/api/instalaciones");
      if (resInst.ok) {
        const jsonInst = await resInst.json();
        setInstalaciones(jsonInst.data || []);
      }
      const resTorneos = await fetch(API_URL);
      if (resTorneos.ok) {
        const jsonTorneos = await resTorneos.json();
        setTorneos(jsonTorneos.data || []);
      }
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredTorneos = useMemo(() => {
    if (!searchTerm) return torneos;
    return torneos.filter((t) =>
      t.nombre_torneo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [torneos, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTorneos.length / ITEMS_PER_PAGE));
  const paginatedTorneos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTorneos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTorneos, currentPage]);

  const abrirParaCrear = () => {
    if (!isAdmin) return;
    setFormData(estadoInicial);
    setModoEdicion(false);
    setModalFormulario(true);
  };

  const abrirParaEditar = (t) => {
    if (!isAdmin) return;
    setFormData(t);
    setModoEdicion(true);
    setModalFormulario(true);
  };

  const guardarTorneo = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const method = modoEdicion ? "PUT" : "POST";
    const url = modoEdicion ? `${API_URL}/${formData.id_torneo}` : API_URL;
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        alert("Error de Base de Datos:\n" + data.message);
      } else {
        setModalFormulario(false);
        cargarDatos();
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const eliminarTorneo = async (idTorneo) => {
    if (!isAdmin) return;
    if (confirm("¿Eliminar?")) {
      await fetch(`${API_URL}/${idTorneo}`, { method: "DELETE" });
      cargarDatos();
    }
  };

  const Pagination = ({ current, total, onPageChange, count, winSize = 10 }) => {
    if (total <= 1) return null;
    const curWin = Math.ceil(current / winSize);
    const startP = (curWin - 1) * winSize + 1;
    const endP = Math.min(startP + winSize - 1, total);
    return (
      <div className="flex items-center justify-center gap-1">
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
    );
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" size={24} />
          Gestión de Torneos
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar torneo..."
              className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-1.5 text-sm text-white outline-none focus:border-yellow-400 w-40 md:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={cargarDatos}
            className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition"
            title="Recargar">
            <RefreshCcw size={16} />
          </button>
          {isAdmin && (
            <button onClick={abrirParaCrear}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm transition">
              <Plus size={16} />
              Nuevo Torneo
            </button>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-400"></div>
        </div>
      ) : filteredTorneos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No hay torneos registrados.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTorneos.map((t) => (
              <div key={t.id_torneo}
                className="bg-[#14171c] border border-gray-800 rounded-xl p-4 md:p-5 hover:border-yellow-400/50 transition-all relative group">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-yellow-400/10 text-yellow-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {t.categoria}
                  </span>
                  {isAdmin && (
                    <button onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const menuW = 160;
                        setMenuPos({ top: rect.bottom + 4, left: Math.min(rect.right - menuW, window.innerWidth - menuW - 8) });
                        setActiveMenu(activeMenu === t.id_torneo ? null : t.id_torneo);
                      }}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                      <Ellipsis size={16} />
                    </button>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mb-3 leading-tight">{t.nombre_torneo}</h3>
                <div className="flex items-center text-gray-400 gap-2 mb-3 text-sm">
                  <MapPin size={15} className="text-yellow-400 shrink-0" />
                  <span className="truncate">{t.sede?.nombre_especifico || "Sin sede"}</span>
                </div>
                {t.fecha_inicio && (
                  <div className="flex items-center text-gray-500 gap-1.5 mb-4 text-xs">
                    <Calendar size={13} />
                    <span>{t.fecha_inicio.slice(0, 10)}{t.fecha_fin ? ` — ${t.fecha_fin.slice(0, 10)}` : ""}</span>
                  </div>
                )}
                <button onClick={() => setTorneoDetalles(t)}
                  className="w-full bg-gray-800 hover:bg-gray-700 py-2.5 rounded-xl flex items-center justify-center gap-2 text-white border border-gray-700 text-sm transition">
                  <Eye size={16} />
                  Detalles
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">{filteredTorneos.length} torneos</p>
              <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} count={filteredTorneos.length} winSize={windowSize} />
            </div>
          )}
        </>
      )}

      {activeMenu && menuPos && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setActiveMenu(null); setMenuPos(null); }}></div>
          <div className="fixed z-50 w-40 rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none"
            style={{ top: menuPos.top, left: menuPos.left }}>
            <div className="py-1.5">
              {(() => {
                const t = filteredTorneos.find(t => t.id_torneo === activeMenu);
                if (!t) return null;
                return (
                  <>
                    <button onClick={() => { abrirParaEditar(t); setActiveMenu(null); setMenuPos(null); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                      <Pencil size={15} className="mr-3 text-amber-400" /> Editar
                    </button>
                    <button onClick={() => { eliminarTorneo(t.id_torneo); setActiveMenu(null); setMenuPos(null); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                      <Trash2 size={15} className="mr-3 text-red-400" /> Eliminar
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </>,
        document.body
      )}

      {isAdmin && modalFormulario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#14171c] border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Trophy className="text-yellow-400" size={20} />
                {modoEdicion ? "Editar Torneo" : "Configurar Torneo"}
              </h2>
              <button onClick={() => setModalFormulario(false)}>
                <X className="text-gray-400 hover:text-white transition" size={20} />
              </button>
            </div>
            <form onSubmit={guardarTorneo} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nombre del Torneo</label>
                <input
                  type="text" required
                  value={formData.nombre_torneo}
                  className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none text-sm"
                  onChange={(e) => setFormData({ ...formData, nombre_torneo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Categoría</label>
                  <select value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none text-sm">
                    <option value="Libre">Libre</option>
                    <option value="Juvenil">Juvenil</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cancha</label>
                  <select required value={formData.sede_principal}
                    onChange={(e) => setFormData({ ...formData, sede_principal: e.target.value })}
                    className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none text-sm">
                    <option value="">Seleccionar...</option>
                    {instalaciones.map((inst) => (
                      <option key={inst.id_espacio} value={inst.id_espacio}>{inst.nombre_especifico}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.sede_principal && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Deporte</label>
                    <select required value={formData.id_disciplina}
                      onChange={(e) => setFormData({ ...formData, id_disciplina: e.target.value, tipo_bracket: "" })}
                      className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none text-sm">
                      <option value="">¿Qué se jugará?</option>
                      <option value="1">Fútbol</option>
                      <option value="2">Básquetbol</option>
                      <option value="3">Tenis</option>
                      <option value="4">Voleibol</option>
                    </select>
                  </div>
                  {formData.id_disciplina && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Formato</label>
                      <select required value={formData.tipo_bracket}
                        onChange={(e) => setFormData({ ...formData, tipo_bracket: e.target.value })}
                        className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-400 outline-none text-sm">
                        <option value="">Elige...</option>
                        {formatosPorDeporte[formData.id_disciplina]?.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" required value={formData.fecha_inicio}
                  className="bg-[#0f131a] border border-gray-700 rounded-lg p-2.5 text-white text-sm"
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                <input type="date" required value={formData.fecha_fin}
                  className="bg-[#0f131a] border border-gray-700 rounded-lg p-2.5 text-white text-sm"
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} />
              </div>
              <button type="submit"
                className="w-full font-bold text-base py-3 rounded-xl shadow-lg mt-2 text-black bg-yellow-400 hover:bg-yellow-500 transition">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      <TorneoDetailsModal
        isOpen={!!torneoDetalles}
        onClose={() => setTorneoDetalles(null)}
        torneo={torneoDetalles}
      />
    </div>
  );
};

export default Torneos;
