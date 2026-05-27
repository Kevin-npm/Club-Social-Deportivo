import { useState, useEffect } from "react";
import {
  Trophy,
  MapPin,
  Plus,
  X,
  LayoutGrid,
  Dices,
  GitMerge,
  UserPlus,
  Save,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

const API_URL = "http://127.0.0.1:8000/api/torneos";

const Torneos = () => {
  const { isAdmin } = useRoleSimulator();

  const [torneos, setTorneos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [torneoActivoId, setTorneoActivoId] = useState(null);

  const [modalDetalles, setModalDetalles] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [inscritosLista, setInscritosLista] = useState([]);
  const [equipoAInscribir, setEquipoAInscribir] = useState("");
  const [editandoInscritoId, setEditandoInscritoId] = useState(null);

  const [modalLlaves, setModalLlaves] = useState(false);
  const [llavesData, setLlavesData] = useState([]);
  const [pestanaActiva, setPestañaActiva] = useState("grupos");
  const [scores, setScores] = useState({});
  const [alerta, setAlerta] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    mensaje: "",
    onConfirm: null,
  });

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

  const mostrarAlerta = (msg, tipo = "error") => {
    setAlerta({ msg, tipo });
    setTimeout(() => setAlerta(null), 3500);
  };

  const pedirConfirmacion = (mensaje, accion) => {
    setConfirmDialog({ visible: true, mensaje, onConfirm: accion });
  };

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const resInst = await fetch("http://127.0.0.1:8000/api/instalaciones");
      if (resInst.ok) {
        const dataInst = await resInst.json();
        setInstalaciones(dataInst.data || []);
      }

      const resTorneos = await fetch(API_URL);
      if (resTorneos.ok) {
        const dataTorneos = await resTorneos.json();
        setTorneos(dataTorneos.data || []);
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al cargar torneos");
    } finally {
      setCargando(false);
    }
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

  const abrirParaEditar = (torneo) => {
    if (!isAdmin) return;
    setFormData(torneo);
    setModoEdicion(true);
    setModalFormulario(true);
  };

  const guardarTorneo = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    const method = modoEdicion ? "PUT" : "POST";
    const idTorneo = formData.id_torneo || formData.id;
    const url = modoEdicion ? `${API_URL}/${idTorneo}` : API_URL;

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
        mostrarAlerta(data.message || "Error al guardar torneo");
        return;
      }

      setModalFormulario(false);
      mostrarAlerta(
        modoEdicion ? "Torneo actualizado" : "Torneo guardado",
        "success"
      );
      cargarDatos();
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error de conexión");
    }
  };

  const eliminarTorneo = (id) => {
    if (!isAdmin) return;

    pedirConfirmacion(
      "¿Estás seguro de eliminar todo este torneo y sus registros?",
      async () => {
        try {
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          mostrarAlerta("Torneo eliminado", "success");
          cargarDatos();
        } catch (error) {
          console.error(error);
          mostrarAlerta("Error al eliminar torneo");
        }
      }
    );
  };

  const recargarInscritos = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/inscripciones`);
      const data = await response.json();
      setInscritosLista(data.data || []);
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al cargar inscritos");
    }
  };

  const abrirDetalles = async (torneo) => {
    setTorneoSeleccionado(torneo);
    setTorneoActivoId(torneo.id_torneo);
    await recargarInscritos(torneo.id_torneo);
    setModalDetalles(true);
  };

  const procesarInscripcion = async (e) => {
    e.preventDefault();

    if (!equipoAInscribir) return;

    const url = editandoInscritoId
      ? `http://127.0.0.1:8000/api/inscripciones/${editandoInscritoId}`
      : `${API_URL}/${torneoActivoId}/inscribir`;

    const method = editandoInscritoId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_equipo: equipoAInscribir }),
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarAlerta(data.message || "No se pudo procesar la inscripción");
        return;
      }

      setEquipoAInscribir("");
      setEditandoInscritoId(null);
      recargarInscritos(torneoActivoId);
      cargarDatos();

      mostrarAlerta(
        editandoInscritoId ? "Editado con éxito" : "Inscrito con éxito",
        "success"
      );
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error de conexión");
    }
  };

  const eliminarInscrito = (id) => {
    pedirConfirmacion("¿Dar de baja a este equipo del torneo?", async () => {
      try {
        await fetch(`http://127.0.0.1:8000/api/inscripciones/${id}`, {
          method: "DELETE",
        });

        recargarInscritos(torneoActivoId);
        cargarDatos();
        mostrarAlerta("Equipo dado de baja", "success");
      } catch (error) {
        console.error(error);
        mostrarAlerta("Error al eliminar inscripción");
      }
    });
  };

  const recargarLlavesSilencioso = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/llaves`);
      const data = await response.json();
      setLlavesData(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const generarSorteo = async () => {
    pedirConfirmacion(
      "Generar sorteo borrará el fixture actual y lo hará aleatoriamente. ¿Continuar?",
      async () => {
        try {
          const response = await fetch(`${API_URL}/${torneoActivoId}/sorteo`, {
            method: "POST",
          });

          const data = await response.json();

          if (!response.ok) {
            mostrarAlerta(data.message || "No se pudo generar el sorteo");
            return;
          }

          mostrarAlerta("Sorteo generado", "success");
          recargarLlavesSilencioso(torneoActivoId);
        } catch (error) {
          console.error(error);
          mostrarAlerta("Error en el servidor");
        }
      }
    );
  };

  const verLlaves = async (idTorneo) => {
    setTorneoActivoId(idTorneo);

    try {
      const response = await fetch(`${API_URL}/${idTorneo}/llaves`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        mostrarAlerta("Fixture vacío. Genera el sorteo en Inscritos / Sorteo.");
        return;
      }

      setLlavesData(data.data);
      setPestañaActiva(
        data.data.some((m) => m.fase.includes("Grupo"))
          ? "grupos"
          : "eliminatorias"
      );
      setModalLlaves(true);
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al cargar fixture");
    }
  };

  const handleInputGoles = (idEncuentro, equipo, valor) => {
    const num = valor === "" ? "" : Math.max(0, parseInt(valor) || 0);

    setScores({
      ...scores,
      [idEncuentro]: {
        ...scores[idEncuentro],
        [equipo]: num,
      },
    });
  };

  const guardarMarcador = async (partido) => {
    const score = scores[partido.id] || {};

    const goles1 =
      score.g1 !== undefined && score.g1 !== ""
        ? parseInt(score.g1)
        : partido.goles_1 !== null
        ? partido.goles_1
        : 0;

    const goles2 =
      score.g2 !== undefined && score.g2 !== ""
        ? parseInt(score.g2)
        : partido.goles_2 !== null
        ? partido.goles_2
        : 0;

    const penales1 =
      score.p1 !== undefined && score.p1 !== ""
        ? parseInt(score.p1)
        : partido.penales_1;

    const penales2 =
      score.p2 !== undefined && score.p2 !== ""
        ? parseInt(score.p2)
        : partido.penales_2;

    try {
      await fetch(`http://127.0.0.1:8000/api/encuentros/${partido.id}/marcador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goles_1: goles1,
          goles_2: goles2,
          penales_1: penales1,
          penales_2: penales2,
        }),
      });

      recargarLlavesSilencioso(torneoActivoId);
      mostrarAlerta("Marcador guardado", "success");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al guardar marcador");
    }
  };

  const standings = {};

  llavesData.forEach((partido) => {
    if (
      partido.fase.includes("Grupo") &&
      partido.participante_1 !== "Libre" &&
      partido.participante_2 !== "Libre"
    ) {
      if (!standings[partido.fase]) standings[partido.fase] = {};

      if (!standings[partido.fase][partido.participante_1]) {
        standings[partido.fase][partido.participante_1] = {
          pts: 0,
          pj: 0,
          gf: 0,
          gc: 0,
        };
      }

      if (!standings[partido.fase][partido.participante_2]) {
        standings[partido.fase][partido.participante_2] = {
          pts: 0,
          pj: 0,
          gf: 0,
          gc: 0,
        };
      }

      if (partido.jugado) {
        standings[partido.fase][partido.participante_1].pj++;
        standings[partido.fase][partido.participante_2].pj++;

        standings[partido.fase][partido.participante_1].gf += partido.goles_1;
        standings[partido.fase][partido.participante_1].gc += partido.goles_2;

        standings[partido.fase][partido.participante_2].gf += partido.goles_2;
        standings[partido.fase][partido.participante_2].gc += partido.goles_1;

        if (partido.goles_1 > partido.goles_2) {
          standings[partido.fase][partido.participante_1].pts += 3;
        } else if (partido.goles_2 > partido.goles_1) {
          standings[partido.fase][partido.participante_2].pts += 3;
        } else {
          standings[partido.fase][partido.participante_1].pts += 1;
          standings[partido.fase][partido.participante_2].pts += 1;
        }
      }
    }
  });

  const avanzarAOctavos = () => {
    pedirConfirmacion(
      "¿Clasificar a los 2 mejores de cada grupo a Eliminatorias?",
      async () => {
        const clasificados = [];

        Object.keys(standings).forEach((grupo) => {
          const equipos = Object.entries(standings[grupo]).map(
            ([nombre, stats]) => ({
              nombre,
              ...stats,
            })
          );

          equipos.sort(
            (a, b) => b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc)
          );

          if (equipos[0]) clasificados.push(equipos[0].nombre);
          if (equipos[1]) clasificados.push(equipos[1].nombre);
        });

        try {
          await fetch(`${API_URL}/${torneoActivoId}/clasificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clasificados }),
          });

          recargarLlavesSilencioso(torneoActivoId);
          setPestañaActiva("eliminatorias");
          mostrarAlerta("Fase final generada", "success");
        } catch (error) {
          console.error(error);
          mostrarAlerta("Error al generar fase final");
        }
      }
    );
  };

  const finalMatch = llavesData.find((m) => m.fase === "Final");

  let campeon = null;

  if (finalMatch && finalMatch.jugado) {
    if (finalMatch.goles_1 > finalMatch.goles_2) {
      campeon = finalMatch.participante_1;
    } else if (finalMatch.goles_2 > finalMatch.goles_1) {
      campeon = finalMatch.participante_2;
    } else if (finalMatch.penales_1 !== null && finalMatch.penales_2 !== null) {
      campeon =
        finalMatch.penales_1 > finalMatch.penales_2
          ? finalMatch.participante_1
          : finalMatch.participante_2;
    }
  }

  return (
    <div className="p-4 md:p-6 bg-[#0f1115] min-h-screen text-gray-200 relative">
      {alerta && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
          <div
            className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-white border ${
              alerta.tipo === "success"
                ? "bg-green-600 border-green-400"
                : "bg-red-600 border-red-400"
            }`}
          >
            {alerta.tipo === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {alerta.msg}
          </div>
        </div>
      )}

      {confirmDialog.visible && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="bg-[#1c1f26] border border-gray-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
            <AlertTriangle className="text-yellow-400 w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-6">
              {confirmDialog.mensaje}
            </h3>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setConfirmDialog({
                    visible: false,
                    mensaje: "",
                    onConfirm: null,
                  })
                }
                className="w-1/2 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-white font-bold transition-all"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({
                    visible: false,
                    mensaje: "",
                    onConfirm: null,
                  });
                }}
                className="w-1/2 bg-yellow-500 hover:bg-yellow-400 py-3 rounded-xl text-black font-black transition-all shadow-lg shadow-yellow-500/20"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8" />
          Panel de Torneos
        </h1>

        {isAdmin && (
          <button
            onClick={abrirParaCrear}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold flex gap-2 justify-center"
          >
            <Plus size={20} />
            Nuevo Torneo
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400"></div>
        </div>
      ) : torneos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay torneos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {torneos.map((torneo) => (
            <div
              key={torneo.id_torneo}
              className="bg-[#1a1d23] border border-gray-800 rounded-3xl p-6 hover:border-yellow-400/50 transition-all relative group"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => eliminarTorneo(torneo.id_torneo)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between mb-4 pr-10">
                <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {torneo.categoria}
                </span>

                <span className="text-gray-400 text-sm font-bold">
                  {torneo.inscritos_count || 0} / 32 Equipos
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2">
                {torneo.nombre_torneo}
              </h3>

              <div className="flex items-center text-gray-500 gap-2 mb-6 text-sm">
                <MapPin size={16} className="text-yellow-400" />
                {torneo.sede?.nombre_especifico || "Sin sede"}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => verLlaves(torneo.id_torneo)}
                  className="col-span-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 py-3 rounded-xl font-black flex justify-center gap-2 text-sm uppercase tracking-widest transition-all"
                >
                  <GitMerge size={18} />
                  Fixture Oficial
                </button>

                <button
                  onClick={() => abrirDetalles(torneo)}
                  className="bg-gray-800 hover:bg-gray-700 py-2.5 text-sm rounded-xl font-bold flex justify-center gap-2 text-white border border-gray-700"
                >
                  <UserPlus size={16} />
                  Inscritos / Sorteo
                </button>

                {isAdmin && (
                  <button
                    onClick={() => abrirParaEditar(torneo)}
                    className="bg-gray-800 hover:bg-gray-700 py-2.5 text-sm rounded-xl font-bold flex justify-center gap-2 text-white border border-gray-700"
                  >
                    <Edit size={16} />
                    Configuración
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalDetalles && torneoSeleccionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <UserPlus className="text-yellow-400" />
                Inscripciones
              </h2>

              <button
                onClick={() => setModalDetalles(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                Agregar / Editar equipo
              </h3>

              <form onSubmit={procesarInscripcion} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de equipo..."
                  required
                  value={equipoAInscribir}
                  onChange={(e) => setEquipoAInscribir(e.target.value)}
                  className="flex-1 bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-yellow-400"
                />

                <button
                  type="submit"
                  className={`px-4 rounded-xl font-bold text-white shadow-lg ${
                    editandoInscritoId
                      ? "bg-orange-500"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  {editandoInscritoId ? <Save size={20} /> : <Plus size={20} />}
                </button>

                {editandoInscritoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoInscritoId(null);
                      setEquipoAInscribir("");
                    }}
                    className="bg-gray-700 px-3 rounded-xl text-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </form>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0a0c10] rounded-xl border border-gray-800 p-2 mb-4">
              <h3 className="text-xs font-black text-gray-600 uppercase text-center py-2 mb-2 border-b border-gray-800">
                Equipos Inscritos ({inscritosLista.length})
              </h3>

              {inscritosLista.map((equipo, index) => (
                <div
                  key={equipo.id_participante}
                  className="flex justify-between items-center p-3 hover:bg-gray-800/50 rounded-lg group"
                >
                  <span className="font-bold text-gray-300 text-sm">
                    <span className="text-gray-600 mr-2">{index + 1}.</span>
                    {equipo.nombre_externo}
                  </span>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditandoInscritoId(equipo.id_participante);
                        setEquipoAInscribir(equipo.nombre_externo);
                      }}
                      className="text-orange-400 hover:bg-orange-400/20 p-1.5 rounded-md"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => eliminarInscrito(equipo.id_participante)}
                      className="text-red-500 hover:bg-red-500/20 p-1.5 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={generarSorteo}
                className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                <Dices size={20} />
                Generar Sorteo Real
              </button>
            )}
          </div>
        </div>
      )}

      {modalLlaves && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-2 z-[40] backdrop-blur-sm">
          <div className="bg-[#13161c] border border-gray-800 w-full max-w-7xl h-[95vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0a0c10] flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => setPestañaActiva("grupos")}
                  className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${
                    pestanaActiva === "grupos"
                      ? "border-yellow-400 text-yellow-400"
                      : "border-transparent text-gray-600 hover:text-gray-400"
                  }`}
                >
                  Fase de Grupos
                </button>

                <button
                  onClick={() => setPestañaActiva("eliminatorias")}
                  className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${
                    pestanaActiva === "eliminatorias"
                      ? "border-yellow-400 text-yellow-400"
                      : "border-transparent text-gray-600 hover:text-gray-400"
                  }`}
                >
                  Eliminatorias
                </button>
              </div>

              <button
                onClick={() => setModalLlaves(false)}
                className="text-gray-500 hover:text-white bg-gray-800/50 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {pestanaActiva === "grupos" && (
                <div className="h-full flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 bg-[#0a0c10] border-r border-gray-800 p-6 overflow-y-auto">
                    <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2">
                      <LayoutGrid className="text-yellow-400" />
                      Clasificación
                    </h3>

                    {Object.keys(standings).map((grupo) => {
                      const equipos = Object.entries(standings[grupo])
                        .map(([nombre, stats]) => ({ nombre, ...stats }))
                        .sort(
                          (a, b) =>
                            b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc)
                        );

                      return (
                        <div
                          key={grupo}
                          className="mb-6 bg-[#13161c] rounded-xl border border-gray-800 overflow-hidden shadow-lg"
                        >
                          <div className="bg-gray-800/50 py-2 px-4 font-black text-yellow-400 text-sm uppercase tracking-widest">
                            {grupo}
                          </div>

                          <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 text-xs bg-[#0a0c10] border-b border-gray-800">
                              <tr>
                                <th className="px-4 py-2">Eq</th>
                                <th className="text-center">PJ</th>
                                <th className="text-center">DIF</th>
                                <th className="text-center text-white">PTS</th>
                              </tr>
                            </thead>

                            <tbody>
                              {equipos.map((equipo, index) => (
                                <tr
                                  key={equipo.nombre}
                                  className={`border-b border-gray-800/50 ${
                                    index < 2 ? "bg-green-900/10" : ""
                                  }`}
                                >
                                  <td className="px-4 py-3 font-bold text-gray-200 truncate max-w-[120px]">
                                    {equipo.nombre}
                                  </td>
                                  <td className="text-center text-gray-500">
                                    {equipo.pj}
                                  </td>
                                  <td className="text-center text-gray-500">
                                    {equipo.gf - equipo.gc}
                                  </td>
                                  <td className="text-center font-black text-yellow-400">
                                    {equipo.pts}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}

                    {isAdmin && (
                      <button
                        onClick={avanzarAOctavos}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white shadow-xl mt-4 uppercase tracking-widest text-sm"
                      >
                        Avanzar a Eliminatorias
                      </button>
                    )}
                  </div>

                  <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-[#13161c]">
                    {[1, 2, 3].map((jornada) => (
                      <div key={jornada} className="mb-12">
                        <h3 className="font-black text-2xl text-gray-500 mb-6 border-b border-gray-800 pb-2">
                          Jornada {jornada}
                        </h3>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {llavesData
                            .filter(
                              (partido) =>
                                partido.jornada === jornada &&
                                partido.fase.includes("Grupo")
                            )
                            .map((partido) => (
                              <div
                                key={partido.id}
                                className="bg-[#1a1d23] border border-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-lg"
                              >
                                <div className="flex-1 text-right font-bold text-lg truncate pr-4 text-gray-300">
                                  {partido.participante_1}
                                </div>

                                <div className="flex items-center gap-2 bg-[#0a0c10] px-3 py-2 rounded-xl border border-gray-800 shadow-inner">
                                  {isAdmin ? (
                                    <>
                                      <input
                                        type="number"
                                        min="0"
                                        className="w-8 bg-transparent text-center text-white font-black text-lg outline-none"
                                        defaultValue={
                                          partido.goles_1 !== null
                                            ? partido.goles_1
                                            : ""
                                        }
                                        onChange={(e) =>
                                          handleInputGoles(
                                            partido.id,
                                            "g1",
                                            e.target.value
                                          )
                                        }
                                      />

                                      <span className="text-gray-600">:</span>

                                      <input
                                        type="number"
                                        min="0"
                                        className="w-8 bg-transparent text-center text-white font-black text-lg outline-none"
                                        defaultValue={
                                          partido.goles_2 !== null
                                            ? partido.goles_2
                                            : ""
                                        }
                                        onChange={(e) =>
                                          handleInputGoles(
                                            partido.id,
                                            "g2",
                                            e.target.value
                                          )
                                        }
                                      />

                                      <button
                                        onClick={() => guardarMarcador(partido)}
                                        className="text-blue-500 hover:text-blue-400 p-1"
                                      >
                                        <Save size={18} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="font-black text-white text-lg">
                                      {partido.jugado
                                        ? `${partido.goles_1} - ${partido.goles_2}`
                                        : "VS"}
                                    </span>
                                  )}
                                </div>

                                <div className="flex-1 text-left font-bold text-lg truncate pl-4 text-gray-300">
                                  {partido.participante_2}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pestanaActiva === "eliminatorias" && (
                <div className="p-8 h-full min-w-max overflow-auto flex items-start bg-[#0a0c10]">
                  <div className="flex gap-12 justify-start h-full items-start">
                    {[
                      "Ronda Preliminar",
                      "Octavos",
                      "Cuartos",
                      "Semifinal",
                      "Final",
                    ].map((fase) => {
                      const partidos = llavesData.filter(
                        (partido) => partido.fase === fase
                      );

                      if (partidos.length === 0) return null;

                      return (
                        <div
                          key={fase}
                          className="flex flex-col gap-6 justify-center min-h-full w-80 shrink-0"
                        >
                          <h3 className="text-center font-black text-yellow-400 uppercase tracking-widest mb-2 sticky top-0 bg-[#0a0c10]/80 backdrop-blur-md py-2 z-10">
                            {fase}
                          </h3>

                          {partidos.map((partido) => {
                            const empata =
                              partido.jugado &&
                              partido.goles_1 !== null &&
                              partido.goles_1 === partido.goles_2;

                            const isEditingTie =
                              isAdmin &&
                              (scores[partido.id]?.g1 ?? partido.goles_1) ===
                                (scores[partido.id]?.g2 ?? partido.goles_2) &&
                              (scores[partido.id]?.g1 !== undefined ||
                                partido.goles_1 !== null);

                            return (
                              <div
                                key={partido.id}
                                className="bg-gradient-to-r from-[#1a1d23] to-[#13161c] border border-gray-700 p-4 rounded-2xl flex flex-col shadow-xl relative shrink-0"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold truncate w-32 text-gray-300">
                                    {partido.participante_1}
                                  </span>

                                  {isAdmin ? (
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        partido.goles_1 !== null
                                          ? partido.goles_1
                                          : ""
                                      }
                                      onChange={(e) =>
                                        handleInputGoles(
                                          partido.id,
                                          "g1",
                                          e.target.value
                                        )
                                      }
                                      className="w-10 bg-black/50 text-center rounded border border-gray-700 text-white font-black outline-none py-1"
                                    />
                                  ) : (
                                    <span className="font-black text-white bg-black/50 px-3 py-1 rounded">
                                      {partido.goles_1 ?? "-"}
                                    </span>
                                  )}
                                </div>

                                <div className="border-b border-gray-800 mb-2"></div>

                                <div className="flex justify-between items-center">
                                  <span className="font-bold truncate w-32 text-gray-300">
                                    {partido.participante_2}
                                  </span>

                                  {isAdmin ? (
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        partido.goles_2 !== null
                                          ? partido.goles_2
                                          : ""
                                      }
                                      onChange={(e) =>
                                        handleInputGoles(
                                          partido.id,
                                          "g2",
                                          e.target.value
                                        )
                                      }
                                      className="w-10 bg-black/50 text-center rounded border border-gray-700 text-white font-black outline-none py-1"
                                    />
                                  ) : (
                                    <span className="font-black text-white bg-black/50 px-3 py-1 rounded">
                                      {partido.goles_2 ?? "-"}
                                    </span>
                                  )}
                                </div>

                                {isEditingTie && (
                                  <div className="mt-3 p-2 bg-yellow-400/10 rounded-lg flex justify-between items-center border border-yellow-400/20">
                                    <span className="text-xs font-black text-yellow-400">
                                      PENALES
                                    </span>

                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        defaultValue={
                                          partido.penales_1 !== null
                                            ? partido.penales_1
                                            : ""
                                        }
                                        onChange={(e) =>
                                          handleInputGoles(
                                            partido.id,
                                            "p1",
                                            e.target.value
                                          )
                                        }
                                        className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"
                                      />

                                      <span className="text-gray-500">-</span>

                                      <input
                                        type="number"
                                        min="0"
                                        defaultValue={
                                          partido.penales_2 !== null
                                            ? partido.penales_2
                                            : ""
                                        }
                                        onChange={(e) =>
                                          handleInputGoles(
                                            partido.id,
                                            "p2",
                                            e.target.value
                                          )
                                        }
                                        className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"
                                      />
                                    </div>
                                  </div>
                                )}

                                {!isAdmin && empata && (
                                  <div className="mt-2 text-center text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded py-1 border border-yellow-400/20">
                                    P: {partido.penales_1} -{" "}
                                    {partido.penales_2}
                                  </div>
                                )}

                                {isAdmin &&
                                  !partido.participante_1.includes("TBD") &&
                                  !partido.participante_2.includes("TBD") && (
                                    <button
                                      onClick={() => guardarMarcador(partido)}
                                      className="absolute -right-3 -top-3 bg-blue-600 p-2.5 rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all"
                                    >
                                      <Save size={16} />
                                    </button>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {campeon && (
                      <div className="flex flex-col justify-center items-center ml-12 shrink-0 animate-pulse">
                        <Crown className="text-yellow-400 w-24 h-24 mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]" />

                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center">
                          CAMPEÓN
                        </h2>

                        <div className="mt-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-1 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                          <div className="bg-[#0a0c10] px-10 py-6 rounded-xl">
                            <span className="text-3xl font-black text-white">
                              {campeon}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && modalFormulario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23]">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <LayoutGrid className="text-yellow-400" />
                {modoEdicion ? "Configuración" : "Crear Torneo"}
              </h2>

              <button onClick={() => setModalFormulario(false)}>
                <X className="text-gray-500 hover:text-white" />
              </button>
            </div>

            <form onSubmit={guardarTorneo} className="p-6 space-y-5">
              <input
                type="text"
                placeholder="Nombre oficial"
                required
                value={formData.nombre_torneo}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-400 outline-none font-bold"
                onChange={(e) =>
                  setFormData({ ...formData, nombre_torneo: e.target.value })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  required
                  value={formData.sede_principal}
                  onChange={(e) =>
                    setFormData({ ...formData, sede_principal: e.target.value })
                  }
                  className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none"
                >
                  <option value="">Seleccionar cancha...</option>
                  {instalaciones.map((instalacion) => (
                    <option
                      key={instalacion.id_espacio}
                      value={instalacion.id_espacio}
                    >
                      {instalacion.nombre_especifico}
                    </option>
                  ))}
                </select>

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
                  className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none"
                >
                  <option value="">Disciplina...</option>
                  <option value="1">Fútbol</option>
                  <option value="2">Básquetbol</option>
                  <option value="3">Tenis</option>
                  <option value="4">Voleibol</option>
                </select>

                <select
                  required
                  value={formData.tipo_bracket}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_bracket: e.target.value })
                  }
                  className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white md:col-span-2 outline-none"
                  disabled={!formData.id_disciplina}
                >
                  <option value="">Elige formato...</option>
                  <option value="Liga">Liga / Grupos</option>
                  <option value="Eliminacion directa">
                    Eliminatoria Directa
                  </option>
                </select>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none css-color-scheme-dark"
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_inicio: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_fin}
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none css-color-scheme-dark"
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_fin: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full font-black text-lg py-4 rounded-xl text-black bg-yellow-400 hover:bg-yellow-500 shadow-xl shadow-yellow-500/20 uppercase tracking-widest mt-4"
              >
                Guardar Competición
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Torneos;