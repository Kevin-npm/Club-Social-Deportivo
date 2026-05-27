import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Info,
} from "lucide-react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

// ── Estados posibles del escáner ─────────────────────────────────────────────
const ESTADO = {
  IDLE:      "idle",       // Pantalla inicial
  SCANNING:  "scanning",   // Cámara activa
  LOADING:   "loading",    // Procesando código leído
  SUCCESS:   "success",    // Asistencia registrada OK
  ALREADY:   "already",    // Ya registrada
  NOT_ENROLL:"not_enroll", // No inscrito en la clase
  ERROR:     "error",      // Error genérico / sesión inválida
};

// ── Parsea el valor del QR de sesión ─────────────────────────────────────────
// Formato esperado: SESION:{id_sesion}|SOCIO:{id}|TOKEN:{token}
function parsearQRSesion(raw) {
  try {
    const parts = {};
    raw.split("|").forEach((seg) => {
      const [k, v] = seg.split(":");
      if (k && v !== undefined) parts[k.trim()] = v.trim();
    });
    if (parts.SESION) return { id_sesion: parseInt(parts.SESION, 10), token: parts.TOKEN ?? null };
  } catch {/* noop */}
  return null;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SocioAsistencia() {
  const { token } = useAuth();

  const scannerRef  = useRef(null);  // instancia Html5Qrcode
  const regionId    = "qr-reader-region";

  const [estado,    setEstado]    = useState(ESTADO.IDLE);
  const [mensaje,   setMensaje]   = useState("");
  const [sesionInfo, setSesionInfo] = useState(null);
  const [camaras,   setCamaras]   = useState([]);
  const [camIdx,    setCamIdx]    = useState(0);

  // ── Detener cámara ──────────────────────────────────────────────────────────
  const detenerScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {/* already stopped */}
      scannerRef.current = null;
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => () => { detenerScanner(); }, [detenerScanner]);

  // ── Arrancar cámara ─────────────────────────────────────────────────────────
  const iniciarScanner = useCallback(async (deviceId) => {
    await detenerScanner();
    setEstado(ESTADO.SCANNING);
    setMensaje("");
    setSesionInfo(null);

    const html5 = new Html5Qrcode(regionId);
    scannerRef.current = html5;

    const config = {
      fps: 10,
      qrbox: { width: 240, height: 240 },
      aspectRatio: 1,
    };

    try {
      await html5.start(
        deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" },
        config,
        onQRSuccess,
        () => {/* frame ignorado sin código */}
      );
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      setEstado(ESTADO.ERROR);
      setMensaje("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
      scannerRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detenerScanner, token, camIdx]);

  // ── Enumerar cámaras disponibles ────────────────────────────────────────────
  const cargarCamaras = useCallback(async () => {
    try {
      const devs = await Html5Qrcode.getCameras();
      setCamaras(devs);
      return devs;
    } catch {
      return [];
    }
  }, []);

  // ── Botón "Iniciar escáner" ──────────────────────────────────────────────────
  const handleIniciar = async () => {
    const devs = await cargarCamaras();
    const id   = devs[camIdx]?.id ?? null;
    iniciarScanner(id);
  };

  // ── Cambiar cámara (frontal ↔ trasera) ──────────────────────────────────────
  const handleCambiarCamara = async () => {
    const siguiente = (camIdx + 1) % Math.max(camaras.length, 1);
    setCamIdx(siguiente);
    const id = camaras[siguiente]?.id ?? null;
    iniciarScanner(id);
  };

  // ── Callback cuando se detecta un QR ────────────────────────────────────────
  const onQRSuccess = useCallback(async (rawValue) => {
    // Evitar múltiples disparos mientras procesamos
    if (!scannerRef.current) return;
    await detenerScanner();
    setEstado(ESTADO.LOADING);

    const parsed = parsearQRSesion(rawValue);

    if (!parsed) {
      setEstado(ESTADO.ERROR);
      setMensaje("El código QR escaneado no corresponde a una sesión válida del club.");
      return;
    }

    try {
      const res  = await fetch(`${API_BASE_URL}/socio/asistencia/qr`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Accept:          "application/json",
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({ id_sesion: parsed.id_sesion, token_qr: parsed.token }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setEstado(ESTADO.SUCCESS);
        setSesionInfo(data.data ?? null);
        setMensaje(data.message ?? "¡Asistencia registrada correctamente!");
        return;
      }

      if (res.status === 422 && data.code === "ya_registrado") {
        setEstado(ESTADO.ALREADY);
        setMensaje(data.message ?? "Tu asistencia ya fue registrada para esta sesión.");
        setSesionInfo(data.sesion ?? null);
        return;
      }

      if (res.status === 403 && data.code === "no_inscrito") {
        setEstado(ESTADO.NOT_ENROLL);
        setMensaje(data.message ?? "No estás inscrito en esta clase.");
        setSesionInfo(data.sesion ?? null);
        return;
      }

      // Cualquier otro error
      setEstado(ESTADO.ERROR);
      setMensaje(data.message ?? "Ocurrió un error al registrar la asistencia.");
    } catch {
      setEstado(ESTADO.ERROR);
      setMensaje("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, detenerScanner]);

  // ── Reiniciar ────────────────────────────────────────────────────────────────
  const handleReiniciar = () => {
    setEstado(ESTADO.IDLE);
    setMensaje("");
    setSesionInfo(null);
  };

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const resultConfig = {
    [ESTADO.SUCCESS]: {
      icon:    <CheckCircle2 size={52} className="text-emerald-400" />,
      title:   "¡Asistencia Registrada!",
      color:   "border-emerald-500/30 bg-emerald-500/5",
      badge:   "bg-emerald-500/15 text-emerald-400",
    },
    [ESTADO.ALREADY]: {
      icon:    <Info size={52} className="text-blue-400" />,
      title:   "Ya Registrado",
      color:   "border-blue-500/30 bg-blue-500/5",
      badge:   "bg-blue-500/15 text-blue-400",
    },
    [ESTADO.NOT_ENROLL]: {
      icon:    <AlertTriangle size={52} className="text-amber-400" />,
      title:   "No Inscrito",
      color:   "border-amber-500/30 bg-amber-500/5",
      badge:   "bg-amber-500/15 text-amber-400",
    },
    [ESTADO.ERROR]: {
      icon:    <XCircle size={52} className="text-red-400" />,
      title:   "Error",
      color:   "border-red-500/30 bg-red-500/5",
      badge:   "bg-red-500/15 text-red-400",
    },
  };

  const isResult = [ESTADO.SUCCESS, ESTADO.ALREADY, ESTADO.NOT_ENROLL, ESTADO.ERROR].includes(estado);

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* ── ENCABEZADO ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10">
          <QrCode size={22} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Pasar Asistencia</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Escanea el QR de la sesión para registrar tu asistencia
          </p>
        </div>
      </div>

      {/* ── INSTRUCCIONES ── */}
      {estado === ESTADO.IDLE && (
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">¿Cómo funciona?</h2>
          <ol className="space-y-3">
            {[
              { num: "1", text: "Presiona «Activar cámara» para abrir el escáner." },
              { num: "2", text: "Apunta la cámara al código QR de la sesión que muestra el instructor o la pantalla del club." },
              { num: "3", text: "El sistema detecta el código automáticamente y registra tu asistencia." },
            ].map((s) => (
              <li key={s.num} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-[11px] font-bold text-yellow-400">
                  {s.num}
                </span>
                <span className="text-sm text-gray-400 leading-snug">{s.text}</span>
              </li>
            ))}
          </ol>

          <button
            id="btn-activar-camara"
            onClick={handleIniciar}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-yellow-400 py-3 text-sm font-bold text-black hover:bg-yellow-300 transition active:scale-[0.98]"
          >
            <Camera size={18} />
            Activar cámara
          </button>
        </div>
      )}

      {/* ── VISOR DE CÁMARA ── */}
      {estado === ESTADO.SCANNING && (
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">Cámara activa</span>
            </div>
            <div className="flex items-center gap-2">
              {camaras.length > 1 && (
                <button
                  id="btn-cambiar-camara"
                  onClick={handleCambiarCamara}
                  title="Cambiar cámara"
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                id="btn-detener-camara"
                onClick={async () => { await detenerScanner(); setEstado(ESTADO.IDLE); }}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                title="Detener"
              >
                <CameraOff size={16} />
              </button>
            </div>
          </div>

          {/* Región donde Html5Qrcode monta el video */}
          <div className="relative bg-black" style={{ minHeight: 300 }}>
            <div id={regionId} className="w-full" />
            {/* Overlay de esquinas decorativas */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative w-52 h-52">
                {/* Esquinas */}
                {["tl","tr","bl","br"].map((pos) => (
                  <span
                    key={pos}
                    className={`absolute w-8 h-8 border-yellow-400 border-2 rounded-sm
                      ${pos === "tl" ? "top-0 left-0 border-r-0 border-b-0" : ""}
                      ${pos === "tr" ? "top-0 right-0 border-l-0 border-b-0" : ""}
                      ${pos === "bl" ? "bottom-0 left-0 border-r-0 border-t-0" : ""}
                      ${pos === "br" ? "bottom-0 right-0 border-l-0 border-t-0" : ""}
                    `}
                  />
                ))}
                {/* Línea de escaneo animada */}
                <span className="absolute left-1 right-1 top-1/2 h-0.5 bg-yellow-400/70 rounded-full animate-scan-line" />
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 py-3 px-4">
            Centra el código QR de la sesión dentro del recuadro
          </p>
        </div>
      )}

      {/* ── LOADING ── */}
      {estado === ESTADO.LOADING && (
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Verificando asistencia…</p>
        </div>
      )}

      {/* ── RESULTADO (success / already / not_enroll / error) ── */}
      {isResult && (() => {
        const cfg = resultConfig[estado];
        return (
          <div className={`rounded-2xl border p-6 space-y-5 ${cfg.color}`}>
            <div className="flex flex-col items-center text-center gap-3">
              {cfg.icon}
              <div>
                <h2 className="text-xl font-bold text-white">{cfg.title}</h2>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
                  {mensaje}
                </p>
              </div>
            </div>

            {/* Detalle de la sesión si disponible */}
            {sesionInfo && (
              <div className="rounded-xl border border-gray-800 bg-[#14171c] p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Sesión
                </p>
                <p className="text-white font-semibold">
                  {sesionInfo.disciplina?.nombre_disciplina ?? `Sesión #${sesionInfo.id_sesion}`}
                </p>
                {sesionInfo.fecha && (
                  <p className="text-xs text-gray-400">
                    {sesionInfo.fecha} · {sesionInfo.hora_inicio}
                  </p>
                )}
              </div>
            )}

            {/* Alerta especial para no inscrito */}
            {estado === ESTADO.NOT_ENROLL && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  <span className="font-bold">No puedes pasar lista en esta clase.</span>{" "}
                  Para inscribirte, comunícate con la administración del club o con tu instructor.
                </p>
              </div>
            )}

            <button
              id="btn-escanear-de-nuevo"
              onClick={handleReiniciar}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 py-3 text-sm font-bold text-white hover:bg-gray-700 transition"
            >
              <RotateCcw size={16} />
              Escanear otro código
            </button>
          </div>
        );
      })()}

      {/* ── ANIMACIÓN CSS inline ── */}
      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-100px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scanLine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
