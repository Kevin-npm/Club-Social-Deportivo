import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  UserRound,
  RefreshCcw,
  Pencil,
  Trash2,
  Link2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 10;

const initialForm = {
  nombre: "",
  apellidos: "",
  fecha_nacimiento: "",
  genero: "",
  numero_documento: "",
  id_titular_fk: "",
};

const fieldBaseClass =
  "w-full rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400";

const labelClass = "mb-1 block text-sm font-medium text-gray-300";

const Dependientes = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dependientes, setDependientes] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [createFormData, setCreateFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [windowSize, setWindowSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const titularFiltro = searchParams.get("titular");

  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const jsonAuthHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    const check = () => setWindowSize(window.innerWidth < 768 ? 3 : 10);
    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchDependientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dependientes`, {
        headers: authHeaders,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "No se pudieron cargar los dependientes"
        );
      }

      setDependientes(result.data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar dependientes.");
    }
  };

  const fetchTitulares = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/titulares`, {
        headers: authHeaders,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "No se pudieron cargar los titulares");
      }

      setTitulares(result.data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar titulares.");
    }
  };

  const cargarTodo = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchDependientes(), fetchTitulares()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarTodo();
    }
  }, [token]);

  useEffect(() => {
    const handleOpenCreateModal = () => openCreateModal();

    window.addEventListener("open-add-dependiente-modal", handleOpenCreateModal);

    return () => {
      window.removeEventListener(
        "open-add-dependiente-modal",
        handleOpenCreateModal
      );
    };
  }, [titularFiltro, titulares]);

  useEffect(() => {
    setCurrentPage(1);
  }, [titularFiltro]);

  const titularesFamiliares = useMemo(() => {
    return titulares.filter(
      (titular) => (titular.modalidad || "").toLowerCase() === "familiar"
    );
  }, [titulares]);

  const getNombreTitular = (idTitular) => {
    const titular = titulares.find((t) => t.id_socio === Number(idTitular));
    return titular ? `${titular.nombre} ${titular.apellidos}` : "No encontrado";
  };

  const getTitularActual = () => {
    if (!titularFiltro) return null;
    return titulares.find((t) => t.id_socio === Number(titularFiltro)) || null;
  };

  const validarTitularFamiliar = (idTitular) => {
    const titular = titulares.find((t) => t.id_socio === Number(idTitular));

    if (!titular) {
      throw new Error("Debes seleccionar un titular válido.");
    }

    if ((titular.modalidad || "").toLowerCase() !== "familiar") {
      throw new Error(
        `No se puede registrar un dependiente para "${titular.nombre} ${titular.apellidos}" porque su modalidad es Individual.`
      );
    }

    return titular;
  };

  const openCreateModal = () => {
    const titularPreseleccionado =
      titularFiltro &&
      titulares.some(
        (t) =>
          t.id_socio === Number(titularFiltro) &&
          (t.modalidad || "").toLowerCase() === "familiar"
      )
        ? titularFiltro
        : "";

    setCreateFormData({
      ...initialForm,
      id_titular_fk: titularPreseleccionado,
    });

    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData(initialForm);
  };

  const openEditModal = (dependiente) => {
    setEditingId(dependiente.id_socio);

    setEditFormData({
      nombre: dependiente.nombre || "",
      apellidos: dependiente.apellidos || "",
      fecha_nacimiento: dependiente.fecha_nacimiento
        ? dependiente.fecha_nacimiento.slice(0, 10)
        : "",
      genero: dependiente.genero || "",
      numero_documento: dependiente.numero_documento || "",
      id_titular_fk: dependiente.id_titular_fk || "",
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditFormData(initialForm);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDependiente = async (e) => {
    e.preventDefault();

    try {
      setSavingCreate(true);
      setError("");

      validarTitularFamiliar(createFormData.id_titular_fk);

      const payload = {
        nombre: createFormData.nombre,
        apellidos: createFormData.apellidos,
        fecha_nacimiento: createFormData.fecha_nacimiento,
        genero: createFormData.genero,
        numero_documento: createFormData.numero_documento || null,
        id_usuario: null,
        es_titular: false,
        id_titular_fk: Number(createFormData.id_titular_fk),
      };

      const res = await fetch(`${API_BASE_URL}/socios`, {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        throw new Error(result.message || "No se pudo registrar el dependiente");
      }

      await cargarTodo();
      closeCreateModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar dependiente.");
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdateDependiente = async (e) => {
    e.preventDefault();

    try {
      setSavingEdit(true);
      setError("");

      validarTitularFamiliar(editFormData.id_titular_fk);

      const payload = {
        nombre: editFormData.nombre,
        apellidos: editFormData.apellidos,
        fecha_nacimiento: editFormData.fecha_nacimiento,
        genero: editFormData.genero,
        numero_documento: editFormData.numero_documento || null,
        es_titular: false,
        id_titular_fk: Number(editFormData.id_titular_fk),
      };

      const res = await fetch(`${API_BASE_URL}/socios/${editingId}`, {
        method: "PUT",
        headers: jsonAuthHeaders,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        throw new Error(
          result.message || "No se pudo actualizar el dependiente"
        );
      }

      await cargarTodo();
      closeEditModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al actualizar dependiente.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEliminarDependiente = async (id, nombre) => {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar al dependiente "${nombre}"?`
    );

    if (!confirmado) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/socios/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        throw new Error(result.message || "No se pudo eliminar el dependiente");
      }

      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar dependiente.");
    }
  };

  const dependientesFiltrados = useMemo(() => {
    if (!titularFiltro) return dependientes;

    return dependientes.filter(
      (dep) => Number(dep.id_titular_fk) === Number(titularFiltro)
    );
  }, [dependientes, titularFiltro]);

  const totalPages = Math.max(
    1,
    Math.ceil(dependientesFiltrados.length / ITEMS_PER_PAGE)
  );

  const paginatedDependientes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return dependientesFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [dependientesFiltrados, currentPage]);

  const stats = useMemo(() => {
    const totalDependientes = dependientesFiltrados.length;

    const titularesUnicos = new Set(
      dependientesFiltrados
        .map((dep) => dep.id_titular_fk)
        .filter((id) => id !== null && id !== undefined)
    ).size;

    const vigentes = dependientesFiltrados.filter(
      (dep) => (dep.estatus_financiero || "").toLowerCase() === "vigente"
    ).length;

    const sinDocumento = dependientesFiltrados.filter(
      (dep) => !dep.numero_documento || dep.numero_documento.trim() === ""
    ).length;

    return {
      totalDependientes,
      titularesUnicos,
      vigentes,
      sinDocumento,
    };
  }, [dependientesFiltrados]);

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

  const limpiarFiltroTitular = () => {
    setSearchParams({});
  };

  const titularActual = getTitularActual();

  const titularFiltroEsIndividual =
    titularActual &&
    (titularActual.modalidad || "").toLowerCase() !== "familiar";

  const Pagination = ({ current, total, onPageChange, count, winSize = 10 }) => {
    if (total <= 1) return null;

    const curWin = Math.ceil(current / winSize);
    const startP = (curWin - 1) * winSize + 1;
    const endP = Math.min(startP + winSize - 1, total);

    return (
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          {count} registros — Pág. {current} de {total}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, current - winSize))}
            disabled={curWin === 1}
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

          {Array.from({ length: endP - startP + 1 }, (_, i) => startP + i).map(
            (page) => (
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
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(total, current + 1))}
            disabled={current === total}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => onPageChange(Math.min(total, startP + winSize))}
            disabled={endP === total}
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
      {titularFiltro && titularActual && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
          <div className="flex items-center gap-3 text-violet-300">
            <Filter size={16} />

            <div>
              <p className="text-sm font-semibold">Filtro activo por titular</p>
              <p className="text-xs text-violet-200">
                {titularActual.nombre} {titularActual.apellidos} (ID:{" "}
                {titularActual.id_socio})
              </p>
            </div>
          </div>

          <button
            onClick={limpiarFiltroTitular}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-[#14171c] px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/10"
          >
            <X size={14} /> Ver todos
          </button>
        </div>
      )}

      {titularFiltroEsIndividual && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          El titular filtrado tiene modalidad{" "}
          <span className="font-semibold">Individual</span>. No se le pueden
          registrar dependientes.
        </div>
      )}

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
              Total
            </p>
            <p className="text-lg md:text-xl font-bold">
              {stats.totalDependientes}
            </p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-900/30 text-violet-400">
            <Link2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Titulares
            </p>
            <p className="text-lg md:text-xl font-bold">
              {stats.titularesUnicos}
            </p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400">
            <UserRound size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Vigentes
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.vigentes}</p>
          </div>
        </div>

        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-900/30 text-amber-400">
            <Users size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase truncate">
              Sin doc.
            </p>
            <p className="text-lg md:text-xl font-bold">{stats.sinDocumento}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#14171c] rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-gray-800">
          <div>
            <h2 className="text-base md:text-lg font-bold text-white">
              {titularActual
                ? `Dependientes de ${titularActual.nombre}`
                : "Directorio de dependientes"}
            </h2>
          </div>

          <button
            onClick={cargarTodo}
            className="p-1.5 rounded-lg border border-gray-700 bg-[#0f131a] text-gray-300 hover:border-gray-600 hover:text-white transition w-max"
            title="Recargar dependientes"
          >
            <RefreshCcw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            Cargando dependientes...
          </div>
        ) : dependientesFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            {titularActual
              ? "Este titular no tiene dependientes registrados."
              : "No hay dependientes registrados."}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Apellidos</th>
                    <th className="px-4 py-3 font-medium">Titular</th>
                    <th className="px-4 py-3 font-medium">Estatus</th>
                    <th className="px-4 py-3 font-medium text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800">
                  {paginatedDependientes.map((dep, idx) => (
                    <tr
                      key={dep.id_socio}
                      className={`transition-colors ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                      } hover:bg-gray-800/30`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {dep.id_socio}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">
                        {dep.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {dep.apellidos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {getNombreTitular(dep.id_titular_fk)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(
                            dep.estatus_financiero
                          )}`}
                        >
                          {dep.estatus_financiero || "Sin estatus"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setMenuPos({
                              top: rect.bottom + 8,
                              left: rect.right - 192,
                            });
                            setActiveMenu(
                              activeMenu === dep.id_socio
                                ? null
                                : dep.id_socio
                            );
                          }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition mx-auto block"
                        >
                          <Ellipsis size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-800">
              {paginatedDependientes.map((dep) => (
                <div
                  key={dep.id_socio}
                  className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-white">
                        {dep.nombre} {dep.apellidos}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {dep.id_socio}</p>
                    </div>

                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(
                        dep.estatus_financiero
                      )}`}
                    >
                      {dep.estatus_financiero || "Sin estatus"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Titular: {getNombreTitular(dep.id_titular_fk)}
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({
                          top: rect.bottom + 8,
                          left: Math.max(8, rect.right - 192),
                        });
                        setActiveMenu(
                          activeMenu === dep.id_socio ? null : dep.id_socio
                        );
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-full transition"
                    >
                      <Ellipsis size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={setCurrentPage}
              count={dependientesFiltrados.length}
              winSize={windowSize}
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
            ></div>

            <div
              className="fixed z-50 w-48 rounded-xl border border-gray-700 bg-[#1b2130] shadow-xl outline-none"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <div className="py-1.5">
                {(() => {
                  const dep = dependientesFiltrados.find(
                    (d) => d.id_socio === activeMenu
                  );

                  if (!dep) return null;

                  return (
                    <>
                      <button
                        onClick={() => {
                          openEditModal(dep);
                          setActiveMenu(null);
                          setMenuPos(null);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        <Pencil size={15} className="mr-3 text-amber-400" />
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          handleEliminarDependiente(dep.id_socio, dep.nombre);
                          setActiveMenu(null);
                          setMenuPos(null);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        <Trash2 size={15} className="mr-3 text-red-400" />
                        Eliminar
                      </button>
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
              Registrar dependiente
            </h2>

            <form
              onSubmit={handleCreateDependiente}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className={labelClass}>Titular</label>
                <select
                  name="id_titular_fk"
                  value={createFormData.id_titular_fk}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona un titular</option>
                  {titularesFamiliares.map((titular) => (
                    <option key={titular.id_socio} value={titular.id_socio}>
                      {titular.nombre} {titular.apellidos} (ID:{" "}
                      {titular.id_socio})
                    </option>
                  ))}
                </select>
              </div>

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
                <label className={labelClass}>Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={createFormData.fecha_nacimiento}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Género</label>
                <select
                  name="genero"
                  value={createFormData.genero}
                  onChange={handleCreateChange}
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

              <div className="md:col-span-2">
                <label className={labelClass}>Número de documento</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={createFormData.numero_documento}
                  onChange={handleCreateChange}
                  className={fieldBaseClass}
                />
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
                  disabled={savingCreate || titularesFamiliares.length === 0}
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {savingCreate ? "Guardando..." : "Registrar dependiente"}
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
              Editar dependiente
            </h2>

            <form
              onSubmit={handleUpdateDependiente}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className={labelClass}>Titular</label>
                <select
                  name="id_titular_fk"
                  value={editFormData.id_titular_fk}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                  required
                >
                  <option value="">Selecciona un titular</option>
                  {titularesFamiliares.map((titular) => (
                    <option key={titular.id_socio} value={titular.id_socio}>
                      {titular.nombre} {titular.apellidos} (ID:{" "}
                      {titular.id_socio})
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="md:col-span-2">
                <label className={labelClass}>Número de documento</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={editFormData.numero_documento}
                  onChange={handleEditChange}
                  className={fieldBaseClass}
                />
              </div>

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
                  disabled={savingEdit || titularesFamiliares.length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dependientes;