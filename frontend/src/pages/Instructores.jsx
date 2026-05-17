import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { RefreshCcw, ArrowUpDown, Plus } from "lucide-react";

const Instructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "nombre_completo",
    direction: "asc",
  });

  const [formData, setFormData] = useState({
    nombre_completo: "",
    especialidad: "",
    contacto: "",
    id_usuario: 1,
    estatus: "Activo",
  });

  const API_URL = "http://localhost:8000/api/instructors";

  const getInstructores = async () => {
    try {
      const res = await axios.get(API_URL);
      setInstructores(res.data);
    } catch (error) {
      console.error("Error al obtener instructores:", error);
    }
  };

  // useEffect SIEMPRE después de la función que llama
  useEffect(() => {
    const cargar = async () => {
      await getInstructores();
    };
    cargar();
  }, []);

  // Obtener lista única de especialidades para el filtro
  const especialidadesUnicas = useMemo(() => {
    return [...new Set(instructores.map((ins) => ins.especialidad))].filter(
      Boolean,
    );
  }, [instructores]);

  // Lógica de Filtrado y Ordenamiento
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

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [instructores, searchTerm, filterEspecialidad, filterEstatus, sortConfig]);

  const stats = {
    total: filteredInstructors.length,
    activos: filteredInstructors.filter((i) => i.estatus === "Activo").length,
    inactivos: filteredInstructors.filter((i) => i.estatus === "Inactivo")
      .length,
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // --- FUNCIONES DE PERSISTENCIA (FIXED) ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentId}`, formData);
        alert("¡Actualizado con éxito!");
      } else {
        await axios.post(API_URL, formData);
        alert("¡Registrado con éxito!");
      }
      setModalOpen(false);
      resetForm();
      getInstructores();
    } catch (error) {
      console.error(error);
      alert("Error al guardar cambios.");
    }
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

  // Listener para el botón global "Nuevo" del Dashboard
  useEffect(() => {
    const handleOpenModal = () => {
      resetForm();
      setModalOpen(true);
    };
    window.addEventListener("abrir-modal-instructor", handleOpenModal);
    return () =>
      window.removeEventListener("abrir-modal-instructor", handleOpenModal);
  }, []);

  return (
    <div className="p-4 md:p-6 bg-[#0B0E11] min-h-screen text-white">
      {/* Indicadores Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs uppercase font-semibold">
            Total Instructores
          </p>
          <p className="text-3xl font-bold text-[#FACC15]">{stats.total}</p>
        </div>
        <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800 border-l-4 border-l-green-500">
          <p className="text-gray-400 text-xs uppercase font-semibold">
            Activos
          </p>
          <p className="text-3xl font-bold text-green-400">{stats.activos}</p>
        </div>
        <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-xs uppercase font-semibold">
            Inactivos
          </p>
          <p className="text-3xl font-bold text-red-400">{stats.inactivos}</p>
        </div>
      </div>

      {/* Barra de Herramientas: Búsqueda y Filtros */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div               className="flex flex-col sm:flex-row gap-3 flex-1 min-w-[280px]">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="bg-[#161B22] border border-gray-800 p-2.5 rounded-lg text-sm flex-1 focus:border-[#FACC15] outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Filtro de Especialidad */}
          <select
            className="bg-[#161B22] border border-gray-800 p-2.5 rounded-lg text-sm outline-none focus:border-[#FACC15]"
            value={filterEspecialidad}
            onChange={(e) => setFilterEspecialidad(e.target.value)}
          >
            <option value="">Todas las Especialidades</option>
            {especialidadesUnicas.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
          <select
            className="bg-[#161B22] border border-gray-800 p-2.5 rounded-lg text-sm outline-none focus:border-[#FACC15]"
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
          >
            <option value="">Todos los Estatus</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={getInstructores}
            className="p-2.5 bg-[#161B22] border border-gray-800 rounded-lg hover:text-[#FACC15] transition shadow-sm"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-[#161B22] rounded-xl border border-gray-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#0B0E11] text-gray-500 text-xs uppercase border-b border-gray-800">
            <tr>
              <th
                className="p-4 cursor-pointer hover:text-white transition"
                onClick={() => handleSort("nombre_completo")}
              >
                Instructor{" "}
                <ArrowUpDown size={12} className="inline ml-1 opacity-50" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-white transition"
                onClick={() => handleSort("especialidad")}
              >
                Especialidad{" "}
                <ArrowUpDown size={12} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Estatus</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {filteredInstructors.map((ins) => (
              <tr
                key={ins.id_instructor}
                className="hover:bg-gray-800/30 transition"
              >
                <td className="p-4 font-medium">{ins.nombre_completo}</td>
                <td className="p-4 text-gray-400">{ins.especialidad}</td>
                <td className="p-4 text-gray-400 italic">
                  {ins.contacto || "Sin dato"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ins.estatus === "Activo"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {ins.estatus}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => openEdit(ins)}
                    className="text-gray-400 hover:text-[#FACC15] mr-4 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("¿Inactivar a este instructor?")) {
                        await axios.delete(`${API_URL}/${ins.id_instructor}`);
                        getInstructores();
                      }
                    }}
                    className="text-red-900 hover:text-red-500 transition"
                  >
                    Baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro / Edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center backdrop-blur-sm z-50 p-4">
          <div className="bg-[#161B22] p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-[#FACC15]">
              {editMode ? "Editar Perfil" : "Nuevo Instructor"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0B0E11] border border-gray-800 p-3 rounded-lg focus:border-[#FACC15] outline-none transition"
                  value={formData.nombre_completo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_completo: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase">
                  Especialidad
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0B0E11] border border-gray-800 p-3 rounded-lg focus:border-[#FACC15] outline-none transition"
                  value={formData.especialidad}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidad: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase">
                  Contacto (Tel/Email)
                </label>
                <input
                  type="text"
                  className="w-full bg-[#0B0E11] border border-gray-800 p-3 rounded-lg focus:border-[#FACC15] outline-none transition"
                  value={formData.contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, contacto: e.target.value })
                  }
                />
              </div>
              {editMode && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase">
                    Estatus
                  </label>
                  <select
                    className="w-full bg-[#0B0E11] border border-gray-800 p-3 rounded-lg focus:border-[#FACC15] outline-none transition"
                    value={formData.estatus}
                    onChange={(e) =>
                      setFormData({ ...formData, estatus: e.target.value })
                    }
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-white px-4 transition"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="bg-[#FACC15] text-black px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition"
                >
                  {editMode ? "Actualizar" : "Guardar"}
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
