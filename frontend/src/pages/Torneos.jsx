import { useState, useEffect } from "react";
import {
  Trophy,
  MapPin,
  Eye,
  Plus,
  X,
  Edit,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import TorneoDetailsModal from "../components/TorneoDetailsModal";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

const Torneos = () => {
  const { isAdmin } = useRoleSimulator();

  const [torneos, setTorneos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [torneoDetalles, setTorneoDetalles] = useState(null);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

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

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resInst = await fetch("http://127.0.0.1:8000/api/instalaciones");
      if (resInst.ok) {
        const jsonInst = await resInst.json();
        setInstalaciones(jsonInst.data || []);
      }

      const resTorneos = await fetch("http://127.0.0.1:8000/api/torneos");
      if (resTorneos.ok) {
        const jsonTorneos = await resTorneos.json();
        setTorneos(jsonTorneos.data || []);
      }
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

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
    const url = modoEdicion
      ? `http://127.0.0.1:8000/api/torneos/${formData.id_torneo}`
      : "http://127.0.0.1:8000/api/torneos";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("🚨 Error de Base de Datos:\n" + data.message);
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
      await fetch(`http://127.0.0.1:8000/api/torneos/${idTorneo}`, {
        method: "DELETE",
      });
      cargarDatos();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#0f1115] min-h-screen text-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-4xl font-extrabold text-white flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8 md:w-10 md:h-10" />
          Gestión de Torneos
        </h1>

        {isAdmin && (
          <button
            onClick={abrirParaCrear}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Nuevo Torneo
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {torneos.map((t) => (
            <div
              key={t.id_torneo}
              className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-6 hover:border-yellow-400 transition-all group relative"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirParaEditar(t)}
                    className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => eliminarTorneo(t.id_torneo)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {t.categoria}
              </span>

              <h3 className="text-xl font-bold text-white mt-4 mb-4">
                {t.nombre_torneo}
              </h3>

              <div className="flex items-center text-gray-400 gap-3 mb-4">
                <MapPin size={18} className="text-yellow-400" />
                <span>{t.sede?.nombre_especifico || "Sin sede"}</span>
              </div>

              <button
                onClick={() => setTorneoDetalles(t)}
                className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-white border border-gray-700"
              >
                <Eye size={18} />
                Detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdmin && modalFormulario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23]">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <LayoutGrid className="text-yellow-400" />
                Configurar Torneo
              </h2>

              <button onClick={() => setModalFormulario(false)}>
                <X className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={guardarTorneo} className="p-6 space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Nombre del Torneo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_torneo}
                  className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_torneo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Categoría (Según Catálogo)
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                  >
                    <option value="Libre">Libre</option>
                    <option value="Juvenil">Juvenil</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Cancha
                  </label>
                  <select
                    required
                    value={formData.sede_principal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sede_principal: e.target.value,
                      })
                    }
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {instalaciones.map((inst) => (
                      <option key={inst.id_espacio} value={inst.id_espacio}>
                        {inst.nombre_especifico}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.sede_principal && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Deporte
                    </label>
                    <select
                      required
                      value={formData.id_disciplina}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_disciplina: e.target.value,
                          tipo_bracket: "",
                        })
                      }
                      className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                    >
                      <option value="">¿Qué se jugará?</option>
                      <option value="1">Fútbol</option>
                      <option value="2">Básquetbol</option>
                      <option value="3">Tenis</option>
                      <option value="4">Voleibol</option>
                    </select>
                  </div>

                  {formData.id_disciplina && (
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        Formato
                      </label>
                      <select
                        required
                        value={formData.tipo_bracket}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipo_bracket: e.target.value,
                          })
                        }
                        className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-green-400 outline-none"
                      >
                        <option value="">Elige...</option>
                        {formatosPorDeporte[formData.id_disciplina]?.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  className="bg-[#0f1115] border border-gray-700 rounded-lg p-2 text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                />

                <input
                  type="date"
                  required
                  value={formData.fecha_fin}
                  className="bg-[#0f1115] border border-gray-700 rounded-lg p-2 text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_fin: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full font-bold text-lg py-4 rounded-xl shadow-lg mt-4 text-black bg-yellow-400 hover:bg-yellow-500"
              >
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