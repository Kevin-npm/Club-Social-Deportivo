import { useState, useEffect } from "react";
import { Trophy, MapPin, Eye, Plus, X, LayoutGrid, Dices, GitMerge, UserPlus, Save, AlertCircle, CheckCircle, Edit, Trash2, Crown, AlertTriangle } from "lucide-react";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

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

  // ESTADO PARA CONFIRMACIONES MODERNAS
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, mensaje: "", onConfirm: null });

  const estadoInicial = { nombre_torneo: "", categoria: "Libre", sede_principal: "", id_disciplina: "", tipo_bracket: "", tipo: "Local", fecha_inicio: "", fecha_fin: "" };
  const [formData, setFormData] = useState(estadoInicial);

  const formatosPorDeporte = {
    "1": [{ value: "Liga", label: "Liga / Grupos" }, { value: "Eliminacion directa", label: "Eliminatoria Directa" }],
    "2": [{ value: "Liga", label: "Temporada" }, { value: "Eliminacion directa", label: "Playoffs" }],
    "3": [{ value: "Round Robin", label: "Grupos Round Robin" }, { value: "Eliminacion directa", label: "Llaves Singles" }],
    "4": [{ value: "Liga", label: "Liga Voley" }, { value: "Eliminacion directa", label: "Torneo Relámpago" }],
  };

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
      if (resInst.ok) setInstalaciones((await resInst.json()).data || []);
      const resTorneos = await fetch("http://127.0.0.1:8000/api/torneos");
      if (resTorneos.ok) setTorneos((await resTorneos.json()).data || []);
    } catch (error) { console.error(error); }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirParaEditar = (t) => {
    setFormData(t);
    setModoEdicion(true);
    setModalFormulario(true);
  };

  const guardarTorneo = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const method = modoEdicion ? "PUT" : "POST";
    const url = modoEdicion ? `http://127.0.0.1:8000/api/torneos/${formData.id_torneo || formData.id}` : "http://127.0.0.1:8000/api/torneos";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if(!res.ok) throw new Error();
      setModalFormulario(false);
      mostrarAlerta(modoEdicion ? "Torneo actualizado" : "Torneo guardado", "success");
      cargarDatos();
    } catch (error) { mostrarAlerta("Error al guardar torneo"); }
  };

  const eliminarTorneo = (id) => {
    pedirConfirmacion("¿Estás seguro de eliminar todo este torneo y sus registros?", async () => {
      await fetch(`http://127.0.0.1:8000/api/torneos/${id}`, { method: "DELETE" });
      mostrarAlerta("Torneo eliminado", "success");
      cargarDatos();
    });
  };

  const abrirDetalles = async (t) => {
    setTorneoSeleccionado(t);
    setTorneoActivoId(t.id_torneo);
    await recargarInscritos(t.id_torneo);
    setModalDetalles(true);
  };

  const recargarInscritos = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/api/torneos/${id}/inscripciones`);
    const data = await res.json();
    setInscritosLista(data.data || []);
  };

  const procesarInscripcion = async (e) => {
    e.preventDefault();
    if (!equipoAInscribir) return;
    const url = editandoInscritoId ? `http://127.0.0.1:8000/api/inscripciones/${editandoInscritoId}` : `http://127.0.0.1:8000/api/torneos/${torneoActivoId}/inscribir`;
    const method = editandoInscritoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre_equipo: equipoAInscribir }) });
      const data = await res.json();
      if (!res.ok) mostrarAlerta(data.message);
      else {
        setEquipoAInscribir(""); setEditandoInscritoId(null);
        recargarInscritos(torneoActivoId); cargarDatos();
        mostrarAlerta(editandoInscritoId ? "Editado con éxito" : "Inscrito con éxito", "success");
      }
    } catch (error) { mostrarAlerta("Error de conexión"); }
  };

  const eliminarInscrito = (id) => {
    pedirConfirmacion("¿Dar de baja a este equipo del torneo?", async () => {
      await fetch(`http://127.0.0.1:8000/api/inscripciones/${id}`, { method: "DELETE" });
      recargarInscritos(torneoActivoId); cargarDatos();
      mostrarAlerta("Equipo dado de baja", "success");
    });
  };

  const recargarLlavesSilencioso = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/api/torneos/${id}/llaves`);
    const data = await res.json();
    setLlavesData(data.data);
  };

  const generarSorteo = async () => {
    pedirConfirmacion("Generar sorteo borrará el fixture actual y lo hará aleatoriamente. ¿Continuar?", async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/torneos/${torneoActivoId}/sorteo`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) mostrarAlerta(data.message);
        else { 
          mostrarAlerta("Sorteo generado", "success"); 
          recargarLlavesSilencioso(torneoActivoId);
        }
      } catch (error) { mostrarAlerta("Error en el servidor"); }
    });
  };

  const verLlaves = async (idTorneo) => {
    setTorneoActivoId(idTorneo);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/torneos/${idTorneo}/llaves`);
      const data = await res.json();
      if (data.data.length === 0) return mostrarAlerta("Fixture vacío. Genera el sorteo en 'Inscritos / Sorteo'.");
      setLlavesData(data.data);
      setPestañaActiva(data.data.some(m => m.fase.includes("Grupo")) ? "grupos" : "eliminatorias");
      setModalLlaves(true);
    } catch (error) { console.error(error); }
  };

  const handleInputGoles = (idEncuentro, equipo, valor) => {
    const num = valor === "" ? "" : Math.max(0, parseInt(valor) || 0);
    setScores({...scores, [idEncuentro]: {...scores[idEncuentro], [equipo]: num}});
  };

  const guardarMarcador = async (m) => {
    const score = scores[m.id] || {};
    const g1 = score.g1 !== undefined && score.g1 !== "" ? parseInt(score.g1) : (m.goles_1 !== null ? m.goles_1 : 0);
    const g2 = score.g2 !== undefined && score.g2 !== "" ? parseInt(score.g2) : (m.goles_2 !== null ? m.goles_2 : 0);
    const p1 = score.p1 !== undefined && score.p1 !== "" ? parseInt(score.p1) : m.penales_1;
    const p2 = score.p2 !== undefined && score.p2 !== "" ? parseInt(score.p2) : m.penales_2;

    try {
      await fetch(`http://127.0.0.1:8000/api/encuentros/${m.id}/marcador`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goles_1: g1, goles_2: g2, penales_1: p1, penales_2: p2 }),
      });
      recargarLlavesSilencioso(torneoActivoId);
      mostrarAlerta("Marcador Guardado", "success");
    } catch (error) { mostrarAlerta("Error al guardar"); }
  };

  const standings = {};
  llavesData.forEach(m => {
    if (m.fase.includes('Grupo') && m.participante_1 !== 'Libre' && m.participante_2 !== 'Libre') {
      if (!standings[m.fase]) standings[m.fase] = {};
      if (!standings[m.fase][m.participante_1]) standings[m.fase][m.participante_1] = { pts: 0, pj: 0, gf: 0, gc: 0 };
      if (!standings[m.fase][m.participante_2]) standings[m.fase][m.participante_2] = { pts: 0, pj: 0, gf: 0, gc: 0 };

      if (m.jugado) {
        standings[m.fase][m.participante_1].pj++; standings[m.fase][m.participante_2].pj++;
        standings[m.fase][m.participante_1].gf += m.goles_1; standings[m.fase][m.participante_1].gc += m.goles_2;
        standings[m.fase][m.participante_2].gf += m.goles_2; standings[m.fase][m.participante_2].gc += m.goles_1;

        if (m.goles_1 > m.goles_2) standings[m.fase][m.participante_1].pts += 3;
        else if (m.goles_2 > m.goles_1) standings[m.fase][m.participante_2].pts += 3;
        else { standings[m.fase][m.participante_1].pts += 1; standings[m.fase][m.participante_2].pts += 1; }
      }
    }
  });

  const avanzarAOctavos = () => {
    pedirConfirmacion("¿Clasificar a los 2 mejores de cada grupo a Eliminatorias?", async () => {
      const clasificados = [];
      Object.keys(standings).forEach(grupo => {
        const equipos = Object.entries(standings[grupo]).map(([nom, stats]) => ({ nom, ...stats }));
        equipos.sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));
        if(equipos[0]) clasificados.push(equipos[0].nom);
        if(equipos[1]) clasificados.push(equipos[1].nom);
      });

      await fetch(`http://127.0.0.1:8000/api/torneos/${torneoActivoId}/clasificar`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clasificados }),
      });
      recargarLlavesSilencioso(torneoActivoId);
      setPestañaActiva("eliminatorias");
      mostrarAlerta("Fase Final Generada", "success");
    });
  };

  // Logica Campeon
  const finalMatch = llavesData.find(m => m.fase === 'Final');
  let campeon = null;
  if (finalMatch && finalMatch.jugado) {
    if (finalMatch.goles_1 > finalMatch.goles_2) campeon = finalMatch.participante_1;
    else if (finalMatch.goles_2 > finalMatch.goles_1) campeon = finalMatch.participante_2;
    else if (finalMatch.penales_1 !== null && finalMatch.penales_2 !== null) {
      campeon = finalMatch.penales_1 > finalMatch.penales_2 ? finalMatch.participante_1 : finalMatch.participante_2;
    }
  }

  return (
    <div className="p-4 md:p-6 bg-[#0f1115] min-h-screen text-gray-200 relative">
      {/* ALERTAS GLOBALES */}
      {alerta && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-white border ${alerta.tipo === 'success' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
            {alerta.tipo === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>} {alerta.msg}
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN MODERNA */}
      {confirmDialog.visible && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="bg-[#1c1f26] border border-gray-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
            <AlertTriangle className="text-yellow-400 w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-6">{confirmDialog.mensaje}</h3>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDialog({ visible: false })} className="w-1/2 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-white font-bold transition-all">Cancelar</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ visible: false }); }} className="w-1/2 bg-yellow-500 hover:bg-yellow-400 py-3 rounded-xl text-black font-black transition-all shadow-lg shadow-yellow-500/20">Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3"><Trophy className="text-yellow-400 w-8 h-8" /> Panel de Torneos</h1>
        {isAdmin && (<button onClick={() => { setFormData(estadoInicial); setModoEdicion(false); setModalFormulario(true); }} className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold flex gap-2"><Plus size={20} /> Nuevo Torneo</button>)}
      </div>

      {cargando ? ( <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400"></div></div> ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {torneos.map((t) => (
            <div key={t.id_torneo} className="bg-[#1a1d23] border border-gray-800 rounded-3xl p-6 hover:border-yellow-400/50 transition-all relative group">
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => eliminarTorneo(t.id_torneo)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 size={16} /></button>
                </div>
              )}
              <div className="flex justify-between mb-4 pr-10">
                 <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase">{t.categoria}</span>
                 <span className="text-gray-400 text-sm font-bold">{t.inscritos_count} / 32 Equipos</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">{t.nombre_torneo}</h3>
              <div className="flex items-center text-gray-500 gap-2 mb-6 text-sm"><MapPin size={16} className="text-yellow-400" /> {t.sede?.nombre_especifico || "Sin sede"}</div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button onClick={() => verLlaves(t.id_torneo)} className="col-span-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 py-3 rounded-xl font-black flex justify-center gap-2 text-sm uppercase tracking-widest transition-all"><GitMerge size={18}/> Fixture Oficial</button>
                <button onClick={() => abrirDetalles(t)} className="bg-gray-800 hover:bg-gray-700 py-2.5 text-sm rounded-xl font-bold flex justify-center gap-2 text-white border border-gray-700"><UserPlus size={16}/> Inscritos / Sorteo</button>
                {isAdmin && <button onClick={() => abrirParaEditar(t)} className="bg-gray-800 hover:bg-gray-700 py-2.5 text-sm rounded-xl font-bold flex justify-center gap-2 text-white border border-gray-700"><Edit size={16}/> Configuración</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLES E INSCRIPCIONES */}
      {modalDetalles && torneoSeleccionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2"><UserPlus className="text-yellow-400" /> Inscripciones</h2>
              <button onClick={() => setModalDetalles(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="mb-4">
               <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Agregar / Editar (Max 32)</h3>
               <form onSubmit={procesarInscripcion} className="flex gap-2">
                 <input type="text" placeholder="Nombre de Equipo..." required value={equipoAInscribir} onChange={e => setEquipoAInscribir(e.target.value)} className="flex-1 bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-yellow-400" />
                 <button type="submit" className={`px-4 rounded-xl font-bold text-white shadow-lg ${editandoInscritoId ? 'bg-orange-500' : 'bg-yellow-500 text-black'}`}>{editandoInscritoId ? <Save size={20}/> : <Plus size={20}/>}</button>
                 {editandoInscritoId && <button type="button" onClick={()=>{setEditandoInscritoId(null); setEquipoAInscribir("");}} className="bg-gray-700 px-3 rounded-xl text-white"><X size={20}/></button>}
               </form>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0a0c10] rounded-xl border border-gray-800 p-2 mb-4">
              <h3 className="text-xs font-black text-gray-600 uppercase text-center py-2 mb-2 border-b border-gray-800">Equipos Inscritos ({inscritosLista.length})</h3>
              {inscritosLista.map((eq, i) => (
                <div key={eq.id_participante} className="flex justify-between items-center p-3 hover:bg-gray-800/50 rounded-lg group">
                  <span className="font-bold text-gray-300 text-sm"><span className="text-gray-600 mr-2">{i+1}.</span> {eq.nombre_externo}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>{setEditandoInscritoId(eq.id_participante); setEquipoAInscribir(eq.nombre_externo);}} className="text-orange-400 hover:bg-orange-400/20 p-1.5 rounded-md"><Edit size={16}/></button>
                    <button onClick={()=>eliminarInscrito(eq.id_participante)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded-md"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (
              <button onClick={generarSorteo} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"><Dices size={20}/> Generar Sorteo Real</button>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHAMPIONS LEAGUE (Gestor de Torneo) */}
      {modalLlaves && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-2 z-[40] backdrop-blur-sm">
          <div className="bg-[#13161c] border border-gray-800 w-full max-w-7xl h-[95vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0a0c10] flex justify-between items-center">
              <div className="flex gap-4">
                <button onClick={()=>setPestañaActiva("grupos")} className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${pestanaActiva === "grupos" ? "border-yellow-400 text-yellow-400" : "border-transparent text-gray-600 hover:text-gray-400"}`}>Fase de Grupos</button>
                <button onClick={()=>setPestañaActiva("eliminatorias")} className={`font-black text-lg px-4 py-2 border-b-2 transition-all ${pestanaActiva === "eliminatorias" ? "border-yellow-400 text-yellow-400" : "border-transparent text-gray-600 hover:text-gray-400"}`}>Eliminatorias (Bracket)</button>
              </div>
              <button onClick={() => setModalLlaves(false)} className="text-gray-500 hover:text-white bg-gray-800/50 p-2 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* PESTAÑA 1: GRUPOS */}
              {pestanaActiva === "grupos" && (
                <div className="h-full flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 bg-[#0a0c10] border-r border-gray-800 p-6 overflow-y-auto">
                    <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2"><LayoutGrid className="text-yellow-400"/> Clasificación</h3>
                    {Object.keys(standings).map(grupo => {
                      const equipos = Object.entries(standings[grupo]).map(([nom, st]) => ({ nom, ...st })).sort((a,b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));
                      return (
                        <div key={grupo} className="mb-6 bg-[#13161c] rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                          <div className="bg-gray-800/50 py-2 px-4 font-black text-yellow-400 text-sm uppercase tracking-widest">{grupo}</div>
                          <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 text-xs bg-[#0a0c10] border-b border-gray-800"><tr><th className="px-4 py-2">Eq</th><th className="text-center">PJ</th><th className="text-center">DIF</th><th className="text-center text-white">PTS</th></tr></thead>
                            <tbody>
                              {equipos.map((eq, i) => (
                                <tr key={eq.nom} className={`border-b border-gray-800/50 ${i < 2 ? "bg-green-900/10" : ""}`}>
                                  <td className="px-4 py-3 font-bold text-gray-200 truncate max-w-[120px]">{eq.nom}</td>
                                  <td className="text-center text-gray-500">{eq.pj}</td>
                                  <td className="text-center text-gray-500">{eq.gf - eq.gc}</td>
                                  <td className="text-center font-black text-yellow-400">{eq.pts}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                    {isAdmin && <button onClick={avanzarAOctavos} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white shadow-xl mt-4 uppercase tracking-widest text-sm">Avanzar a Eliminatorias</button>}
                  </div>

                  <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-[#13161c]">
                    {[1, 2, 3].map(jor => (
                      <div key={jor} className="mb-12">
                        <h3 className="font-black text-2xl text-gray-500 mb-6 border-b border-gray-800 pb-2">Jornada {jor}</h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {llavesData.filter(m => m.jornada === jor && m.fase.includes('Grupo')).map(m => (
                            <div key={m.id} className="bg-[#1a1d23] border border-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                              <div className={`flex-1 text-right font-bold text-lg truncate pr-4 ${m.jugado && m.goles_1 > m.goles_2 ? 'text-green-400' : 'text-gray-300'}`}>
                                {m.participante_1 === 'Libre' ? <span className="text-gray-600 italic text-sm">Descansa</span> : m.participante_1}
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 bg-[#0a0c10] px-3 py-2 rounded-xl border border-gray-800 shadow-inner">
                                  {m.participante_1 === 'Libre' || m.participante_2 === 'Libre' ? <span className="text-gray-600 font-bold">-</span> : isAdmin ? (
                                    <>
                                      <input type="number" min="0" onKeyDown={e=>(e.key==='-'||e.key==='e')&&e.preventDefault()} className="w-8 bg-transparent text-center text-white font-black text-lg outline-none" defaultValue={m.goles_1 !== null ? m.goles_1 : ""} onChange={(e) => handleInputGoles(m.id, 'g1', e.target.value)} />
                                      <span className="text-gray-600">:</span>
                                      <input type="number" min="0" onKeyDown={e=>(e.key==='-'||e.key==='e')&&e.preventDefault()} className="w-8 bg-transparent text-center text-white font-black text-lg outline-none" defaultValue={m.goles_2 !== null ? m.goles_2 : ""} onChange={(e) => handleInputGoles(m.id, 'g2', e.target.value)} />
                                      <button onClick={() => guardarMarcador(m)} className="text-blue-500 hover:text-blue-400 p-1"><Save size={18}/></button>
                                    </>
                                  ) : <span className="font-black text-white text-lg">{m.jugado ? `${m.goles_1} - ${m.goles_2}` : 'VS'}</span>}
                                </div>
                              </div>
                              <div className={`flex-1 text-left font-bold text-lg truncate pl-4 ${m.jugado && m.goles_2 > m.goles_1 ? 'text-green-400' : 'text-gray-300'}`}>
                                {m.participante_2 === 'Libre' ? <span className="text-gray-600 italic text-sm">Descansa</span> : m.participante_2}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: ELIMINATORIAS (CHAMPIONS) */}
              {pestanaActiva === "eliminatorias" && (
                <div className="p-8 h-full min-w-max overflow-auto flex items-start bg-[#0a0c10]">
                  <div className="flex gap-12 justify-start h-full items-start">
                    {['Ronda Preliminar', 'Octavos', 'Cuartos', 'Semifinal', 'Final'].map(faseName => {
                      const matches = llavesData.filter(m => m.fase === faseName);
                      if(matches.length === 0) return null;
                      return (
                        <div key={faseName} className="flex flex-col gap-6 justify-center min-h-full w-80 shrink-0">
                          <h3 className="text-center font-black text-yellow-400 uppercase tracking-widest mb-2 sticky top-0 bg-[#0a0c10]/80 backdrop-blur-md py-2 z-10">{faseName}</h3>
                          {matches.map(m => {
                            const empata = m.jugado && m.goles_1 !== null && m.goles_1 === m.goles_2;
                            const isEditingTie = isAdmin && ((scores[m.id]?.g1 ?? m.goles_1) === (scores[m.id]?.g2 ?? m.goles_2)) && (scores[m.id]?.g1 !== undefined || m.goles_1 !== null);
                            
                            return (
                              <div key={m.id} className="bg-gradient-to-r from-[#1a1d23] to-[#13161c] border border-gray-700 p-4 rounded-2xl flex flex-col shadow-xl relative shrink-0">
                                {/* Equipo 1 */}
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`font-bold truncate w-32 ${m.jugado && (m.goles_1 > m.goles_2 || m.penales_1 > m.penales_2) ? 'text-green-400' : 'text-gray-300'}`}>{m.participante_1}</span>
                                  {isAdmin ? ( <input type="number" min="0" onKeyDown={e=>(e.key==='-')&&e.preventDefault()} defaultValue={m.goles_1 !== null ? m.goles_1 : ""} onChange={(e) => handleInputGoles(m.id, 'g1', e.target.value)} className="w-10 bg-black/50 text-center rounded border border-gray-700 text-white font-black outline-none py-1"/> ) : ( <span className="font-black text-white bg-black/50 px-3 py-1 rounded">{m.goles_1 ?? '-'}</span> )}
                                </div>
                                <div className="border-b border-gray-800 mb-2"></div>
                                {/* Equipo 2 */}
                                <div className="flex justify-between items-center">
                                  <span className={`font-bold truncate w-32 ${m.jugado && (m.goles_2 > m.goles_1 || m.penales_2 > m.penales_1) ? 'text-green-400' : 'text-gray-300'}`}>{m.participante_2}</span>
                                  {isAdmin ? ( <input type="number" min="0" onKeyDown={e=>(e.key==='-')&&e.preventDefault()} defaultValue={m.goles_2 !== null ? m.goles_2 : ""} onChange={(e) => handleInputGoles(m.id, 'g2', e.target.value)} className="w-10 bg-black/50 text-center rounded border border-gray-700 text-white font-black outline-none py-1"/> ) : ( <span className="font-black text-white bg-black/50 px-3 py-1 rounded">{m.goles_2 ?? '-'}</span> )}
                                </div>

                                {/* ZONA DE PENALES */}
                                {isEditingTie && (
                                  <div className="mt-3 p-2 bg-yellow-400/10 rounded-lg flex justify-between items-center border border-yellow-400/20">
                                    <span className="text-xs font-black text-yellow-400">PENALES (P)</span>
                                    <div className="flex gap-2">
                                      <input type="number" min="0" defaultValue={m.penales_1 !== null ? m.penales_1 : ""} onChange={(e) => handleInputGoles(m.id, 'p1', e.target.value)} className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"/>
                                      <span className="text-gray-500">-</span>
                                      <input type="number" min="0" defaultValue={m.penales_2 !== null ? m.penales_2 : ""} onChange={(e) => handleInputGoles(m.id, 'p2', e.target.value)} className="w-8 bg-black/50 text-center rounded border border-yellow-400/30 text-yellow-400 font-bold outline-none text-sm"/>
                                    </div>
                                  </div>
                                )}
                                {!isAdmin && empata && (
                                  <div className="mt-2 text-center text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded py-1 border border-yellow-400/20">
                                    P: {m.penales_1} - {m.penales_2}
                                  </div>
                                )}

                                {/* Boton Guardar */}
                                {isAdmin && !m.participante_1.includes('TBD') && !m.participante_2.includes('TBD') && (
                                  <button onClick={() => guardarMarcador(m)} className="absolute -right-3 -top-3 bg-blue-600 p-2.5 rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all"><Save size={16}/></button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    })}

                    {/* CAJA DEL CAMPEÓN */}
                    {campeon && (
                      <div className="flex flex-col justify-center items-center ml-12 shrink-0 animate-pulse">
                        <Crown className="text-yellow-400 w-24 h-24 mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]" />
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center">CAMPEÓN</h2>
                        <div className="mt-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-1 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                          <div className="bg-[#0a0c10] px-10 py-6 rounded-xl">
                            <span className="text-3xl font-black text-white">{campeon}</span>
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

      {/* FORMULARIO EDITAR / CREAR TORNEO */}
      {isAdmin && modalFormulario && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[50] backdrop-blur-sm">
          <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23]">
              <h2 className="text-xl font-black text-white flex items-center gap-3"><LayoutGrid className="text-yellow-400" /> {modoEdicion ? "Configuración" : "Crear Torneo"}</h2>
              <button onClick={() => setModalFormulario(false)}><X className="text-gray-500 hover:text-white" /></button>
            </div>
            <form onSubmit={guardarTorneo} className="p-6 space-y-5">
              <input type="text" placeholder="Nombre Oficial" required value={formData.nombre_torneo} className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-400 outline-none font-bold" onChange={(e) => setFormData({ ...formData, nombre_torneo: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select required value={formData.sede_principal} onChange={(e) => setFormData({ ...formData, sede_principal: e.target.value })} className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none">
                  <option value="">Seleccionar Cancha...</option>
                  {instalaciones.map((inst) => (<option key={inst.id_espacio} value={inst.id_espacio}>{inst.nombre_especifico}</option>))}
                </select>
                <select required value={formData.id_disciplina} onChange={(e) => setFormData({ ...formData, id_disciplina: e.target.value, tipo_bracket: "" })} className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none">
                  <option value="">Disciplina...</option>
                  <option value="1">Fútbol</option><option value="2">Básquetbol</option><option value="3">Tenis</option><option value="4">Voleibol</option>
                </select>
                <select required value={formData.tipo_bracket} onChange={(e) => setFormData({ ...formData, tipo_bracket: e.target.value })} className="bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white col-span-2 outline-none" disabled={!formData.id_disciplina}>
                  <option value="">Elige Formato...</option>
                  {[{ value: "Liga", label: "Liga / Grupos" }, { value: "Eliminacion directa", label: "Eliminatoria Directa" }].map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
                </select>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Inicio</label>
                  <input type="date" required value={formData.fecha_inicio} className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none css-color-scheme-dark" onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Fin</label>
                  <input type="date" required value={formData.fecha_fin} className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none css-color-scheme-dark" onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full font-black text-lg py-4 rounded-xl text-black bg-yellow-400 hover:bg-yellow-500 shadow-xl shadow-yellow-500/20 uppercase tracking-widest mt-4">Guardar Competición</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Torneos;