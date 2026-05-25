import {
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ellipsis,
  Bolt,
  Trash2,
  Eye,
  Hammer,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Trophy
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import FacilityDetailsModal from "../components/FacilityDetailsModal";
import EditFacilityModal from "../components/EditFacilityModal";
import AddFacilityModal from "../components/AddFacilityModal";

const Facilities = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Estados del modal de ver detalles
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Estados del modal de edición
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

  // Función para cambiar la dirección del orden (de A-Z a Z-A)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // useMemo hace que este cálculo solo ocurra cuando la lista o el orden cambien (ahorra RAM)
  const sortedFacilities = useMemo(() => {
    let sortableItems = [...facilities]; // Hacemos una copia de la lista original
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Manejamos si el dato no existe para que no de error
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [facilities, sortConfig]);

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

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Verificar que no se hizo clic en el botón específico
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

  // Función mejorada de toggle con cálculo de coordenadas y límites de viewport
  const toggleMenu = (id, event) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const MENU_WIDTH = 192; // w-48 = 12rem = 192px
    const MENU_HEIGHT = 210; // Aproximado incluyendo separador
    const VIEWPORT_PADDING = 8; // Margen de seguridad

    // Espacio disponible
    const spaceRight = window.innerWidth - rect.right;
    const spaceBottom = window.innerHeight - rect.bottom;

    // Determinar alineación horizontal
    let left, align;
    if (spaceRight >= MENU_WIDTH + VIEWPORT_PADDING) {
      // Hay espacio a la derecha
      left = rect.right - MENU_WIDTH;
      align = "right";
    } else {
      // No hay espacio, mostrar a la izquierda
      left = Math.max(VIEWPORT_PADDING, rect.left - MENU_WIDTH);
      align = "left";
    }

    // Determinar alineación vertical
    let top;
    if (spaceBottom >= MENU_HEIGHT + VIEWPORT_PADDING) {
      // Hay espacio abajo
      top = rect.bottom + 8;
    } else {
      // No hay espacio, mostrar arriba
      top = rect.top - MENU_HEIGHT - 8;
    }

    setMenuPosition({
      top: Math.max(VIEWPORT_PADDING, top),
      left,
      align,
    });

    setOpenMenuId(id);
  };

  //Filtar pos estatus
  const stats = {
    total: facilities.length,
    disponibles: facilities.filter((f) => f.estatus === "Disponible").length,
    ocupadas: facilities.filter((f) => f.estatus === "Ocupado").length,
    mantenimiento: facilities.filter((f) => f.estatus === "Mantenimiento")
      .length,
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/instalaciones/${id}`,
      );
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
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Encabezado y Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Instalaciones"
          value={stats.total}
          icon={<Building2 />}
          color="text-blue-400"
        />
        <StatCard
          title="Disponibles"
          value={stats.disponibles}
          icon={<CheckCircle />}
          color="text-green-400"
        />
        <StatCard
          title="En Uso"
          value={stats.ocupadas}
          icon={<Clock />}
          color="text-yellow-400"
        />
        <StatCard
          title="Mantenimiento"
          value={stats.mantenimiento}
          icon={<AlertTriangle />}
          color="text-red-400"
        />
      </div>

      <div className="w-full space-y-6">
        {/* 2. Tabla de Directorio (Ocupa 2 columnas) */}
        <div className="lw-full bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg md:text-xl font-bold">Directorio de Instalaciones</h2>
            <button
              onClick={getFacilities}
              title="Actualizar tabla"
              className="p-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all duration-200"
            >
              <RefreshCw size={15} />
            </button>
          
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <SortableHeader
                    label="Instalación"
                    sortKey="nombre_especifico"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Tipo"
                    sortKey="tipo_superficie"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    label="Capacidad"
                    sortKey="capacidad_max"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <SortableHeader
                    
                    label="Estatus"
                    sortKey="estatus"
                    currentSort={sortConfig}
                    requestSort={requestSort}
                  />
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      Cargando instalaciones...
                    </td>
                  </tr>
                ) : (
                  sortedFacilities.map((f) => (
                    <tr
                      key={f.id_espacio}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">
                        {f.nombre_especifico}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {f.tipo_superficie || "No definida"}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {f.capacidad_max} pax
                      </td>

                      <td className="px-6 py-4">
                        {/* AQUI ESTA LA MAGIA: Si tiene torneos, ignora el status normal y pinta la medalla amarilla */}
                        {f.torneos && f.torneos.length > 0 ? (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center w-max gap-1">
                            <Trophy size={12} /> TORNEO ACTIVO
                          </span>
                        ) : (
                          <StatusBadge status={f.estatus} />
                        )}
                      </td>

                      <td className="px-6 py-4 relative">
                        <button
                          ref={(el) => (buttonRefs.current[f.id_espacio] = el)}
                          onClick={(e) => toggleMenu(f.id_espacio, e)}
                          className="p-2 hover:bg-gray-700 rounded-full text-gray-400"
                        >
                          <Ellipsis size={18} />
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <FacilityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedFacility}
      />
      <EditFacilityModal
        key={facilityToEdit?.id_espacio || "new"} // <--- Esto limpia la memoria al cambiar de cancha
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={facilityToEdit}
        onUpdate={() => {
          setIsEditModalOpen(false);
          getFacilities();
        }}
      />
      <AddFacilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={getFacilities}
      />
    </div>
  );
};

// Componentes Pequeños (Sub-componentes)
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-4 rounded-xl border border-gray-800 flex items-center space-x-4">
    <div className={`p-3 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const SortableHeader = ({ label, sortKey, currentSort, requestSort }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <th
      className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-800/50 transition-colors group select-none"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-2">
        <span>{label}</span>
        <span
          className={`${isActive ? "text-yellow-400" : "text-gray-600 group-hover:text-gray-400"} transition-colors`}
        >
          {isActive ? (
            currentSort.direction === "asc" ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )
          ) : (
            <ArrowUpDown size={14} />
          )}
        </span>
      </div>
    </th>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Disponible: "bg-green-500/10 text-green-500",
    Ocupado: "bg-blue-500/10 text-blue-500",
    Mantenimiento: "bg-red-500/10 text-red-500",
    Reservado: "bg-yellow-500/10 text-yellow-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const DetailItem = ({ label, value, sub }) => (
  <div>
    <p className="text-gray-500 text-xs uppercase font-semibold">{label}</p>
    <p className="font-bold">{value}</p>
    <p className="text-gray-400 text-xs">{sub}</p>
  </div>
);

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
      className="fixed w-48 bg-[#1c1f26] border border-gray-800 rounded-lg shadow-2xl z-50 py-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <MenuOption
        icon={<Eye size={16} />}
        label="Ver Detalles"
        onClick={() => {
          onClose(); // Cierra el menú de puntitos
          handleViewDetails(facility.id_espacio);
        }}
      />
      <MenuOption
        icon={<Bolt size={16} />}
        label="Editar"
        onClick={() => {
          onClose();
          setFacilityToEdit(facility);
          setIsEditModalOpen(true);
        }}
      />
    </div>,
    document.body,
  );
};

export default Facilities;