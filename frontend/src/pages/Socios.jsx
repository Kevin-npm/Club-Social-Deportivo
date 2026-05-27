import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CircleCheckBig,
  CircleOff,
  RefreshCcw,
  Pencil,
  BadgeCheck,
  UserRoundSearch,
  UserPlus,
  Calendar,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const API_URL = `${API_BASE_URL}/socios`;
const API_DEPENDIENTES = `${API_BASE_URL}/dependientes`;
const API_INVITADOS = `${API_BASE_URL}/invitados`;
const ITEMS_PER_PAGE = 10;

const initialEditForm = {
  nombre: "",
  apellidos: "",
  fecha_nacimiento: "",
  genero: "",
  tipo_membresia: "",
  modalidad: "",
  estatus_financiero: "",
  numero_documento: "",
  fecha_inicio_vigencia: "",
  fecha_fin_vigencia: "",
};

const initialCreateForm = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  tipo_membresia: "",
  modalidad: "",
};

const initialInvitadoForm = {
  nombre: "",
  apellidos: "",
  observaciones: "",
};

const fieldBaseClass =
  "w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400";

const labelClass = "mb-1 block text-sm font-medium text-gray-300";

const Socios = () => {
  const navigate = useNavigate();
  const invitadosRef = useRef(null);
  const { token } = useAuth();

  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const authJsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const [socios, setSocios] = useState([]);
  const [dependientes, setDependientes] = useState([]);
  const [selectedSocios, setSelectedSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialEditForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialCreateForm);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createError, setCreateError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMembresia, setFilterMembresia] = useState("");
  const [filterModalidad, setFilterModalidad] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("");

  const [activeMenu, setActiveMenu] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSocio, setViewingSocio] = useState(null);

  const [invitados, setInvitados] = useState([]);
  const [showInvitadoModal, setShowInvitadoModal] = useState(false);
  const [invitadoFormData, setInvitadoFormData] = useState(initialInvitadoForm);
  const [invitadoSocioId, setInvitadoSocioId] = useState(null);
  const [invitadoSocioNombre, setInvitadoSocioNombre] = useState("");
  const [savingInvitado, setSavingInvitado] = useState(false);
  const [invitadoError, setInvitadoError] = useState("");
  const [showInvitadosTable, setShowInvitadosTable] = useState(false);
  const [filterInvitadoEstatus, setFilterInvitadoEstatus] = useState("");
  const [filterInvitadoFecha, setFilterInvitadoFecha] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [invitadosPage, setInvitadosPage] = useState(1);
  const [menuPos, setMenuPos] = useState(null);
  const [windowSize, setWindowSize] = useState(10);

  useEffect(() => {
    const check = () => setWindowSize(window.innerWidth < 768 ? 3 : 10);
    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const parseJsonResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("El servidor no respondió con JSON válido.");
    }
  };

  const fetchSocios = useCallback(async () => {
    const res = await fetch(API_URL, {
      headers: authHeaders,
    });

    const result = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(result.message || "No se pudo obtener la lista de socios");
    }

    setSocios(result.data || []);
  }, [authHeaders]);

  const fetchDependientes = useCallback(async () => {
    const res = await fetch(API_DEPENDIENTES, {
      headers: authHeaders,
    });

    const result = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(
        result.message || "No se pudo obtener la lista de dependientes"
      );
    }

    setDependientes(result.data || []);
  }, [authHeaders]);

  const fetchInvitados = useCallback(
    async (filters = {}) => {
      const params = new URLSearchParams();

      const fecha = filters.fecha ?? filterInvitadoFecha;
      const estatus = filters.estatus ?? filterInvitadoEstatus;

      if (fecha) params.set("fecha", fecha);
      if (estatus) params.set("estatus", estatus);

      const queryString = params.toString();
      const url = queryString ? `${API_INVITADOS}?${queryString}` : API_INVITADOS;

      const res = await fetch(url, {
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          result.message || "No se pudo obtener la lista de invitados"
        );
      }

      setInvitados(result.data || []);
    },
    [authHeaders, filterInvitadoFecha, filterInvitadoEstatus]
  );

  const cargarTodo = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      await Promise.all([fetchSocios(), fetchDependientes(), fetchInvitados()]);
    } catch (err) {
      console.error("Error al cargar socios:", err);
      setError(err.message || "Error al cargar socios.");
    } finally {
      setLoading(false);
    }
  }, [token, fetchSocios, fetchDependientes, fetchInvitados]);

  const sociosFiltrados = useMemo(() => {
    return socios.filter((s) => {
      const nombre = s.nombre || "";
      const apellidos = s.apellidos || "";
      const idSocio = s.id_socio ? String(s.id_socio) : "";

      const matchesSearch =
        !searchTerm ||
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idSocio.includes(searchTerm);

      const matchesMembresia =
        !filterMembresia || s.tipo_membresia === filterMembresia;

      const matchesModalidad =
        !filterModalidad || s.modalidad === filterModalidad;

      const matchesEstatus =
        !filterEstatus || s.estatus_financiero === filterEstatus;

      return (
        matchesSearch && matchesMembresia && matchesModalidad && matchesEstatus
      );
    });
  }, [socios, searchTerm, filterMembresia, filterModalidad, filterEstatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(sociosFiltrados.length / ITEMS_PER_PAGE)
  );

  const paginatedSocios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sociosFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [sociosFiltrados, currentPage]);

  const invitadosFiltrados = useMemo(() => {
    return invitados.filter((inv) => {
      const nombre = inv.nombre || "";
      const apellidos = inv.apellidos || "";

      const matchesSearch =
        !searchTerm ||
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apellidos.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstatus =
        !filterInvitadoEstatus || inv.estatus === filterInvitadoEstatus;

      return matchesSearch && matchesEstatus;
    });
  }, [invitados, searchTerm, filterInvitadoEstatus]);

  const invitadosTotalPages = Math.max(
    1,
    Math.ceil(invitadosFiltrados.length / ITEMS_PER_PAGE)
  );

  const paginatedInvitados = useMemo(() => {
    const start = (invitadosPage - 1) * ITEMS_PER_PAGE;
    return invitadosFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [invitadosFiltrados, invitadosPage]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  useEffect(() => {
    const handleOpenCreateModal = () => openCreateModal();
    const handleDeleteSelected = () => handleEliminarSociosSeleccionados();

    window.addEventListener("open-add-socio-modal", handleOpenCreateModal);
    window.addEventListener("delete-selected-socios", handleDeleteSelected);

    return () => {
      window.removeEventListener("open-add-socio-modal", handleOpenCreateModal);
      window.removeEventListener("delete-selected-socios", handleDeleteSelected);
    };
  }, [selectedSocios, socios]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMembresia, filterModalidad, filterEstatus]);

  useEffect(() => {
    if (showInvitadosTable && invitadosRef.current) {
      invitadosRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showInvitadosTable]);

  const openCreateModal = () => {
    setCreateFormData(initialCreateForm);
    setCreateError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData(initialCreateForm);
    setCreateError("");
  };

  const openEditModal = (socio) => {
    setEditingId(socio.id_socio);
    setEditFormData({
      nombre: socio.nombre || "",
      apellidos: socio.apellidos || "",
      fecha_nacimiento: socio.fecha_nacimiento
        ? socio.fecha_nacimiento.slice(0, 10)
        : "",
      genero: socio.genero || "",
      tipo_membresia: socio.tipo_membresia || "",
      modalidad: socio.modalidad || "",
      estatus_financiero: socio.estatus_financiero || "",
      numero_documento: socio.numero_documento || "",
      fecha_inicio_vigencia: socio.fecha_inicio_vigencia
        ? socio.fecha_inicio_vigencia.slice(0, 10)
        : "",
      fecha_fin_vigencia: socio.fecha_fin_vigencia
        ? socio.fecha_fin_vigencia.slice(0, 10)
        : "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditFormData(initialEditForm);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "correo") {
      setCreateError("");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSocio = async (e) => {
    e.preventDefault();

    try {
      setSavingCreate(true);
      setCreateError("");

      const payload = {
        ...createFormData,
        id_usuario: null,
        fecha_nacimiento: new Date().toISOString().split("T")[0],
        genero: "No especifica",
        estatus_financiero: "Vigente",
        numero_documento: null,
        fecha_inicio_vigencia: new Date().toISOString().split("T")[0],
        fecha_fin_vigencia: null,
        es_titular: true,
        id_titular_fk: null,
        activo: true,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: authJsonHeaders,
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        console.error("Error al registrar socio:", result);

        if (result.errors) {
          const mensajes = Object.values(result.errors).flat().join(". ");
          throw new Error(
            mensajes || result.message || "No se pudo registrar el socio"
          );
        }

        throw new Error(result.message || "No se pudo registrar el socio");
      }

      await cargarTodo();
      closeCreateModal();
    } catch (err) {
      console.error("Error al registrar socio:", err);
      setCreateError(err.message || "Error al registrar socio.");
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdateSocio = async (e) => {
    e.preventDefault();

    try {
      setSavingEdit(true);
      setError("");

      const payload = {
        ...editFormData,
        numero_documento: editFormData.numero_documento || null,
        fecha_inicio_vigencia: editFormData.fecha_inicio_vigencia || null,
        fecha_fin_vigencia: editFormData.fecha_fin_vigencia || null,
      };

      const res = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: authJsonHeaders,
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        console.error("Error al actualizar socio:", result);
        throw new Error(result.message || "No se pudo actualizar el socio");
      }

      await cargarTodo();
      closeEditModal();
    } catch (err) {
      console.error("Error al actualizar socio:", err);
      setError(err.message || "Error al actualizar socio.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleActivarMembresia = async (id) => {
    try {
      setError("");

      const res = await fetch(`${API_URL}/${id}/activar`, {
        method: "PATCH",
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        console.error("Error al activar membresía:", result);
        throw new Error(result.message || "No se pudo activar la membresía");
      }

      await cargarTodo();
    } catch (err) {
      console.error("Error al activar membresía:", err);
      setError(err.message || "Error al activar membresía.");
    }
  };

  const toggleSelectSocio = (id) => {
    setSelectedSocios((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSocios.length === socios.length) {
      setSelectedSocios([]);
    } else {
      setSelectedSocios(socios.map((socio) => socio.id_socio));
    }
  };

  const handleEliminarSociosSeleccionados = async () => {
    if (selectedSocios.length === 0) {
      alert("Primero selecciona al menos un socio.");
      return;
    }

    const nombres = socios
      .filter((socio) => selectedSocios.includes(socio.id_socio))
      .map((socio) => `${socio.nombre} ${socio.apellidos}`)
      .join(", ");

    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar ${selectedSocios.length} socio(s)?\n\n${nombres}`
    );

    if (!confirmado) return;

    try {
      setError("");

      await Promise.all(
        selectedSocios.map(async (id) => {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: authHeaders,
          });

          const result = await parseJsonResponse(res);

          if (!res.ok) {
            throw new Error(
              result.message || `No se pudo eliminar el socio con ID ${id}`
            );
          }
        })
      );

      setSelectedSocios([]);
      await cargarTodo();
    } catch (err) {
      console.error("Error al eliminar socios seleccionados:", err);
      setError(err.message || "Error al eliminar socios seleccionados.");
    }
  };

  const handleVerDependientes = (idTitular) => {
    navigate(`/dependientes?titular=${idTitular}`);
  };

  const handleAgregarDependiente = (idTitular) => {
    navigate(`/dependientes?titular=${idTitular}`);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-add-dependiente-modal"));
    }, 100);
  };

  const openInvitadoModal = (socio) => {
    setInvitadoSocioId(socio.id_socio);
    setInvitadoSocioNombre(`${socio.nombre} ${socio.apellidos}`);
    setInvitadoFormData(initialInvitadoForm);
    setInvitadoError("");
    setShowInvitadoModal(true);
  };

  const closeInvitadoModal = () => {
    setShowInvitadoModal(false);
    setInvitadoSocioId(null);
    setInvitadoSocioNombre("");
    setInvitadoFormData(initialInvitadoForm);
    setInvitadoError("");
  };

  const handleInvitadoChange = (e) => {
    const { name, value } = e.target;

    setInvitadoFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegistrarInvitado = async (e) => {
    e.preventDefault();

    try {
      setSavingInvitado(true);
      setInvitadoError("");

      const payload = {
        id_socio: invitadoSocioId,
        ...invitadoFormData,
      };

      const res = await fetch(API_INVITADOS, {
        method: "POST",
        headers: authJsonHeaders,
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(result.message || "No se pudo registrar el invitado");
      }

      await fetchInvitados();
      closeInvitadoModal();
    } catch (err) {
      console.error("Error al registrar invitado:", err);
      setInvitadoError(err.message || "Error al registrar invitado.");
    } finally {
      setSavingInvitado(false);
    }
  };

  const handleMarcarAsistencia = async (id) => {
    try {
      setError("");

      const res = await fetch(`${API_INVITADOS}/${id}/marcar-asistencia`, {
        method: "POST",
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(result.message || "No se pudo marcar la asistencia");
      }

      await fetchInvitados();
    } catch (err) {
      console.error("Error al marcar asistencia:", err);
      setError(err.message || "Error al marcar asistencia.");
    }
  };

  const handleEliminarInvitado = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este invitado?")) return;

    try {
      setError("");

      const res = await fetch(`${API_INVITADOS}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(result.message || "No se pudo eliminar el invitado");
      }

      await fetchInvitados();
    } catch (err) {
      console.error("Error al eliminar invitado:", err);
      setError(err.message || "Error al eliminar invitado.");
    }
  };

  const showEditVigencia = editFormData.tipo_membresia === "Rentista";

  const dependientesPorTitular = useMemo(() => {
    const mapa = {};

    dependientes.forEach((dep) => {
      const idTitular = dep.id_titular_fk;
      if (!idTitular) return;

      mapa[idTitular] = (mapa[idTitular] || 0) + 1;
    });

    return mapa;
  }, [dependientes]);

  const stats = useMemo(() => {
    const total = sociosFiltrados.length;

    const vigentes = sociosFiltrados.filter(
      (s) => (s.estatus_financiero || "").toLowerCase() === "vigente"
    ).length;

    const inactivos = sociosFiltrados.filter((s) =>
      ["inactivo", "suspendido", "adeudo"].includes(
        (s.estatus_financiero || "").toLowerCase()
      )
    ).length;

    const rentistas = sociosFiltrados.filter(
      (s) => (s.tipo_membresia || "").toLowerCase() === "rentista"
    ).length;

    return { total, vigentes, inactivos, rentistas };
  }, [sociosFiltrados]);

  const getStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "vigente") {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    }

    if (normalized === "adeudo") {
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    }

    if (normalized === "suspendido" || normalized === "inactivo") {
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    }

    return "bg-slate-500/15 text-slate-300 border border-slate-500/20";
  };

  const getInvitadoStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "pendiente") {
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    }

    if (normalized === "autorizado") {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    }

    if (normalized === "usado") {
      return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }

    if (normalized === "expirado") {
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    }

    return "bg-slate-500/15 text-slate-300 border border-slate-500/20";
  };

  const Pagination = ({
    current,
    total,
    onPageChange,
    count,
    windowSize = 10,
  }) => {
    if (total <= 1) return null;

    const currentWindow = Math.ceil(current / windowSize);
    const startPage = (currentWindow - 1) * windowSize + 1;
    const endPage = Math.min(startPage + windowSize - 1, total);

    return (
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          {count} registros — Pág. {current} de {total}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, current - windowSize))}
            disabled={currentWindow === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Anterior ventana"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => onPageChange(Math.max(1, current - 1))}
            disabled={current === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                page === current
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                  : "text-gray-500 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(total, current + 1))}
            disabled={current === total}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => onPageChange(Math.min(total, startPage + windowSize))}
            disabled={endPage === total}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Siguiente ventana"
          >
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
            <Users size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Total socios
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.total}</p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400">
            <CircleCheckBig size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Vigentes
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.vigentes}</p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-900/30 text-red-400">
            <CircleOff size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Con incidencia
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.inactivos}</p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-900/30 text-yellow-400">
            <BadgeCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Rentistas
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.rentistas}</p>
          </div>
        </div>
      </div>

      {showInvitadosTable && (
        <div
          ref={invitadosRef}
          className="bg-[#14171c] rounded-xl border border-cyan-800/30 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-gray-800">
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <DoorOpen size={18} className="text-cyan-400" />
                Control de invitados
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Invitados registrados &mdash; v&aacute;lidos solo por el
                d&iacute;a
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={filterInvitadoFecha}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterInvitadoFecha(value);
                  fetchInvitados({ fecha: value });
                }}
                className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400 w-36"
              />

              <select
                value={filterInvitadoEstatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterInvitadoEstatus(value);
                  fetchInvitados({ estatus: value });
                }}
                className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="">Todos los estatus</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Autorizado">Autorizado</option>
                <option value="Usado">Usado</option>
                <option value="Expirado">Expirado</option>
              </select>

              <button
                onClick={() => fetchInvitados()}
                className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition"
                title="Recargar invitados"
              >
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              Cargando invitados...
            </div>
          ) : invitadosFiltrados.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No hay invitados registrados.
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">
                        Socio que invita
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Fecha registro
                      </th>
                      <th className="px-4 py-3 font-medium">Estatus</th>
                      <th className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800">
                    {paginatedInvitados.map((inv, idx) => (
                      <tr
                        key={inv.id_invitado}
                        className={`transition-colors ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                        } hover:bg-gray-800/30`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {inv.id_invitado}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {inv.nombre} {inv.apellidos}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400">
                          {inv.socio
                            ? `${inv.socio.nombre} ${inv.socio.apellidos}`
                            : "—"}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-500" />
                            {inv.fecha_registro?.slice(0, 10)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getInvitadoStatusBadge(
                              inv.estatus
                            )}`}
                          >
                            {inv.estatus}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {(inv.estatus === "Pendiente" ||
                              inv.estatus === "Autorizado") && (
                              <button
                                onClick={() =>
                                  handleMarcarAsistencia(inv.id_invitado)
                                }
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1"
                              >
                                <CircleCheckBig size={13} />
                                Entrada
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleEliminarInvitado(inv.id_invitado)
                              }
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-800">
                {paginatedInvitados.map((inv) => (
                  <div
                    key={inv.id_invitado}
                    className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-white">
                          {inv.nombre} {inv.apellidos}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {inv.id_invitado}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getInvitadoStatusBadge(
                          inv.estatus
                        )}`}
                      >
                        {inv.estatus}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      Invita:{" "}
                      {inv.socio
                        ? `${inv.socio.nombre} ${inv.socio.apellidos}`
                        : "—"}{" "}
                      · {inv.fecha_registro?.slice(0, 10)}
                    </p>

                    <div className="flex gap-1.5 justify-end">
                      {(inv.estatus === "Pendiente" ||
                        inv.estatus === "Autorizado") && (
                        <button
                          onClick={() =>
                            handleMarcarAsistencia(inv.id_invitado)
                          }
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1"
                        >
                          <CircleCheckBig size={13} /> Entrada
                        </button>
                      )}

                      <button
                        onClick={() => handleEliminarInvitado(inv.id_invitado)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                current={invitadosPage}
                total={invitadosTotalPages}
                onPageChange={setInvitadosPage}
                count={invitadosFiltrados.length}
                windowSize={windowSize}
              />
            </>
          )}
        </div>
      )}

      <div className="bg-[#14171c] rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-gray-800">
          <div>
            <h2 className="text-base md:text-lg font-bold text-white">
              Directorio de socios
            </h2>

            {selectedSocios.length > 0 && (
              <p className="mt-0.5 text-xs text-yellow-400">
                {selectedSocios.length} seleccionado(s)
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowInvitadosTable(!showInvitadosTable)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                showInvitadosTable
                  ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                  : "border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white"
              }`}
            >
              <DoorOpen size={15} />
              {showInvitadosTable ? "Ver socios" : "Ver invitados"}
            </button>

            <button
              onClick={cargarTodo}
              className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition"
              title="Recargar socios"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 md:p-5 border-b border-gray-800">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <UserRoundSearch size={16} />
            </div>

            <input
              type="text"
              placeholder="Nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#0f131a] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-yellow-400"
            />
          </div>

          <select
            value={filterMembresia}
            onChange={(e) => setFilterMembresia(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="">Todas las Membresías</option>
            <option value="Accionista">Accionista</option>
            <option value="Rentista">Rentista</option>
          </select>

          <select
            value={filterModalidad}
            onChange={(e) => setFilterModalidad(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="">Todas las Modalidades</option>
            <option value="Individual">Individual</option>
            <option value="Familiar">Familiar</option>
          </select>

          <select
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="">Todos los Estatus</option>
            <option value="Vigente">Vigente</option>
            <option value="Adeudo">Adeudo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Suspendido">Suspendido</option>
          </select>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            Cargando socios...
          </div>
        ) : sociosFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No hay socios registrados.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="px-4 py-3 font-medium w-10">
                      <input
                        type="checkbox"
                        checked={
                          socios.length > 0 &&
                          selectedSocios.length === socios.length
                        }
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-600 bg-[#0f131a] accent-yellow-400"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Apellidos</th>
                    <th className="px-4 py-3 font-medium">Membresía</th>
                    <th className="px-4 py-3 font-medium">Modalidad</th>
                    <th className="px-4 py-3 font-medium">Estatus</th>
                    <th className="px-4 py-3 font-medium">Dependientes</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800">
                  {paginatedSocios.map((socio, idx) => {
                    const cantidadDependientes =
                      dependientesPorTitular[socio.id_socio] || 0;

                    return (
                      <tr
                        key={socio.id_socio}
                        className={`transition-colors ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                        } hover:bg-gray-800/30`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedSocios.includes(socio.id_socio)}
                            onChange={() => toggleSelectSocio(socio.id_socio)}
                            className="h-4 w-4 rounded border-gray-600 bg-[#0f131a] accent-yellow-400"
                          />
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-300">
                          {socio.id_socio}
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold text-white">
                          {socio.nombre}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400">
                          {socio.apellidos}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400">
                          {socio.tipo_membresia}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400">
                          {socio.modalidad}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(
                              socio.estatus_financiero
                            )}`}
                          >
                            {socio.estatus_financiero}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {cantidadDependientes > 0 ? (
                            <button
                              onClick={() =>
                                handleVerDependientes(socio.id_socio)
                              }
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition flex items-center gap-1 w-max"
                            >
                              <UserRoundSearch size={12} />
                              {cantidadDependientes}
                            </button>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();

                              setMenuPos({
                                top: rect.bottom + 8,
                                left: rect.right - 208,
                              });

                              setActiveMenu(
                                activeMenu === socio.id_socio
                                  ? null
                                  : socio.id_socio
                              );
                            }}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-800">
              {paginatedSocios.map((socio) => {
                const cantidadDependientes =
                  dependientesPorTitular[socio.id_socio] || 0;

                return (
                  <div
                    key={socio.id_socio}
                    className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSocios.includes(socio.id_socio)}
                            onChange={() => toggleSelectSocio(socio.id_socio)}
                            className="h-4 w-4 rounded border-gray-600 bg-[#0f131a] accent-yellow-400"
                          />
                          <h3 className="font-semibold text-sm text-white">
                            {socio.nombre} {socio.apellidos}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 ml-6">
                          ID: {socio.id_socio}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(
                          socio.estatus_financiero
                        )}`}
                      >
                        {socio.estatus_financiero}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-6">
                      <span>{socio.tipo_membresia}</span>
                      <span>·</span>
                      <span>{socio.modalidad}</span>

                      {cantidadDependientes > 0 && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() =>
                              handleVerDependientes(socio.id_socio)
                            }
                            className="text-violet-400 hover:text-violet-300 font-medium"
                          >
                            {cantidadDependientes} dep.
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end ml-6">
                      <button
                        onClick={(e) => {
                          const rect =
                            e.currentTarget.getBoundingClientRect();

                          setMenuPos({
                            top: rect.bottom + 8,
                            left: Math.max(8, rect.right - 192),
                          });

                          setActiveMenu(
                            activeMenu === socio.id_socio
                              ? null
                              : socio.id_socio
                          );
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-full transition"
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={setCurrentPage}
              count={sociosFiltrados.length}
              windowSize={windowSize}
            />
          </>
        )}
      </div>

      {activeMenu &&
        menuPos &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setActiveMenu(null);
                setMenuPos(null);
              }}
            />

            <div
              className="fixed z-50 w-52 rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <div className="py-1.5">
                {(() => {
                  const socio = sociosFiltrados.find(
                    (s) => s.id_socio === activeMenu
                  );

                  if (!socio) return null;

                  return (
                    <>
                      <button
                        onClick={() => {
                          setViewingSocio(socio);
                          setShowViewModal(true);
                          setActiveMenu(null);
                          setMenuPos(null);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        <UserRoundSearch
                          size={15}
                          className="mr-3 text-blue-400"
                        />
                        Visualizar Información
                      </button>

                      <button
                        onClick={() => {
                          openEditModal(socio);
                          setActiveMenu(null);
                          setMenuPos(null);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        <Pencil size={15} className="mr-3 text-amber-400" />
                        Editar Socio
                      </button>

                      <button
                        onClick={() => {
                          openInvitadoModal(socio);
                          setActiveMenu(null);
                          setMenuPos(null);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        <UserPlus size={15} className="mr-3 text-cyan-400" />
                        Registrar invitado
                      </button>

                      {socio.es_titular && socio.modalidad === "Familiar" && (
                        <button
                          onClick={() => {
                            handleAgregarDependiente(socio.id_socio);
                            setActiveMenu(null);
                            setMenuPos(null);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                        >
                          <Users size={15} className="mr-3 text-violet-400" />
                          Añadir dependiente
                        </button>
                      )}

                      {socio.estatus_financiero !== "Vigente" && (
                        <button
                          onClick={() => {
                            handleActivarMembresia(socio.id_socio);
                            setActiveMenu(null);
                            setMenuPos(null);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                        >
                          <BadgeCheck
                            size={15}
                            className="mr-3 text-emerald-400"
                          />
                          Activar Membresía
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </>,
          document.body
        )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Registrar socio
            </h2>

            {createError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
                {createError}
              </div>
            )}

            <form
              onSubmit={handleCreateSocio}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={createFormData.nombre}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  value={createFormData.apellidos}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label
                  className={`${labelClass} ${
                    createError.toLowerCase().includes("correo")
                      ? "text-red-400"
                      : ""
                  }`}
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={createFormData.correo}
                  onChange={handleCreateChange}
                  className={`${fieldBaseClass} ${
                    createError.toLowerCase().includes("correo")
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  required
                  placeholder="socio@ejemplo.com"
                />
              </div>

              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={createFormData.telefono}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                  placeholder="+1 809 000 0000"
                />
              </div>

              <div>
                <label className={labelClass}>Tipo de membresía</label>
                <select
                  name="tipo_membresia"
                  value={createFormData.tipo_membresia}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Accionista">Accionista</option>
                  <option value="Rentista">Rentista</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Modalidad</label>
                <select
                  name="modalidad"
                  value={createFormData.modalidad}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Individual">Individual</option>
                  <option value="Familiar">Familiar</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-lg border border-gray-700 bg-[#0f131a] px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-[#1a2029] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingCreate}
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {savingCreate ? "Guardando..." : "Registrar socio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Editar socio
            </h2>

            <form
              onSubmit={handleUpdateSocio}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  value={editFormData.apellidos}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={editFormData.fecha_nacimiento}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Género</label>
                <select
                  name="genero"
                  value={editFormData.genero}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="No especifica">No especifica</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo de membresía</label>
                <select
                  name="tipo_membresia"
                  value={editFormData.tipo_membresia}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Accionista">Accionista</option>
                  <option value="Rentista">Rentista</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Modalidad</label>
                <select
                  name="modalidad"
                  value={editFormData.modalidad}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Individual">Individual</option>
                  <option value="Familiar">Familiar</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Estatus financiero</label>
                <select
                  name="estatus_financiero"
                  value={editFormData.estatus_financiero}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Vigente">Vigente</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Adeudo">Adeudo</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Número de documento</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={editFormData.numero_documento}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                />
              </div>

              {showEditVigencia && (
                <>
                  <div>
                    <label className={labelClass}>
                      Fecha inicio vigencia
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio_vigencia"
                      value={editFormData.fecha_inicio_vigencia}
                      onChange={handleEditChange}
                      className={fieldBaseClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Fecha fin vigencia</label>
                    <input
                      type="date"
                      name="fecha_fin_vigencia"
                      value={editFormData.fecha_fin_vigencia}
                      onChange={handleEditChange}
                      className={fieldBaseClass}
                    />
                  </div>
                </>
              )}

              <div className="mt-4 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-gray-700 bg-[#0f131a] px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-[#1a2029] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Ficha del Socio
                </h2>
                <p className="text-sm text-gray-400">
                  ID: {viewingSocio.id_socio}
                </p>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white transition text-3xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 bg-[#0f131a] p-5 rounded-xl border border-gray-800">
                <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                  <Users size={18} /> Datos Personales
                </h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest">
                    Nombre Completo
                  </p>
                  <p className="text-white font-medium">
                    {viewingSocio.nombre} {viewingSocio.apellidos}
                  </p>

                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">
                    Género
                  </p>
                  <p className="text-gray-300">{viewingSocio.genero}</p>

                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-gray-300">
                    {viewingSocio.fecha_nacimiento?.slice(0, 10)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-[#0f131a] p-5 rounded-xl border border-gray-800">
                <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
                  <BadgeCheck size={18} /> Membresía
                </h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest">
                    Tipo / Modalidad
                  </p>
                  <p className="text-white">
                    {viewingSocio.tipo_membresia} - {viewingSocio.modalidad}
                  </p>

                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">
                    Estado Financiero
                  </p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(
                      viewingSocio.estatus_financiero
                    )}`}
                  >
                    {viewingSocio.estatus_financiero}
                  </span>

                  <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">
                    Vigencia
                  </p>
                  <p className="text-gray-300 text-sm">
                    {viewingSocio.fecha_inicio_vigencia?.slice(0, 10)} al{" "}
                    {viewingSocio.fecha_fin_vigencia?.slice(0, 10) || "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-[#0f131a] p-5 rounded-xl border border-gray-800 flex flex-col">
                <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-4">
                  <RefreshCcw size={18} /> Historial Asistencias
                </h3>

                <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-gray-700 rounded-lg p-4">
                  <CircleOff size={32} className="text-gray-700 mb-2" />
                  <p className="text-xs text-gray-500 font-medium italic">
                    No se encontraron registros de asistencias recientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-800 text-white px-8 py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvitadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-cyan-800/30 bg-[#14171c] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <UserPlus size={24} className="text-cyan-400" />
                  Registrar invitado
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Invitado de:{" "}
                  <span className="text-white font-medium">
                    {invitadoSocioNombre}
                  </span>
                </p>
              </div>

              <button
                onClick={closeInvitadoModal}
                className="text-gray-400 hover:text-white transition text-3xl"
              >
                &times;
              </button>
            </div>

            {invitadoError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
                {invitadoError}
              </div>
            )}

            <form onSubmit={handleRegistrarInvitado} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={invitadoFormData.nombre}
                    onChange={handleInvitadoChange}
                    className={fieldBaseClass}
                    required
                    placeholder="Nombre del invitado"
                  />
                </div>

                <div>
                  <label className={labelClass}>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={invitadoFormData.apellidos}
                    onChange={handleInvitadoChange}
                    className={fieldBaseClass}
                    required
                    placeholder="Apellidos del invitado"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Observaciones opcional</label>
                <textarea
                  name="observaciones"
                  value={invitadoFormData.observaciones}
                  onChange={handleInvitadoChange}
                  className={`${fieldBaseClass} resize-none`}
                  rows={3}
                  placeholder="Nota adicional sobre el invitado..."
                />
              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-300">
                <p className="font-medium">Nota importante:</p>
                <p className="text-cyan-400/80 mt-1">
                  El invitado solo es v&aacute;lido por el d&iacute;a de
                  registro. El socio puede registrar un m&aacute;ximo de 2
                  invitados por d&iacute;a.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeInvitadoModal}
                  className="rounded-lg border border-gray-700 bg-[#0f131a] px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-[#1a2029] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingInvitado}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {savingInvitado ? "Guardando..." : "Registrar invitado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Socios;