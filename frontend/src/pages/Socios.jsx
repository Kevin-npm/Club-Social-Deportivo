import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import {
  Users,
  CircleCheckBig,
  CircleOff,
  RefreshCcw,
  Pencil,
  BadgeCheck,
  UserRoundSearch,
} from "lucide-react";

const API_URL = "http://localhost:8000/api/socios";
const API_DEPENDIENTES = "http://localhost:8000/api/dependientes";

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

const fieldBaseClass =
  "w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400";

const labelClass = "mb-1 block text-sm font-medium text-gray-300";

const Socios = () => {
  const navigate = useNavigate();

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
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMembresia, setFilterMembresia] = useState("");
  const [filterModalidad, setFilterModalidad] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("");

  const [activeMenu, setActiveMenu] = useState(null); // Para controlar qué menú de tres puntos está abierto
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSocio, setViewingSocio] = useState(null);

  const fetchSocios = async () => {
    const res = await fetch(API_URL, {
      headers: {
        Accept: "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "No se pudo obtener la lista de socios");
    }

    setSocios(result.data || []);
  };

  const fetchDependientes = async () => {
    const res = await fetch(API_DEPENDIENTES, {
      headers: {
        Accept: "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result.message || "No se pudo obtener la lista de dependientes"
      );
    }

    setDependientes(result.data || []);
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchSocios(), fetchDependientes()]);
    } catch (err) {
      console.error("Error al cargar socios:", err);
      setError(err.message || "Error al cargar socios.");
    } finally {
      setLoading(false);
    }
  };

  const sociosFiltrados = useMemo(() => {
    return socios.filter((s) => {
      const matchesSearch = !searchTerm || 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id_socio.toString().includes(searchTerm);

      const matchesMembresia = !filterMembresia || s.tipo_membresia === filterMembresia;
      const matchesModalidad = !filterModalidad || s.modalidad === filterModalidad;
      const matchesEstatus = !filterEstatus || s.estatus_financiero === filterEstatus;

      return matchesSearch && matchesMembresia && matchesModalidad && matchesEstatus;
    });
  }, [socios, searchTerm, filterMembresia, filterModalidad, filterEstatus]);

  useEffect(() => {
    cargarTodo();
  }, []);

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
    if (name === 'correo') setCreateError("");
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Error al registrar socio:", result);
        if (result.errors) {
          const mensajes = Object.values(result.errors).flat().join(". ");
          throw new Error(mensajes || result.message || "No se pudo registrar el socio");
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

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
        headers: {
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Error al activar membresía:", result);
        throw new Error(result.message || "No se pudo activar la membresía");
      }

      await cargarTodo();
    } catch (err) {
      console.error("Error al activar membresía:", err);
      setError("Error al activar membresía.");
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
            headers: {
              Accept: "application/json",
            },
          });

          const result = await res.json();

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

  const showCreateVigencia = createFormData.tipo_membresia === "Rentista";
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
      ["inactivo", "suspendido", "adeudo"].includes((s.estatus_financiero || "").toLowerCase())
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Total socios
              </p>
              <p className="mt-1 text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CircleCheckBig size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Vigentes
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.vigentes}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <CircleOff size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Con incidencia
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.inactivos}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <BadgeCheck size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Rentistas
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.rentistas}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#14171c]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 px-6 py-5">
          <div>
            <h2 className="text-3xl font-bold text-white">Directorio de socios</h2>
            {selectedSocios.length > 0 && (
              <p className="mt-1 text-sm text-yellow-400">
                {selectedSocios.length} seleccionado(s)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-gray-800 px-6 py-4 md:grid-cols-4">
            {/* Búsqueda por texto (Ya existente, muévela aquí) */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <UserRoundSearch size={18} />
              </div>
              <input
                type="text"
                placeholder="Nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#0f131a] py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>

            {/* Filtro Membresía */}
            <select
              value={filterMembresia}
              onChange={(e) => setFilterMembresia(e.target.value)}
              className="rounded-xl border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            >
              <option value="">Todas las Membresías</option>
              <option value="Accionista">Accionista</option>
              <option value="Rentista">Rentista</option>
            </select>

            {/* Filtro Modalidad */}
            <select
              value={filterModalidad}
              onChange={(e) => setFilterModalidad(e.target.value)}
              className="rounded-xl border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            >
              <option value="">Todas las Modalidades</option>
              <option value="Individual">Individual</option>
              <option value="Familiar">Familiar</option>
            </select>

            {/* Filtro Estatus */}
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className="rounded-xl border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            >
              <option value="">Todos los Estatus</option>
              <option value="Vigente">Vigente</option>
              <option value="Adeudo">Adeudo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>

      <button
            onClick={cargarTodo}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-[#1b2130] text-gray-300 transition hover:border-gray-600 hover:text-white"
            title="Recargar socios"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

      {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">
            Cargando socios...
          </div>
      ) : socios.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            No hay socios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#14171c]">
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
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
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Apellidos
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Membresía
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Modalidad
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Estatus
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Dependientes
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {sociosFiltrados.map((socio) => {
                  const cantidadDependientes =
                    dependientesPorTitular[socio.id_socio] || 0;

                  return (
                    <tr
                      key={socio.id_socio}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedSocios.includes(socio.id_socio)}
                          onChange={() => toggleSelectSocio(socio.id_socio)}
                          className="h-4 w-4 rounded border-gray-600 bg-[#0f131a] accent-yellow-400"
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-300">
                        {socio.id_socio}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {socio.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {socio.apellidos}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {socio.tipo_membresia}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {socio.modalidad}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            socio.estatus_financiero
                          )}`}
                        >
                          {socio.estatus_financiero}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-300">
                        {cantidadDependientes > 0 ? (
                          <button
                            onClick={() => handleVerDependientes(socio.id_socio)}
                            className="inline-flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                          >
                            <UserRoundSearch size={15} />
                            Ver dependientes ({cantidadDependientes})
                          </button>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 relative">
                        {/* Botón de tres puntos */}
                        <button 
                          onClick={() => setActiveMenu(activeMenu === socio.id_socio ? null : socio.id_socio)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          </svg>
                        </button>

                        {/* Menú Desplegable */}
                        {activeMenu === socio.id_socio && (
                          <>
                            {/* Overlay invisible para cerrar el menú al hacer clic fuera */}
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            
                            <div className="absolute right-10 top-0 z-20 mt-2 w-56 origin-top-right rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none">
                              <div className="py-2">
                                <button
                                  onClick={() => { setViewingSocio(socio); setShowViewModal(true); setActiveMenu(null); }}
                                  className="flex w-full items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                                >
                                  <UserRoundSearch size={16} className="mr-3 text-blue-400" />
                                  Visualizar Información
                                </button>
                                
                                <button
                                  onClick={() => { openEditModal(socio); setActiveMenu(null); }}
                                  className="flex w-full items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                                >
                                  <Pencil size={16} className="mr-3 text-amber-400" />
                                  Editar Socio
                                </button>

                                {socio.es_titular && socio.modalidad === "Familiar" && (
                                  <button
                                    onClick={() => { handleAgregarDependiente(socio.id_socio); setActiveMenu(null); }}
                                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                                  >
                                    <Users size={16} className="mr-3 text-violet-400" />
                                    Añadir dependiente
                                  </button>
                                )}

                                {socio.estatus_financiero !== "Vigente" && (
                                  <button
                                    onClick={() => { handleActivarMembresia(socio.id_socio); setActiveMenu(null); }}
                                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                                  >
                                    <BadgeCheck size={16} className="mr-3 text-emerald-400" />
                                    Activar Membresía
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">Registrar socio</h2>

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
                <label className={`${labelClass} ${createError.toLowerCase().includes('correo') ? 'text-red-400' : ''}`}>Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={createFormData.correo}
                  onChange={handleCreateChange}
                  className={`${fieldBaseClass} ${createError.toLowerCase().includes('correo') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
      {showCheckInModal && (
        <CheckInModal open={true} onClose={() => setShowCheckInModal(false)} />
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">Editar socio</h2>

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
                    <label className={labelClass}>Fecha inicio vigencia</label>
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
      {/* Modal de Visualización Detallada */}
{showViewModal && viewingSocio && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#14171c] p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Ficha del Socio</h2>
          <p className="text-sm text-gray-400">ID: {viewingSocio.id_socio}</p>
        </div>
        <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white transition text-3xl">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="space-y-4 bg-[#0f131a] p-5 rounded-xl border border-gray-800">
          <h3 className="text-blue-400 font-semibold flex items-center gap-2">
            <Users size={18} /> Datos Personales
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest">Nombre Completo</p>
            <p className="text-white font-medium">{viewingSocio.nombre} {viewingSocio.apellidos}</p>
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">Género</p>
            <p className="text-gray-300">{viewingSocio.genero}</p>
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">Fecha de Nacimiento</p>
            <p className="text-gray-300">{viewingSocio.fecha_nacimiento?.slice(0, 10)}</p>
          </div>
        </div>

        {/* Detalles de Membresía */}
        <div className="space-y-4 bg-[#0f131a] p-5 rounded-xl border border-gray-800">
          <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
            <BadgeCheck size={18} /> Membresía
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest">Tipo / Modalidad</p>
            <p className="text-white">{viewingSocio.tipo_membresia} - {viewingSocio.modalidad}</p>
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">Estado Financiero</p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(viewingSocio.estatus_financiero)}`}>
              {viewingSocio.estatus_financiero}
            </span>
            <p className="text-sm text-gray-500 italic uppercase text-[10px] tracking-widest mt-3">Vigencia</p>
            <p className="text-gray-300 text-sm">
              {viewingSocio.fecha_inicio_vigencia?.slice(0, 10)} al {viewingSocio.fecha_fin_vigencia?.slice(0, 10) || 'N/A'}
            </p>
          </div>
        </div>

                {/* Registro de Asistencias (Marcador de posición) */}
                <div className="bg-[#0f131a] p-5 rounded-xl border border-gray-800 flex flex-col">
                  <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-4">
                    <RefreshCcw size={18} /> Historial Asistencias
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-gray-700 rounded-lg p-4">
                    <CircleOff size={32} className="text-gray-700 mb-2" />
                    <p className="text-xs text-gray-500 font-medium italic">No se encontraron registros de asistencias recientes.</p>
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
    </div>
  );
};

export default Socios;
