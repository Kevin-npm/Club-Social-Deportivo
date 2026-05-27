import {
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ellipsis,
  Bolt,
  Eye,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import FacilityDetailsModal from "../components/FacilityDetailsModal";
import EditFacilityModal from "../components/EditFacilityModal";
import AddFacilityModal from "../components/AddFacilityModal";

const ITEMS_PER_PAGE = 10;

const Facilities = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    align: "right",
  });
  const menuRef = useRef(null);
  const buttonRefs = useRef({});

  const [facilities, setFacilities] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...facilities];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((f) =>
        f.nombre_especifico.toLowerCase().includes(q) ||
        (f.tipo_superficie || "").toLowerCase().includes(q) ||
        (f.ubicacion || "").toLowerCase().includes(q)
      );
    }
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [facilities, searchQuery, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const getFacilities = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/instalaciones");
      const result = await response.json();
      if (result.status === "success") {
        setFacilities(result.data);
      }
    } catch (error) {
      console.error("Error cargando instalaciones:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getFacilities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          (btn) => btn && btn.contains(event.target),
        );
        if (!isButtonClick) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener("open-add-facility-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-add-facility-modal", handleOpenModal);
  }, []);

  const toggleMenu = (id, event) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const MENU_WIDTH = 192;
    const MENU_HEIGHT = 210;
    const VIEWPORT_PADDING = 8;
    const spaceRight = window.innerWidth - rect.right;
    const spaceBottom = window.innerHeight - rect.bottom;
    let left, align;
    if (spaceRight >= MENU_WIDTH + VIEWPORT_PADDING) {
      left = rect.right - MENU_WIDTH;
      align = "right";
    } else {
      left = Math.max(VIEWPORT_PADDING, rect.left - MENU_WIDTH);
      align = "left";
    }
    let top;
    if (spaceBottom >= MENU_HEIGHT + VIEWPORT_PADDING) {
      top = rect.bottom + 8;
    } else {
      top = rect.top - MENU_HEIGHT - 8;
    }
    setMenuPosition({
      top: Math.max(VIEWPORT_PADDING, top),
      left,
      align,
    });
    setOpenMenuId(id);
  };

  const stats = {
    total: facilities.length,
    disponibles: facilities.filter((f) => f.estatus === "Disponible").length,
    ocupadas: facilities.filter((f) => f.estatus === "Ocupado").length,
    mantenimiento: facilities.filter((f) => f.estatus === "Mantenimiento").length,
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/instalaciones/${id}`);
      const result = await response.json();
      if (result.status === "success") {
        setSelectedFacility(result.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Instalaciones" value={stats.total} icon={<Building2 size={16} />} color="text-blue-400" />
        <StatCard title="Disponibles" value={stats.disponibles} icon={<CheckCircle size={16} />} color="text-green-400" />
        <StatCard title="En Uso" value={stats.ocupadas} icon={<Clock size={16} />} color="text-yellow-400" />
        <StatCard title="Mantenimiento" value={stats.mantenimiento} icon={<AlertTriangle size={16} />} color="text-red-400" />
      </div>

      <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold">Directorio de Instalaciones</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar instalación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-yellow-400 transition"
              />
            </div>
            <button
              onClick={getFacilities}
              title="Actualizar"
              className="p-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">Cargando instalaciones...</div>
        ) : paginatedItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">No se encontraron instalaciones.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <SortableHeader label="Instalación" sortKey="nombre_especifico" currentSort={sortConfig} requestSort={requestSort} />
                    <SortableHeader label="Tipo" sortKey="tipo_superficie" currentSort={sortConfig} requestSort={requestSort} />
                    <SortableHeader label="Capacidad" sortKey="capacidad_max" currentSort={sortConfig} requestSort={requestSort} />
                    <SortableHeader label="Estatus" sortKey="estatus" currentSort={sortConfig} requestSort={requestSort} />
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedItems.map((f, idx) => (
                    <tr
                      key={f.id_espacio}
                      className={`transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"} hover:bg-gray-800/30`}
                    >
                      <td className="px-4 py-3 font-medium text-sm">{f.nombre_especifico}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{f.tipo_superficie || "No definida"}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{f.capacidad_max} pax</td>
                      <td className="px-4 py-3">
                        {f.torneos && f.torneos.length > 0 ? (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center w-max gap-1">
                            <Trophy size={11} /> TORNEO ACTIVO
                          </span>
                        ) : (
                          <StatusBadge status={f.estatus} />
                        )}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          ref={(el) => (buttonRefs.current[f.id_espacio] = el)}
                          onClick={(e) => toggleMenu(f.id_espacio, e)}
                          className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 transition"
                        >
                          <Ellipsis size={16} />
                        </button>
                        {openMenuId === f.id_espacio && (
                          <ActionMenuPortal
                            facility={f}
                            position={menuPosition}
                            menuRef={menuRef}
                            onClose={() => setOpenMenuId(null)}
                            handleViewDetails={handleViewDetails}
                            setFacilityToEdit={setFacilityToEdit}
                            setIsEditModalOpen={setIsEditModalOpen}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-800">
              {paginatedItems.map((f) => (
                <div key={f.id_espacio} className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{f.nombre_especifico}</h3>
                      <p className="text-xs text-gray-500">{f.tipo_superficie || "No definida"} · {f.capacidad_max} pax</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewDetails(f.id_espacio)}
                        className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 transition"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => { setFacilityToEdit(f); setIsEditModalOpen(true); }}
                        className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 transition"
                      >
                        <Bolt size={15} />
                      </button>
                      <button
                        ref={(el) => (buttonRefs.current[f.id_espacio] = el)}
                        onClick={(e) => toggleMenu(f.id_espacio, e)}
                        className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 transition"
                      >
                        <Ellipsis size={15} />
                      </button>
                    </div>
                  </div>
                  <div>
                    {f.torneos && f.torneos.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center w-max gap-1">
                        <Trophy size={11} /> TORNEO ACTIVO
                      </span>
                    ) : (
                      <StatusBadge status={f.estatus} />
                    )}
                  </div>
                  {openMenuId === f.id_espacio && (
                    <ActionMenuPortal
                      facility={f}
                      position={menuPosition}
                      menuRef={menuRef}
                      onClose={() => setOpenMenuId(null)}
                      handleViewDetails={handleViewDetails}
                      setFacilityToEdit={setFacilityToEdit}
                      setIsEditModalOpen={setIsEditModalOpen}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  {filteredAndSorted.length} instalaciones — Pág. {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                        page === currentPage
                          ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                          : "text-gray-500 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FacilityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedFacility}
      />
      <EditFacilityModal
        key={facilityToEdit?.id_espacio || "new"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={facilityToEdit}
        onUpdate={() => { setIsEditModalOpen(false); getFacilities(); }}
      />
      <AddFacilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={getFacilities}
      />
    </div>
  );
};

// Sub-componentes
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
    <div className={`p-2 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">{title}</p>
      <p className="text-lg md:text-xl font-bold">{value}</p>
    </div>
  </div>
);

const SortableHeader = ({ label, sortKey, currentSort, requestSort }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <th
      className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-800/50 transition-colors group select-none"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className={`${isActive ? "text-yellow-400" : "text-gray-600 group-hover:text-gray-400"} transition-colors`}>
          {isActive ? (
            currentSort.direction === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
          ) : (
            <ArrowUpDown size={13} />
          )}
        </span>
      </div>
    </th>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Disponible: "bg-green-500/10 text-green-400 border border-green-500/20",
    Ocupado: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    Mantenimiento: "bg-red-500/10 text-red-400 border border-red-500/20",
    Reservado: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${styles[status] || "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
      {status}
    </span>
  );
};

const ActionMenuPortal = ({
  facility,
  position,
  menuRef,
  onClose,
  handleViewDetails,
  setFacilityToEdit,
  setIsEditModalOpen,
}) => {
  return createPortal(
    <div
      ref={menuRef}
      className="fixed w-40 bg-[#1c1f26] border border-gray-800 rounded-lg shadow-2xl z-50 py-1.5"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => { onClose(); handleViewDetails(facility.id_espacio); }}
        className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <Eye size={15} className="mr-2 text-blue-400" />
        Ver Detalles
      </button>
      <button
        onClick={() => { onClose(); setFacilityToEdit(facility); setIsEditModalOpen(true); }}
        className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <Bolt size={15} className="mr-2 text-amber-400" />
        Editar
      </button>
    </div>,
    document.body,
  );
};

export default Facilities;