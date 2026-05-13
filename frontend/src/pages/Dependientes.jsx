import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

const API_DEPENDIENTES = "http://localhost:8000/api/dependientes";
const API_TITULARES = "http://localhost:8000/api/titulares";
const API_SOCIOS = "http://localhost:8000/api/socios";

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

  const titularFiltro = searchParams.get("titular");

  const fetchDependientes = async () => {
    try {
      const res = await fetch(API_DEPENDIENTES, {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "No se pudieron cargar los dependientes");
      }

      setDependientes(result.data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar dependientes.");
    }
  };

  const fetchTitulares = async () => {
    try {
      const res = await fetch(API_TITULARES, {
        headers: { Accept: "application/json" },
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
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchDependientes(), fetchTitulares()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

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

      const res = await fetch(API_SOCIOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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

      const res = await fetch(`${API_SOCIOS}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        throw new Error(result.message || "No se pudo actualizar el dependiente");
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

      const res = await fetch(`${API_SOCIOS}/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {titularFiltro && titularActual && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
          <div className="flex items-center gap-3 text-violet-300">
            <Filter size={18} />
            <div>
              <p className="text-sm font-semibold">Filtro activo por titular</p>
              <p className="text-sm text-violet-200">
                {titularActual.nombre} {titularActual.apellidos} (ID:{" "}
                {titularActual.id_socio})
              </p>
            </div>
          </div>

          <button
            onClick={limpiarFiltroTitular}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-400/20 bg-[#14171c] px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/10"
          >
            <X size={15} />
            Ver todos
          </button>
        </div>
      )}

      {titularFiltroEsIndividual && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          El titular filtrado tiene modalidad <span className="font-semibold">Individual</span>.
          No se le pueden registrar dependientes.
        </div>
      )}

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
                Total dependientes
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.totalDependientes}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Link2 size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Titulares únicos
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.titularesUnicos}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserRound size={24} />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Sin documento
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {stats.sinDocumento}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#14171c]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 px-6 py-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {titularActual
                ? `Dependientes de ${titularActual.nombre}`
                : "Directorio de dependientes"}
            </h2>
          </div>

          <button
            onClick={cargarTodo}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-[#1b2130] text-gray-300 transition hover:border-gray-600 hover:text-white"
            title="Recargar dependientes"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">
            Cargando dependientes...
          </div>
        ) : dependientesFiltrados.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            {titularActual
              ? "Este titular no tiene dependientes registrados."
              : "No hay dependientes registrados."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#14171c]">
                <tr className="border-b border-gray-800 text-left">
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
                    Titular
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
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {dependientesFiltrados.map((dep) => (
                  <tr
                    key={dep.id_socio}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {dep.id_socio}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {dep.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {dep.apellidos}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {getNombreTitular(dep.id_titular_fk)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {dep.tipo_membresia || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {dep.modalidad || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                          dep.estatus_financiero
                        )}`}
                      >
                        {dep.estatus_financiero || "Sin estatus"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(dep)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            handleEliminarDependiente(dep.id_socio, dep.nombre)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 size={15} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                      {titular.nombre} {titular.apellidos} (ID: {titular.id_socio})
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
                      {titular.nombre} {titular.apellidos} (ID: {titular.id_socio})
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