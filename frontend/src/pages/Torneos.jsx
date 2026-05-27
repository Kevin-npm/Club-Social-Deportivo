import { useState, useEffect, useMemo, useCallback } from "react";
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
<<<<<<< HEAD

import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const API_TORNEOS = `${API_BASE_URL}/torneos`;
const API_INSCRIPCIONES = `${API_BASE_URL}/inscripciones`;
const API_ENCUENTROS = `${API_BASE_URL}/encuentros`;

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

const Torneos = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

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
=======
import { useRoleSimulator } from "../context/RoleSimulatorContext";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const Torneos = () => {
  const { isAdmin } = useRoleSimulator();
  const { token } = useAuth();

  const authHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const jsonAuthHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
>>>>>>> origin/main

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
  const [pestanaActiva, setPestanaActiva] = useState("grupos");
  const [scores, setScores] = useState({});
  const [alerta, setAlerta] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    mensaje: "",
    onConfirm: null,
  });

  const [formData, setFormData] = useState(estadoInicial);

<<<<<<< HEAD
  const parseJsonResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`El servidor no respondió con JSON válido. HTTP ${response.status}`);
    }
=======
  const formatosPorDeporte = {
    "1": [
      { value: "Liga", label: "Liga / Grupos" },
      { value: "Eliminacion directa", label: "Eliminatoria Directa" },
    ],
    "2": [
      { value: "Liga", label: "Temporada" },
      { value: "Eliminacion directa", label: "Playoffs" },
    ],
    "3": [
      { value: "Round Robin", label: "Grupos Round Robin" },
      { value: "Eliminacion directa", label: "Llaves Singles" },
    ],
    "4": [
      { value: "Liga", label: "Liga Voley" },
      { value: "Eliminacion directa", label: "Torneo Relámpago" },
    ],
>>>>>>> origin/main
  };

  const mostrarAlerta = (msg, tipo = "error") => {
    setAlerta({ msg, tipo });
    setTimeout(() => setAlerta(null), 3500);
  };

  const pedirConfirmacion = (mensaje, accion) => {
    setConfirmDialog({
      visible: true,
      mensaje,
      onConfirm: accion,
    });
  };

  const cargarDatos = useCallback(async () => {
    if (!token) return;

    setCargando(true);

    try {
<<<<<<< HEAD
      const [resInst, resTorneos] = await Promise.all([
        fetch(`${API_BASE_URL}/instalaciones`, {
          headers: authHeaders,
        }),
        fetch(API_TORNEOS, {
          headers: authHeaders,
        }),
      ]);

      const dataInst = await parseJsonResponse(resInst);
      const dataTorneos = await parseJsonResponse(resTorneos);

      if (!resInst.ok) {
        throw new Error(dataInst.message || "No se pudieron cargar las instalaciones.");
      }

      if (!resTorneos.ok) {
        throw new Error(dataTorneos.message || "No se pudieron cargar los torneos.");
=======
      const resInst = await fetch(`${API_BASE_URL}/instalaciones`, {
        headers: authHeaders,
      });

      if (resInst.ok) {
        const dataInst = await resInst.json();
        setInstalaciones(dataInst.data || []);
      }

      const resTorneos = await fetch(`${API_BASE_URL}/torneos`, {
        headers: authHeaders,
      });

      if (resTorneos.ok) {
        const dataTorneos = await resTorneos.json();
        setTorneos(dataTorneos.data || []);
>>>>>>> origin/main
      }

      setInstalaciones(dataInst.data || []);
      setTorneos(dataTorneos.data || []);
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      mostrarAlerta(error.message || "Error al cargar torneos");
    } finally {
      setCargando(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirParaCrear = () => {
    if (!isAdmin) return;

    setFormData(estadoInicial);
    setModoEdicion(false);
    setModalFormulario(true);
  };

  const abrirParaEditar = (torneo) => {
    if (!isAdmin) return;

    setFormData({
      nombre_torneo: torneo.nombre_torneo || "",
      categoria: torneo.categoria || "Libre",
      sede_principal: torneo.sede_principal || torneo.id_espacio || "",
      id_disciplina: torneo.id_disciplina || "",
      tipo_bracket: torneo.tipo_bracket || "",
      tipo: torneo.tipo || "Local",
      fecha_inicio: torneo.fecha_inicio || "",
      fecha_fin: torneo.fecha_fin || "",
      id_torneo: torneo.id_torneo,
    });

=======
    }

    setCargando(false);
  };

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token]);

  const abrirParaEditar = (t) => {
    setFormData(t);
>>>>>>> origin/main
    setModoEdicion(true);
    setModalFormulario(true);
  };

  const guardarTorneo = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    const method = modoEdicion ? "PUT" : "POST";
<<<<<<< HEAD
    const idTorneo = formData.id_torneo || formData.id;
    const url = modoEdicion ? `${API_TORNEOS}/${idTorneo}` : API_TORNEOS;
=======

    const url = modoEdicion
      ? `${API_BASE_URL}/torneos/${formData.id_torneo || formData.id}`
      : `${API_BASE_URL}/torneos`;
>>>>>>> origin/main

    try {
      const res = await fetch(url, {
        method,
<<<<<<< HEAD
        headers: authJsonHeaders,
        body: JSON.stringify(formData),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        mostrarAlerta(data.message || "Error al guardar torneo");
        return;
      }
=======
        headers: jsonAuthHeaders,
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
>>>>>>> origin/main

      setModalFormulario(false);
      mostrarAlerta(modoEdicion ? "Torneo actualizado" : "Torneo guardado", "success");
      await cargarDatos();
    } catch (error) {
<<<<<<< HEAD
      console.error(error);
      mostrarAlerta(error.message || "Error de conexión");
=======
      mostrarAlerta("Error al guardar torneo");
>>>>>>> origin/main
    }
  };

  const eliminarTorneo = (id) => {
    pedirConfirmacion(
      "¿Estás seguro de eliminar todo este torneo y sus registros?",
      async () => {
<<<<<<< HEAD
        try {
          const response = await fetch(`${API_TORNEOS}/${id}`, {
            method: "DELETE",
            headers: authHeaders,
          });

          const data = await parseJsonResponse(response);

          if (!response.ok) {
            mostrarAlerta(data.message || "Error al eliminar torneo");
            return;
          }

          mostrarAlerta("Torneo eliminado", "success");
          await cargarDatos();
        } catch (error) {
          console.error(error);
          mostrarAlerta(error.message || "Error al eliminar torneo");
        }
=======
        await fetch(`${API_BASE_URL}/torneos/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });

        mostrarAlerta("Torneo eliminado", "success");
        cargarDatos();
>>>>>>> origin/main
      }
    );
  };

<<<<<<< HEAD
  const recargarInscritos = async (id) => {
    try {
      const response = await fetch(`${API_TORNEOS}/${id}/inscripciones`, {
        headers: authHeaders,
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        mostrarAlerta(data.message || "Error al cargar inscritos");
        return;
      }

      setInscritosLista(data.data || []);
    } catch (error) {
      console.error(error);
      mostrarAlerta(error.message || "Error al cargar inscritos");
    }
=======
  const abrirDetalles = async (t) => {
    setTorneoSeleccionado(t);
    setTorneoActivoId(t.id_torneo);
    await recargarInscritos(t.id_torneo);
    setModalDetalles(true);
>>>>>>> origin/main
  };

  const recargarInscritos = async (id) => {
    const res = await fetch(`${API_BASE_URL}/torneos/${id}/inscripciones`, {
      headers: authHeaders,
    });
    const data = await res.json();
    setInscritosLista(data.data || []);
  };

  const procesarInscripcion = async (e) => {
    e.preventDefault();

    if (!equipoAInscribir) return;

    const url = editandoInscritoId
<<<<<<< HEAD
      ? `${API_INSCRIPCIONES}/${editandoInscritoId}`
      : `${API_TORNEOS}/${torneoActivoId}/inscribir`;
=======
      ? `${API_BASE_URL}/inscripciones/${editandoInscritoId}`
      : `${API_BASE_URL}/torneos/${torneoActivoId}/inscribir`;
>>>>>>> origin/main

    const method = editandoInscritoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
<<<<<<< HEAD
        headers: authJsonHeaders,
        body: JSON.stringify({ nombre_equipo: equipoAInscribir }),
      });

      const data = await parseJsonResponse(response);
=======
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          nombre_equipo: equipoAInscribir,
        }),
      });

      const data = await res.json();
>>>>>>> origin/main

      if (!res.ok) {
        mostrarAlerta(data.message);
      } else {
        setEquipoAInscribir("");
        setEditandoInscritoId(null);
        recargarInscritos(torneoActivoId);
        cargarDatos();
        mostrarAlerta(
          editandoInscritoId ? "Editado con éxito" : "Inscrito con éxito",
          "success"
        );
      }
<<<<<<< HEAD

      setEquipoAInscribir("");
      setEditandoInscritoId(null);
      await recargarInscritos(torneoActivoId);
      await cargarDatos();

      mostrarAlerta(
        editandoInscritoId ? "Editado con éxito" : "Inscrito con éxito",
        "success"
      );
    } catch (error) {
      console.error(error);
      mostrarAlerta(error.message || "Error de conexión");
=======
    } catch (error) {
      mostrarAlerta("Error de conexión");
>>>>>>> origin/main
    }
  };

  const eliminarInscrito = (id) => {
    pedirConfirmacion("¿Dar de baja a este equipo del torneo?", async () => {
<<<<<<< HEAD
      try {
        const response = await fetch(`${API_INSCRIPCIONES}/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
          mostrarAlerta(data.message || "Error al eliminar inscripción");
          return;
        }

        await recargarInscritos(torneoActivoId);
        await cargarDatos();
        mostrarAlerta("Equipo dado de baja", "success");
      } catch (error) {
        console.error(error);
        mostrarAlerta(error.message || "Error al eliminar inscripción");
      }
=======
      await fetch(`${API_BASE_URL}/inscripciones/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      recargarInscritos(torneoActivoId);
      cargarDatos();
      mostrarAlerta("Equipo dado de baja", "success");
>>>>>>> origin/main
    });
  };

  const recargarLlavesSilencioso = async (id) => {
<<<<<<< HEAD
    try {
      const response = await fetch(`${API_TORNEOS}/${id}/llaves`, {
        headers: authHeaders,
      });

      const data = await parseJsonResponse(response);

      if (response.ok) {
        setLlavesData(data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
=======
    const res = await fetch(`${API_BASE_URL}/torneos/${id}/llaves`, {
      headers: authHeaders,
    });
    const data = await res.json();
    setLlavesData(data.data || []);
>>>>>>> origin/main
  };

  const generarSorteo = async () => {
    pedirConfirmacion(
      "Generar sorteo borrará el fixture actual y lo hará aleatoriamente. ¿Continuar?",
      async () => {
        try {
<<<<<<< HEAD
          const response = await fetch(`${API_TORNEOS}/${torneoActivoId}/sorteo`, {
            method: "POST",
            headers: authHeaders,
          });

          const data = await parseJsonResponse(response);
=======
          const res = await fetch(
            `${API_BASE_URL}/torneos/${torneoActivoId}/sorteo`,
            {
              method: "POST",
              headers: authHeaders,
            }
          );

          const data = await res.json();
>>>>>>> origin/main

          if (!res.ok) {
            mostrarAlerta(data.message);
          } else {
            mostrarAlerta("Sorteo generado", "success");
            recargarLlavesSilencioso(torneoActivoId);
          }
<<<<<<< HEAD

          mostrarAlerta("Sorteo generado", "success");
          await recargarLlavesSilencioso(torneoActivoId);
        } catch (error) {
          console.error(error);
          mostrarAlerta(error.message || "Error en el servidor");
=======
        } catch (error) {
          mostrarAlerta("Error en el servidor");
>>>>>>> origin/main
        }
      }
    );
  };

  const verLlaves = async (idTorneo) => {
    setTorneoActivoId(idTorneo);

    try {
<<<<<<< HEAD
      const response = await fetch(`${API_TORNEOS}/${idTorneo}/llaves`, {
        headers: authHeaders,
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        mostrarAlerta(data.message || "Error al cargar fixture");
        return;
      }
=======
      const res = await fetch(`${API_BASE_URL}/torneos/${idTorneo}/llaves`, {
        headers: authHeaders,
      });

      const data = await res.json();
>>>>>>> origin/main

      if (!data.data || data.data.length === 0) {
        return mostrarAlerta(
          "Fixture vacío. Genera el sorteo en 'Inscritos / Sorteo'."
        );
      }

      setLlavesData(data.data);
      setPestanaActiva(
        data.data.some((m) => m.fase?.includes("Grupo")) ? "grupos" : "eliminatorias"
      );
      setModalLlaves(true);
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      mostrarAlerta(error.message || "Error al cargar fixture");
=======
>>>>>>> origin/main
    }
  };

  const handleInputGoles = (idEncuentro, equipo, valor) => {
    const num = valor === "" ? "" : Math.max(0, parseInt(valor, 10) || 0);

    setScores((prev) => ({
      ...prev,
      [idEncuentro]: {
        ...prev[idEncuentro],
        [equipo]: num,
      },
    }));
  };

  const guardarMarcador = async (m) => {
    const score = scores[m.id] || {};

    const g1 =
      score.g1 !== undefined && score.g1 !== ""
<<<<<<< HEAD
        ? parseInt(score.g1, 10)
        : partido.goles_1 !== null
        ? partido.goles_1
=======
        ? parseInt(score.g1)
        : m.goles_1 !== null
        ? m.goles_1
>>>>>>> origin/main
        : 0;

    const g2 =
      score.g2 !== undefined && score.g2 !== ""
<<<<<<< HEAD
        ? parseInt(score.g2, 10)
        : partido.goles_2 !== null
        ? partido.goles_2
        : 0;

    const penales1 =
      score.p1 !== undefined && score.p1 !== "" ? parseInt(score.p1, 10) : partido.penales_1;

    const penales2 =
      score.p2 !== undefined && score.p2 !== "" ? parseInt(score.p2, 10) : partido.penales_2;

    try {
      const response = await fetch(`${API_ENCUENTROS}/${partido.id}/marcador`, {
        method: "POST",
        headers: authJsonHeaders,
=======
        ? parseInt(score.g2)
        : m.goles_2 !== null
        ? m.goles_2
        : 0;

    const p1 =
      score.p1 !== undefined && score.p1 !== ""
        ? parseInt(score.p1)
        : m.penales_1;

    const p2 =
      score.p2 !== undefined && score.p2 !== ""
        ? parseInt(score.p2)
        : m.penales_2;

    try {
      await fetch(`${API_BASE_URL}/encuentros/${m.id}/marcador`, {
        method: "POST",
        headers: jsonAuthHeaders,
>>>>>>> origin/main
        body: JSON.stringify({
          goles_1: g1,
          goles_2: g2,
          penales_1: p1,
          penales_2: p2,
        }),
      });

<<<<<<< HEAD
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        mostrarAlerta(data.message || "Error al guardar marcador");
        return;
      }

      await recargarLlavesSilencioso(torneoActivoId);
      mostrarAlerta("Marcador guardado", "success");
    } catch (error) {
      console.error(error);
      mostrarAlerta(error.message || "Error al guardar marcador");
=======
      recargarLlavesSilencioso(torneoActivoId);
      mostrarAlerta("Marcador Guardado", "success");
    } catch (error) {
      mostrarAlerta("Error al guardar");
>>>>>>> origin/main
    }
  };

  const standings = {};

  llavesData.forEach((m) => {
    if (
<<<<<<< HEAD
      partido.fase?.includes("Grupo") &&
      partido.participante_1 !== "Libre" &&
      partido.participante_2 !== "Libre"
=======
      m.fase.includes("Grupo") &&
      m.participante_1 !== "Libre" &&
      m.participante_2 !== "Libre"
>>>>>>> origin/main
    ) {
      if (!standings[m.fase]) standings[m.fase] = {};

      if (!standings[m.fase][m.participante_1]) {
        standings[m.fase][m.participante_1] = {
          pts: 0,
          pj: 0,
          gf: 0,
          gc: 0,
        };
      }

      if (!standings[m.fase][m.participante_2]) {
        standings[m.fase][m.participante_2] = {
          pts: 0,
          pj: 0,
          gf: 0,
          gc: 0,
        };
      }

<<<<<<< HEAD
      if (partido.jugado) {
        standings[partido.fase][partido.participante_1].pj += 1;
        standings[partido.fase][partido.participante_2].pj += 1;

        standings[partido.fase][partido.participante_1].gf += partido.goles_1 || 0;
        standings[partido.fase][partido.participante_1].gc += partido.goles_2 || 0;

        standings[partido.fase][partido.participante_2].gf += partido.goles_2 || 0;
        standings[partido.fase][partido.participante_2].gc += partido.goles_1 || 0;
=======
      if (m.jugado) {
        standings[m.fase][m.participante_1].pj++;
        standings[m.fase][m.participante_2].pj++;

        standings[m.fase][m.participante_1].gf += m.goles_1;
        standings[m.fase][m.participante_1].gc += m.goles_2;

        standings[m.fase][m.participante_2].gf += m.goles_2;
        standings[m.fase][m.participante_2].gc += m.goles_1;
>>>>>>> origin/main

        if (m.goles_1 > m.goles_2) {
          standings[m.fase][m.participante_1].pts += 3;
        } else if (m.goles_2 > m.goles_1) {
          standings[m.fase][m.participante_2].pts += 3;
        } else {
          standings[m.fase][m.participante_1].pts += 1;
          standings[m.fase][m.participante_2].pts += 1;
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
<<<<<<< HEAD
          const equipos = Object.entries(standings[grupo]).map(([nombre, stats]) => ({
            nombre,
            ...stats,
          }));
=======
          const equipos = Object.entries(standings[grupo]).map(
            ([nom, stats]) => ({
              nom,
              ...stats,
            })
          );
>>>>>>> origin/main

          equipos.sort((a, b) => b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc));

          if (equipos[0]) clasificados.push(equipos[0].nom);
          if (equipos[1]) clasificados.push(equipos[1].nom);
        });

<<<<<<< HEAD
        try {
          const response = await fetch(`${API_TORNEOS}/${torneoActivoId}/clasificar`, {
            method: "POST",
            headers: authJsonHeaders,
            body: JSON.stringify({ clasificados }),
          });

          const data = await parseJsonResponse(response);

          if (!response.ok) {
            mostrarAlerta(data.message || "Error al generar fase final");
            return;
          }

          await recargarLlavesSilencioso(torneoActivoId);
          setPestanaActiva("eliminatorias");
          mostrarAlerta("Fase final generada", "success");
        } catch (error) {
          console.error(error);
          mostrarAlerta(error.message || "Error al generar fase final");
        }
=======
        await fetch(`${API_BASE_URL}/torneos/${torneoActivoId}/clasificar`, {
            method: "POST",
            headers: jsonAuthHeaders,
            body: JSON.stringify({
              clasificados,
            }),
          }
        );

        recargarLlavesSilencioso(torneoActivoId);
        setPestañaActiva("eliminatorias");
        mostrarAlerta("Fase Final Generada", "success");
>>>>>>> origin/main
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

  const fasesEliminatorias = [
    "Ronda Preliminar",
    "Octavos",
    "Cuartos",
    "Semifinal",
    "Final",
  ];

  const renderPartidoEliminatoria = (m, modoMovil = false) => {
    const empata =
      m.jugado && m.goles_1 !== null && m.goles_1 === m.goles_2;

    const isEditingTie =
      isAdmin &&
      ((scores[m.id]?.g1 ?? m.goles_1) ===
        (scores[m.id]?.g2 ?? m.goles_2)) &&
      (scores[m.id]?.g1 !== undefined || m.goles_1 !== null);

    return (
      <div
        key={m.id}
        className="bg-gradient-to-r from-[#171a20] to-[#11141a] border border-gray-700/80 p-3 sm:p-4 rounded-[22px] flex flex-col shadow-xl relative shrink-0"
      >
        <div className="flex justify-between items-center mb-2 gap-3">
          <span
            className={`font-bold text-[13px] sm:text-base truncate ${
              modoMovil ? "w-full" : "w-24 sm:w-32"
            } ${
              m.jugado &&
              (m.goles_1 > m.goles_2 || m.penales_1 > m.penales_2)
                ? "text-green-400"
                : "text-gray-300"
            }`}
          >
            {m.participante_1}
          </span>

          {isAdmin ? (
            <input
              type="number"
              min="0"
              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
              defaultValue={m.goles_1 !== null ? m.goles_1 : ""}
              onChange={(e) => handleInputGoles(m.id, "g1", e.target.value)}
              className="w-9 bg-black/50 text-center rounded-xl border border-gray-700 text-white font-black outline-none py-1 text-[13px] sm:text-base shrink-0"
            />
          ) : (
            <span className="font-black text-white bg-black/50 px-3 py-1 rounded-xl text-[13px] sm:text-base shrink-0">
              {m.goles_1 ?? "-"}
            </span>
          )}
        </div>

        <div className="border-b border-gray-800 mb-2"></div>

        <div className="flex justify-between items-center gap-3">
          <span
            className={`font-bold text-[13px] sm:text-base truncate ${
              modoMovil ? "w-full" : "w-24 sm:w-32"
            } ${
              m.jugado &&
              (m.goles_2 > m.goles_1 || m.penales_2 > m.penales_1)
                ? "text-green-400"
                : "text-gray-300"
            }`}
          >
            {m.participante_2}
          </span>

          {isAdmin ? (
            <input
              type="number"
              min="0"
              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
              defaultValue={m.goles_2 !== null ? m.goles_2 : ""}
              onChange={(e) => handleInputGoles(m.id, "g2", e.target.value)}
              className="w-9 bg-black/50 text-center rounded-xl border border-gray-700 text-white font-black outline-none py-1 text-[13px] sm:text-base shrink-0"
            />
          ) : (
            <span className="font-black text-white bg-black/50 px-3 py-1 rounded-xl text-[13px] sm:text-base shrink-0">
              {m.goles_2 ?? "-"}
            </span>
          )}
        </div>

        {isEditingTie && (
          <div className="mt-3 p-2 bg-yellow-400/10 rounded-xl flex justify-between items-center border border-yellow-400/20">
            <span className="text-[10px] sm:text-xs font-black text-yellow-400">
              PENALES
            </span>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                defaultValue={m.penales_1 !== null ? m.penales_1 : ""}
                onChange={(e) => handleInputGoles(m.id, "p1", e.target.value)}
                className="w-8 bg-black/50 text-center rounded-xl border border-yellow-400/30 text-yellow-400 font-bold outline-none text-xs sm:text-sm"
              />

              <span className="text-gray-500">-</span>

              <input
                type="number"
                min="0"
                defaultValue={m.penales_2 !== null ? m.penales_2 : ""}
                onChange={(e) => handleInputGoles(m.id, "p2", e.target.value)}
                className="w-8 bg-black/50 text-center rounded-xl border border-yellow-400/30 text-yellow-400 font-bold outline-none text-xs sm:text-sm"
              />
            </div>
          </div>
        )}

        {!isAdmin && empata && (
          <div className="mt-2 text-center text-[10px] sm:text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded-xl py-1 border border-yellow-400/20">
            P: {m.penales_1} - {m.penales_2}
          </div>
        )}

        {isAdmin &&
          !m.participante_1.includes("TBD") &&
          !m.participante_2.includes("TBD") && (
            <button
              onClick={() => guardarMarcador(m)}
              className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 bg-blue-600 p-2 sm:p-2.5 rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
            </button>
          )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 md:p-6 bg-[#0f1115] min-h-screen text-gray-200 relative">
      {alerta && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce px-4 w-full max-w-md">
          <div
            className={`px-5 py-3 rounded-full shadow-2xl flex items-center justify-center gap-3 font-bold text-white border text-sm sm:text-base ${
              alerta.tipo === "success"
                ? "bg-green-600 border-green-400"
                : "bg-red-600 border-red-400"
            }`}
          >
<<<<<<< HEAD
            {alerta.tipo === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
=======
            {alerta.tipo === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}

>>>>>>> origin/main
            {alerta.msg}
          </div>
        </div>
      )}

      {confirmDialog.visible && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="bg-[#1c1f26] border border-gray-700 w-full max-w-sm rounded-[28px] p-6 shadow-2xl text-center">
            <AlertTriangle className="text-yellow-400 w-16 h-16 mx-auto mb-4" />

            <h3 className="text-lg sm:text-xl font-black text-white mb-6">
              {confirmDialog.mensaje}
            </h3>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDialog({ visible: false })}
                className="w-1/2 bg-gray-800 hover:bg-gray-700 py-3 rounded-2xl text-white font-bold transition-all"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({ visible: false });
                }}
                className="w-1/2 bg-yellow-500 hover:bg-yellow-400 py-3 rounded-2xl text-black font-black transition-all shadow-lg shadow-yellow-500/20"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <Trophy className="text-yellow-400 w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          Panel de Torneos
        </h1>

        {isAdmin && (
          <button
            onClick={() => {
              setFormData(estadoInicial);
              setModoEdicion(false);
              setModalFormulario(true);
            }}
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-2xl font-bold flex justify-center items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Torneo
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {torneos.map((t) => (
            <div
              key={t.id_torneo}
              className="bg-[#171a20] border border-gray-800/80 rounded-[26px] p-4 sm:p-5 hover:border-yellow-400/50 transition-all relative group flex flex-col h-full shadow-[0_10px_35px_rgba(0,0,0,0.25)]"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => eliminarTorneo(t.id_torneo)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pr-10">
                <span className="bg-yellow-400/10 text-yellow-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                  {t.categoria}
                </span>

                <span className="text-gray-400 text-[13px] font-bold">
                  {t.inscritos_count} / 32 Equipos
                </span>
              </div>

              <h3 className="text-[17px] sm:text-xl font-black text-white mb-2 leading-snug tracking-tight">
                {t.nombre_torneo}
              </h3>

              <div className="flex items-center text-gray-500 gap-2 mb-5 text-[13px] sm:text-sm">
                <MapPin size={15} className="text-yellow-400 shrink-0" />
                <span className="truncate">
                  {t.sede?.nombre_especifico || "Sin sede"}
                </span>
              </div>

              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                <button
                  onClick={() => verLlaves(t.id_torneo)}
                  className="sm:col-span-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 py-2.5 rounded-2xl font-black flex justify-center items-center gap-2 text-[13px] uppercase tracking-widest transition-all"
                >
                  <GitMerge size={17} />
                  Partido Oficial
                </button>

                <button
                  onClick={() => abrirDetalles(t)}
                  className="bg-[#202837] hover:bg-gray-700 py-2.5 text-[13px] rounded-2xl font-bold flex justify-center items-center gap-2 text-white border border-gray-700/80"
                >
                  <UserPlus size={15} />
                  Inscritos / Sorteo
                </button>

                {isAdmin && (
                  <button
                    onClick={() => abrirParaEditar(t)}
                    className="bg-[#202837] hover:bg-gray-700 py-2.5 text-[13px] rounded-2xl font-bold flex justify-center items-center gap-2 text-white border border-gray-700/80"
                  >
                    <Edit size={15} />
                    Configuración
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalDetalles && torneoSeleccionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 sm:p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1a1d23] border border-gray-800 w-full max-w-[390px] sm:max-w-lg rounded-[30px] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-4">
              <h2 className="text-[22px] sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
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
                Agregar / Editar Max 32
              </h3>

              <form onSubmit={procesarInscripcion} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de Equipo..."
                  required
                  value={equipoAInscribir}
                  onChange={(e) => setEquipoAInscribir(e.target.value)}
                  className="flex-1 min-w-0 bg-[#0f1115] border border-gray-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-400 text-sm"
                />

                <button
                  type="submit"
<<<<<<< HEAD
                  className={`px-4 rounded-xl font-bold text-white shadow-lg ${
                    editandoInscritoId ? "bg-orange-500" : "bg-yellow-500 text-black"
=======
                  className={`px-4 rounded-2xl font-bold text-white shadow-lg ${
                    editandoInscritoId
                      ? "bg-orange-500"
                      : "bg-yellow-500 text-black"
>>>>>>> origin/main
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
                    className="bg-gray-700 px-3 rounded-2xl text-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </form>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0a0c10] rounded-2xl border border-gray-800 p-2 mb-4">
              <h3 className="text-xs font-black text-gray-600 uppercase text-center py-2 mb-2 border-b border-gray-800">
                Equipos Inscritos ({inscritosLista.length})
              </h3>

<<<<<<< HEAD
              {inscritosLista.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">
                  No hay equipos inscritos.
=======
              {inscritosLista.map((eq, i) => (
                <div
                  key={eq.id_participante}
                  className="flex justify-between items-center gap-2 px-3 py-2.5 hover:bg-gray-800/50 rounded-xl group"
                >
                  <span className="font-bold text-gray-300 text-sm truncate">
                    <span className="text-gray-600 mr-2">{i + 1}.</span>
                    {eq.nombre_externo}
                  </span>

                  <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => {
                        setEditandoInscritoId(eq.id_participante);
                        setEquipoAInscribir(eq.nombre_externo);
                      }}
                      className="text-orange-400 hover:bg-orange-400/20 p-2 rounded-md"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => eliminarInscrito(eq.id_participante)}
                      className="text-red-500 hover:bg-red-500/20 p-2 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
>>>>>>> origin/main
                </div>
              ) : (
                inscritosLista.map((equipo, index) => (
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
                ))
              )}
            </div>

            {isAdmin && (
              <button
                onClick={generarSorteo}
                className="w-full bg-purple-600 hover:bg-purple-500 py-3.5 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <Dices size={20} />
                Generar Sorteo Real
              </button>
            )}
          </div>
        </div>
      )}

      {modalLlaves && (
        <div className="fixed inset-0 lg:left-[248px] bg-black/95 flex items-center justify-center p-0 sm:p-4 z-[40] backdrop-blur-sm">
          <div className="bg-[#11141a] border border-gray-800 w-full h-full sm:h-[94vh] lg:max-w-[calc(100vw-280px)] xl:max-w-7xl flex flex-col rounded-none sm:rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 sm:p-4 border-b border-gray-800 bg-[#090b0f] flex items-center justify-between gap-3 shrink-0">
              <div className="flex gap-2 sm:gap-4 w-full overflow-x-auto pr-2">
                <button
<<<<<<< HEAD
                  onClick={() => setPestanaActiva("grupos")}
                  className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${
=======
                  onClick={() => setPestañaActiva("grupos")}
                  className={`min-w-max font-black text-[13px] sm:text-lg px-3 sm:px-4 py-2 border-b-2 transition-all ${
>>>>>>> origin/main
                    pestanaActiva === "grupos"
                      ? "border-yellow-400 text-yellow-400"
                      : "border-transparent text-gray-600 hover:text-gray-400"
                  }`}
                >
                  Fase de Grupos
                </button>

                <button
<<<<<<< HEAD
                  onClick={() => setPestanaActiva("eliminatorias")}
                  className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${
=======
                  onClick={() => setPestañaActiva("eliminatorias")}
                  className={`min-w-max font-black text-[13px] sm:text-lg px-3 sm:px-4 py-2 border-b-2 transition-all ${
>>>>>>> origin/main
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
                className="text-gray-500 hover:text-white bg-gray-800/50 p-2 rounded-full shrink-0"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto xl:overflow-hidden">
              {pestanaActiva === "grupos" && (
                <div className="min-h-full xl:h-full grid grid-cols-1 xl:grid-cols-[340px_1fr]">
                  <div className="bg-[#0a0c10] border-b xl:border-b-0 xl:border-r border-gray-800 p-4 sm:p-5 xl:overflow-y-auto">
                    <h3 className="font-black text-white text-[18px] sm:text-xl mb-4 flex items-center gap-2">
                      <LayoutGrid className="text-yellow-400" />
                      Clasificación
                    </h3>

<<<<<<< HEAD
                    {Object.keys(standings).length === 0 ? (
                      <div className="text-gray-600 text-sm">
                        No hay clasificación disponible.
                      </div>
                    ) : (
                      Object.keys(standings).map((grupo) => {
                        const equipos = Object.entries(standings[grupo])
                          .map(([nombre, stats]) => ({ nombre, ...stats }))
                          .sort((a, b) => b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc));

                        return (
                          <div
                            key={grupo}
                            className="mb-6 bg-[#13161c] rounded-xl border border-gray-800 overflow-hidden shadow-lg"
                          >
                            <div className="bg-gray-800/50 py-2 px-4 font-black text-yellow-400 text-sm uppercase tracking-widest">
                              {grupo}
                            </div>

                            <table className="w-full text-sm text-left">
=======
                    {Object.keys(standings).map((grupo) => {
                      const equipos = Object.entries(standings[grupo])
                        .map(([nom, st]) => ({
                          nom,
                          ...st,
                        }))
                        .sort(
                          (a, b) =>
                            b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc)
                        );

                      return (
                        <div
                          key={grupo}
                          className="mb-4 bg-[#151922] rounded-2xl border border-gray-800/80 overflow-hidden shadow-lg"
                        >
                          <div className="bg-gray-800/40 py-2 px-4 font-black text-yellow-400 text-[13px] uppercase tracking-widest">
                            {grupo}
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[300px] text-sm text-left">
>>>>>>> origin/main
                              <thead className="text-gray-500 text-xs bg-[#0a0c10] border-b border-gray-800">
                                <tr>
                                  <th className="px-4 py-2">Eq</th>
                                  <th className="text-center">PJ</th>
                                  <th className="text-center">DIF</th>
<<<<<<< HEAD
                                  <th className="text-center text-white">PTS</th>
=======
                                  <th className="text-center text-white">
                                    PTS
                                  </th>
>>>>>>> origin/main
                                </tr>
                              </thead>

                              <tbody>
<<<<<<< HEAD
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
=======
                                {equipos.map((eq, i) => (
                                  <tr
                                    key={eq.nom}
                                    className={`border-b border-gray-800/50 ${
                                      i < 2 ? "bg-green-900/10" : ""
                                    }`}
                                  >
                                    <td className="px-4 py-2.5 font-bold text-gray-200 truncate max-w-[150px] text-[13px]">
                                      {eq.nom}
                                    </td>

                                    <td className="text-center text-gray-500 text-[13px]">
                                      {eq.pj}
                                    </td>

                                    <td className="text-center text-gray-500 text-[13px]">
                                      {eq.gf - eq.gc}
                                    </td>

                                    <td className="text-center font-black text-yellow-400 text-[13px]">
                                      {eq.pts}
>>>>>>> origin/main
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
<<<<<<< HEAD
                        );
                      })
                    )}
=======
                        </div>
                      );
                    })}
>>>>>>> origin/main

                    {isAdmin && (
                      <button
                        onClick={avanzarAOctavos}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-2xl font-black text-white shadow-xl mt-4 uppercase tracking-widest text-sm"
                      >
                        Avanzar a Eliminatorias
                      </button>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 bg-[#13161c] xl:overflow-y-auto">
                    {[1, 2, 3].map((jor) => (
                      <div key={jor} className="mb-8 sm:mb-12">
                        <h3 className="font-black text-lg sm:text-2xl text-gray-500 mb-4 border-b border-gray-800 pb-2">
                          Jornada {jor}
                        </h3>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {llavesData
                            .filter(
<<<<<<< HEAD
                              (partido) =>
                                partido.jornada === jornada &&
                                partido.fase?.includes("Grupo")
=======
                              (m) =>
                                m.jornada === jor &&
                                m.fase.includes("Grupo")
>>>>>>> origin/main
                            )
                            .map((m) => (
                              <div
                                key={m.id}
                                className="bg-[#171a20] border border-gray-800/80 p-3 rounded-[22px] flex items-center justify-between shadow-lg gap-2"
                              >
<<<<<<< HEAD
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
                                        defaultValue={partido.goles_1 !== null ? partido.goles_1 : ""}
                                        onChange={(e) =>
                                          handleInputGoles(partido.id, "g1", e.target.value)
                                        }
                                      />

                                      <span className="text-gray-600">:</span>

                                      <input
                                        type="number"
                                        min="0"
                                        className="w-8 bg-transparent text-center text-white font-black text-lg outline-none"
                                        defaultValue={partido.goles_2 !== null ? partido.goles_2 : ""}
                                        onChange={(e) =>
                                          handleInputGoles(partido.id, "g2", e.target.value)
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
=======
                                <div
                                  className={`flex-1 text-right font-bold text-[13px] sm:text-lg truncate pr-2 sm:pr-4 ${
                                    m.jugado && m.goles_1 > m.goles_2
                                      ? "text-green-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {m.participante_1 === "Libre" ? (
                                    <span className="text-gray-600 italic text-xs sm:text-sm">
                                      Descansa
>>>>>>> origin/main
                                    </span>
                                  ) : (
                                    m.participante_1
                                  )}
                                </div>

                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <div className="flex items-center gap-1 sm:gap-2 bg-[#0a0c10] px-2 sm:px-3 py-2 rounded-2xl border border-gray-800 shadow-inner">
                                    {m.participante_1 === "Libre" ||
                                    m.participante_2 === "Libre" ? (
                                      <span className="text-gray-600 font-bold">
                                        -
                                      </span>
                                    ) : isAdmin ? (
                                      <>
                                        <input
                                          type="number"
                                          min="0"
                                          onKeyDown={(e) =>
                                            (e.key === "-" ||
                                              e.key === "e") &&
                                            e.preventDefault()
                                          }
                                          className="w-7 sm:w-8 bg-transparent text-center text-white font-black text-sm sm:text-lg outline-none"
                                          defaultValue={
                                            m.goles_1 !== null
                                              ? m.goles_1
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleInputGoles(
                                              m.id,
                                              "g1",
                                              e.target.value
                                            )
                                          }
                                        />

                                        <span className="text-gray-600">:</span>

                                        <input
                                          type="number"
                                          min="0"
                                          onKeyDown={(e) =>
                                            (e.key === "-" ||
                                              e.key === "e") &&
                                            e.preventDefault()
                                          }
                                          className="w-7 sm:w-8 bg-transparent text-center text-white font-black text-sm sm:text-lg outline-none"
                                          defaultValue={
                                            m.goles_2 !== null
                                              ? m.goles_2
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleInputGoles(
                                              m.id,
                                              "g2",
                                              e.target.value
                                            )
                                          }
                                        />

                                        <button
                                          onClick={() => guardarMarcador(m)}
                                          className="text-blue-500 hover:text-blue-400 p-1"
                                        >
                                          <Save size={18} />
                                        </button>
                                      </>
                                    ) : (
                                      <span className="font-black text-white text-sm sm:text-lg">
                                        {m.jugado
                                          ? `${m.goles_1} - ${m.goles_2}`
                                          : "VS"}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`flex-1 text-left font-bold text-[13px] sm:text-lg truncate pl-2 sm:pl-4 ${
                                    m.jugado && m.goles_2 > m.goles_1
                                      ? "text-green-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {m.participante_2 === "Libre" ? (
                                    <span className="text-gray-600 italic text-xs sm:text-sm">
                                      Descansa
                                    </span>
                                  ) : (
                                    m.participante_2
                                  )}
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
<<<<<<< HEAD
                <div className="p-8 h-full min-w-max overflow-auto flex items-start bg-[#0a0c10]">
                  <div className="flex gap-12 justify-start h-full items-start">
                    {["Ronda Preliminar", "Octavos", "Cuartos", "Semifinal", "Final"].map((fase) => {
                      const partidos = llavesData.filter((partido) => partido.fase === fase);
=======
                <div className="h-full w-full bg-[#0a0c10]">
                  <div className="block md:hidden p-4 space-y-8">
                    {fasesEliminatorias.map((faseName) => {
                      const matches = llavesData.filter(
                        (m) => m.fase === faseName
                      );
>>>>>>> origin/main

                      if (matches.length === 0) return null;

                      return (
                        <section key={faseName}>
                          <h3 className="text-center font-black text-yellow-400 uppercase tracking-widest mb-4 text-sm">
                            {faseName}
                          </h3>

<<<<<<< HEAD
                          {partidos.map((partido) => {
                            const empata =
                              partido.jugado &&
                              partido.goles_1 !== null &&
                              partido.goles_1 === partido.goles_2;

                            const isEditingTie =
                              isAdmin &&
                              (scores[partido.id]?.g1 ?? partido.goles_1) ===
                                (scores[partido.id]?.g2 ?? partido.goles_2) &&
                              (scores[partido.id]?.g1 !== undefined || partido.goles_1 !== null);

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
                                      defaultValue={partido.goles_1 !== null ? partido.goles_1 : ""}
                                      onChange={(e) =>
                                        handleInputGoles(partido.id, "g1", e.target.value)
                                      }
                                      className="w-10 bg-black/50 text-center rounded border border-gray-700 text-white font-black outline-none py-1"
                                    />
                                  ) : (
                                    <span className="font-black text-white bg-black/50 px-3 py-1 rounded">
                                      {partido.goles_1 ?? "-"}
                                    </span>
                                  )}
                                </div>

                                <div className="border-b border-gray-800 mb-2" />

                                <div className="flex justify-between items-center">
                                  <span className="font-bold truncate w-32 text-gray-300">
                                    {partido.participante_2}
                                  </span>

                                  {isAdmin ? (
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={partido.goles_2 !== null ? partido.goles_2 : ""}
                                      onChange={(e) =>
                                        handleInputGoles(partido.id, "g2", e.target.value)
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
                                        defaultValue={partido.penales_1 !== null ? partido.penales_1 : ""}
                                        onChange={(e) =>
                                          handleInputGoles(partido.id, "p1", e.target.value)
                                        }
                                        className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"
                                      />

                                      <span className="text-gray-500">-</span>

                                      <input
                                        type="number"
                                        min="0"
                                        defaultValue={partido.penales_2 !== null ? partido.penales_2 : ""}
                                        onChange={(e) =>
                                          handleInputGoles(partido.id, "p2", e.target.value)
                                        }
                                        className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"
                                      />
                                    </div>
                                  </div>
                                )}

                                {!isAdmin && empata && (
                                  <div className="mt-2 text-center text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded py-1 border border-yellow-400/20">
                                    P: {partido.penales_1} - {partido.penales_2}
                                  </div>
                                )}

                                {isAdmin &&
                                  !partido.participante_1?.includes("TBD") &&
                                  !partido.participante_2?.includes("TBD") && (
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
=======
                          <div className="space-y-4">
                            {matches.map((m) =>
                              renderPartidoEliminatoria(m, true)
                            )}
                          </div>
                        </section>
>>>>>>> origin/main
                      );
                    })}

                    {campeon && (
                      <div className="flex flex-col justify-center items-center py-6 animate-pulse">
                        <Crown className="text-yellow-400 w-16 h-16 mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]" />

                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center">
                          CAMPEÓN
                        </h2>

                        <div className="mt-4 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-1 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                          <div className="bg-[#0a0c10] px-6 py-4 rounded-xl">
                            <span className="text-xl font-black text-white">
                              {campeon}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden md:block p-6 lg:p-8 h-full w-full overflow-x-auto overflow-y-auto">
                    <div className="min-w-max flex gap-8 lg:gap-12 justify-start items-start pb-12 pr-12">
                      {fasesEliminatorias.map((faseName) => {
                        const matches = llavesData.filter(
                          (m) => m.fase === faseName
                        );

                        if (matches.length === 0) return null;

                        return (
                          <div
                            key={faseName}
                            className="flex flex-col gap-6 justify-center min-h-full w-72 lg:w-80 shrink-0"
                          >
                            <h3 className="text-center font-black text-yellow-400 uppercase tracking-widest mb-2 sticky top-0 bg-[#0a0c10]/80 backdrop-blur-md py-2 z-10 text-sm sm:text-base">
                              {faseName}
                            </h3>

                            {matches.map((m) =>
                              renderPartidoEliminatoria(m, false)
                            )}
                          </div>
                        );
                      })}

                      {campeon && (
                        <div className="flex flex-col justify-center items-center ml-8 sm:ml-12 shrink-0 animate-pulse">
                          <Crown className="text-yellow-400 w-16 h-16 sm:w-24 sm:h-24 mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]" />

                          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center">
                            CAMPEÓN
                          </h2>

                          <div className="mt-4 sm:mt-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-1 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                            <div className="bg-[#0a0c10] px-6 py-4 sm:px-10 sm:py-6 rounded-xl">
                              <span className="text-xl sm:text-3xl font-black text-white">
                                {campeon}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && modalFormulario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 sm:p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-2xl rounded-[30px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23] shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3">
                <LayoutGrid className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                {modoEdicion ? "Configuración" : "Crear Torneo"}
              </h2>

              <button onClick={() => setModalFormulario(false)}>
                <X className="text-gray-500 hover:text-white" />
              </button>
            </div>

            <form
              onSubmit={guardarTorneo}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto"
            >
              <input
                type="text"
                placeholder="Nombre Oficial"
                required
                value={formData.nombre_torneo}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-2xl p-3 sm:p-4 text-white focus:border-yellow-400 outline-none font-bold text-sm sm:text-base"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre_torneo: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  required
                  value={formData.sede_principal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sede_principal: e.target.value,
                    })
                  }
                  className="bg-[#0f1115] border border-gray-700 rounded-2xl p-3 text-white outline-none text-sm sm:text-base"
                >
<<<<<<< HEAD
                  <option value="">Seleccionar cancha...</option>
                  {instalaciones.map((instalacion) => (
                    <option key={instalacion.id_espacio} value={instalacion.id_espacio}>
                      {instalacion.nombre_especifico}
=======
                  <option value="">Seleccionar Cancha...</option>

                  {instalaciones.map((inst) => (
                    <option key={inst.id_espacio} value={inst.id_espacio}>
                      {inst.nombre_especifico}
>>>>>>> origin/main
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
                  className="bg-[#0f1115] border border-gray-700 rounded-2xl p-3 text-white outline-none text-sm sm:text-base"
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
                    setFormData({
                      ...formData,
                      tipo_bracket: e.target.value,
                    })
                  }
                  className="bg-[#0f1115] border border-gray-700 rounded-2xl p-3 text-white sm:col-span-2 outline-none text-sm sm:text-base"
                  disabled={!formData.id_disciplina}
                >
<<<<<<< HEAD
                  <option value="">Elige formato...</option>
                  <option value="Liga">Liga / Grupos</option>
                  <option value="Eliminacion directa">Eliminatoria Directa</option>
=======
                  <option value="">Elige Formato...</option>

                  {(formatosPorDeporte[formData.id_disciplina] || [
                    { value: "Liga", label: "Liga / Grupos" },
                    {
                      value: "Eliminacion directa",
                      label: "Eliminatoria Directa",
                    },
                  ]).map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
>>>>>>> origin/main
                </select>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Inicio
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-2xl p-3 text-white outline-none css-color-scheme-dark text-sm sm:text-base"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_inicio: e.target.value,
                      })
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
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-2xl p-3 text-white outline-none css-color-scheme-dark text-sm sm:text-base"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_fin: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full font-black text-base sm:text-lg py-3 sm:py-4 rounded-2xl text-black bg-yellow-400 hover:bg-yellow-500 shadow-xl shadow-yellow-500/20 uppercase tracking-widest mt-4"
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