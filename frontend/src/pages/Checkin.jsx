import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  RefreshCw,
  User,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

const CheckinPage = () => {
  // ── Búsqueda ──────────────────────────────────────────────────────────────
  const [query,       setQuery]       = useState("");
  const [resultados,  setResultados]  = useState([]);
  const [buscando,    setBuscando]    = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Estado del check-in ───────────────────────────────────────────────────
  const [resultado,  setResultado]  = useState(null); // { status, message, socio, checkin }
  const [procesando, setProcesando] = useState(false);

  // ── Historial del día ─────────────────────────────────────────────────────
  const [historial,        setHistorial]        = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [fechaFiltro,      setFechaFiltro]      = useState(
    new Date().toISOString().split("T")[0]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     historial.length,
    permitidos: historial.filter(c => c.acceso_permitido).length,
    denegados:  historial.filter(c => !c.acceso_permitido).length,
  }), [historial]);

  // ── Cerrar resultados al hacer clic fuera ─────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Cargar historial ──────────────────────────────────────────────────────
  const fetchHistorial = async (fecha = fechaFiltro) => {
    setLoadingHistorial(true);
    try {
      const res    = await fetch(`http://localhost:8000/api/checkins?fecha=${fecha}`, {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (result.status === "success") setHistorial(result.data);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setResultado(null);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResultados([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res    = await fetch(
          `http://localhost:8000/api/checkins/buscar?q=${encodeURIComponent(val)}`,
          { headers: { Accept: "application/json" } }
        );
        const result = await res.json();
        if (result.status === "success") {
          setResultados(result.data);
          setShowResults(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBuscando(false);
      }
    }, 350);
  };

  // ── Registrar check-in ────────────────────────────────────────────────────
  const registrarCheckin = async (idSocio) => {
    setShowResults(false);
    setQuery("");
    setResultados([]);
    setProcesando(true);
    setResultado(null);
    try {
      const response = await fetch("http://localhost:8000/api/checkins", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify({ id_socio: idSocio }),
      });
      const result = await response.json();
      setResultado(result);
      fetchHistorial(); // Refrescar historial
    } catch (err) {
      console.error("Error en check-in:", err);
    } finally {
      setProcesando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ── StatCards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Check-ins hoy"
          value={stats.total}
          icon={<Users size={20}/>}
          color="text-blue-400"
        />
        <StatCard
          title="Accesos permitidos"
          value={stats.permitidos}
          icon={<CheckCircle size={20}/>}
          color="text-green-400"
        />
        <StatCard
          title="Accesos denegados"
          value={stats.denegados}
          icon={<XCircle size={20}/>}
          color="text-red-400"
        />
      </div>

      {/* ── Layout: Buscador + Historial ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Panel de check-in ── */}
        <div className="space-y-4">

          {/* Buscador */}
          <div className="bg-[#14171c] rounded-xl border border-gray-800 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">Registro de Check-in</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Busca al socio por nombre, documento o ID
              </p>
            </div>

            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input
                  type="text"
                  placeholder="Nombre, número de documento o ID..."
                  value={query}
                  onChange={handleQueryChange}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all"
                  autoComplete="off"
                />
                {buscando && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw size={14} className="text-gray-500 animate-spin"/>
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {showResults && resultados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1f26] border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
                  {resultados.map(s => (
                    <button
                      key={s.id_socio}
                      onClick={() => registrarCheckin(s.id_socio)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {s.nombre?.charAt(0)}{s.apellidos?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {s.nombre} {s.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.numero_documento ?? `ID #${s.id_socio}`} · {s.tipo_membresia}
                          </p>
                        </div>
                      </div>
                      <EstatusFinancieroBadge estatus={s.estatus_financiero}/>
                    </button>
                  ))}
                </div>
              )}

              {showResults && resultados.length === 0 && !buscando && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1f26] border border-gray-700 rounded-xl shadow-2xl z-30 p-4 text-center text-gray-500 text-sm">
                  No se encontraron socios
                </div>
              )}
            </div>
          </div>

          {/* Resultado del check-in */}
          {procesando && (
            <div className="bg-[#14171c] rounded-xl border border-gray-800 p-6 text-center">
              <RefreshCw size={24} className="animate-spin text-blue-400 mx-auto mb-2"/>
              <p className="text-gray-400">Procesando check-in...</p>
            </div>
          )}

          {resultado && !procesando && (
            <ResultadoCheckin resultado={resultado}/>
          )}
        </div>

        {/* ── Historial del día ── */}
        <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400"/>
              <h3 className="font-bold">Historial</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fechaFiltro}
                onChange={e => {
                  setFechaFiltro(e.target.value);
                  fetchHistorial(e.target.value);
                }}
                className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                onClick={() => fetchHistorial(fechaFiltro)}
                className="p-1.5 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg border border-gray-700 transition-all"
              >
                <RefreshCw size={13}/>
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
            {loadingHistorial ? (
              <p className="text-center py-8 text-gray-500 text-sm">Cargando...</p>
            ) : historial.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm italic">
                Sin registros para esta fecha
              </p>
            ) : historial.map(c => (
              <div
                key={c.id_checkin}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Indicador de acceso */}
                  {c.acceso_permitido ? (
                    <CheckCircle size={16} className="text-green-400 shrink-0"/>
                  ) : (
                    <XCircle size={16} className="text-red-400 shrink-0"/>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {c.socio
                        ? `${c.socio.nombre} ${c.socio.apellidos}`
                        : `Socio #${c.id_socio}`}
                    </p>
                    {!c.acceso_permitido && c.motivo_denegado && (
                      <p className="text-xs text-red-400 mt-0.5">{c.motivo_denegado}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Clock size={11}/>
                    {c.hora_entrada
                      ? c.hora_entrada.slice(0, 5)
                      : new Date(c.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {c.socio?.tipo_membresia}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Componente resultado del check-in ─────────────────────────────────────────

const ResultadoCheckin = ({ resultado }) => {
  const permitido = resultado.status === "permitido";
  const socio     = resultado.socio;

  return (
    <div className={`rounded-xl border p-6 space-y-4 transition-all ${
      permitido
        ? "bg-green-500/5 border-green-500/30"
        : "bg-red-500/5 border-red-500/30"
    }`}>
      {/* Icono y mensaje */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${permitido ? "bg-green-500/10" : "bg-red-500/10"}`}>
          {permitido
            ? <CheckCircle size={28} className="text-green-400"/>
            : <XCircle    size={28} className="text-red-400"/>}
        </div>
        <div>
          <p className={`text-lg font-bold ${permitido ? "text-green-400" : "text-red-400"}`}>
            {permitido ? "¡Acceso Permitido!" : "Acceso Denegado"}
          </p>
          <p className="text-gray-400 text-sm">{resultado.message}</p>
        </div>
      </div>

      {/* Info del socio */}
      {socio && (
        <div className="bg-gray-900/50 rounded-xl p-4 grid grid-cols-2 gap-3">
          <InfoItem icon={<User size={13}/>}       label="Nombre"    value={`${socio.nombre} ${socio.apellidos}`}/>
          <InfoItem icon={<CreditCard size={13}/>} label="Documento" value={socio.numero_documento ?? `ID #${socio.id_socio}`}/>
          <InfoItem icon={<Users size={13}/>}      label="Membresía" value={socio.tipo_membresia}/>
          <InfoItem
            icon={<AlertTriangle size={13}/>}
            label="Est. Financiero"
            value={socio.estatus_financiero}
            valueColor={socio.estatus_financiero === "Vigente" ? "text-green-400" : "text-red-400"}
          />
        </div>
      )}

      {/* Hora de registro */}
      {resultado.checkin && (
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <Clock size={11}/>
          Registrado a las {resultado.checkin.hora_entrada?.slice(0, 5) ?? new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-4 rounded-xl border border-gray-800 flex items-center space-x-3">
    <div className={`p-2.5 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-[10px] font-medium uppercase leading-tight">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const EstatusFinancieroBadge = ({ estatus }) => {
  const style = estatus === "Vigente"
    ? "bg-green-500/10 text-green-400"
    : "bg-red-500/10 text-red-400";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style}`}>
      {estatus}
    </span>
  );
};

const InfoItem = ({ icon, label, value, valueColor = "text-white" }) => (
  <div>
    <p className="text-[10px] text-gray-600 uppercase font-bold flex items-center gap-1 mb-0.5">
      {icon} {label}
    </p>
    <p className={`text-sm font-semibold ${valueColor}`}>{value ?? "—"}</p>
  </div>
);

export default CheckinPage;