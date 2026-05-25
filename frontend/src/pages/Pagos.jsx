import {
  CreditCard,
  Search,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  User,
  Hash,
  DollarSign,
  FileText,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

const Pagos = () => {
  // ── Datos ─────────────────────────────────────────────────────────────────
  const [pagos,   setPagos]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [searchQuery,   setSearchQuery]   = useState("");
  const [fechaInicio,   setFechaInicio]   = useState("");
  const [fechaFin,      setFechaFin]      = useState("");

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const hoy   = new Date().toISOString().split("T")[0];
    const total = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
    const hoyPagos = pagos.filter(p => p.fecha_pago?.startsWith(hoy));
    return {
      totalPagos:  pagos.length,
      montoTotal:  total,
      pagosHoy:    hoyPagos.length,
      montoHoy:    hoyPagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0),
    };
  }, [pagos]);

  // ── Fetch pagos ───────────────────────────────────────────────────────────
  const fetchPagos = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.fecha_inicio) query.set("fecha_inicio", params.fecha_inicio);
      if (params.fecha_fin)    query.set("fecha_fin",    params.fecha_fin);

      const url    = `http://localhost:8000/api/pagos${query.toString() ? "?" + query : ""}`;
      const res    = await fetch(url, { headers: { Accept: "application/json" } });
      const result = await res.json();
      if (result.status === "success") setPagos(result.data);
    } catch (err) {
      console.error("Error cargando pagos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPagos(); }, []);

  // ── Filtro local por nombre o folio ──────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return pagos;
    const q = searchQuery.toLowerCase();
    return pagos.filter(p => {
      const nombre = p.socio ? `${p.socio.nombre} ${p.socio.apellidos}`.toLowerCase() : "";
      return (
        nombre.includes(q) ||
        p.folio_digital?.toLowerCase().includes(q) ||
        p.concepto?.toLowerCase().includes(q)
      );
    });
  }, [pagos, searchQuery]);

  const aplicarFiltros = () => fetchPagos({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setSearchQuery("");
    fetchPagos();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ── StatCards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total pagos"    value={stats.totalPagos}                        icon={<FileText size={20}/>}    color="text-blue-400"/>
        <StatCard title="Monto total"    value={`$${stats.montoTotal.toLocaleString("es-MX", {minimumFractionDigits: 2})}`} icon={<DollarSign size={20}/>}  color="text-green-400"/>
        <StatCard title="Pagos hoy"      value={stats.pagosHoy}                          icon={<Clock size={20}/>}       color="text-yellow-400"/>
        <StatCard title="Recaudado hoy"  value={`$${stats.montoHoy.toLocaleString("es-MX", {minimumFractionDigits: 2})}`}  icon={<CreditCard size={20}/>}  color="text-purple-400"/>
      </div>

      {/* ── Tabla de pagos ── */}
      <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-blue-400"/>
            <h2 className="text-lg font-bold">Registro de Pagos</h2>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {pagosFiltrados.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPagos({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })}
              className="p-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg border border-gray-700 transition-all"
              title="Actualizar"
            >
              <RefreshCw size={14}/>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14}/> Registrar Pago
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-5 border-b border-gray-800 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Fecha inicio */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Desde</label>
              <input
                type="date"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-all"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
              />
            </div>
            {/* Fecha fin */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Hasta</label>
              <input
                type="date"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-all"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
              />
            </div>
            <button
              onClick={aplicarFiltros}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Aplicar
            </button>
            {(fechaInicio || fechaFin) && (
              <button onClick={limpiarFiltros} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <X size={12}/> Limpiar
              </button>
            )}

            {/* Búsqueda */}
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input
                type="text"
                placeholder="Buscar por socio, folio o concepto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={12}/>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-4 font-medium">Folio</th>
                <th className="px-6 py-4 font-medium">Socio</th>
                <th className="px-6 py-4 font-medium">Concepto</th>
                <th className="px-6 py-4 font-medium">Método</th>
                <th className="px-6 py-4 font-medium">Monto</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">Cargando pagos...</td></tr>
              ) : pagosFiltrados.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 italic">Sin registros de pago.</td></tr>
              ) : pagosFiltrados.map(p => (
                <tr key={p.id_pago} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      {p.folio_digital}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">
                      {p.socio ? `${p.socio.nombre} ${p.socio.apellidos}` : `#${p.id_socio}`}
                    </p>
                    <p className="text-xs text-gray-500">{p.socio?.tipo_membresia}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{p.concepto}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{p.metodo?.nombre_metodo ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-bold text-sm">
                      ${parseFloat(p.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {p.fecha_pago
                      ? new Date(p.fecha_pago).toLocaleString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {p.referencia ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isAddOpen && (
        <AddPagoModal
          onClose={() => setIsAddOpen(false)}
          onRefresh={() => fetchPagos({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })}
        />
      )}
    </div>
  );
};

// ── Modal de registro de pago ─────────────────────────────────────────────────

const AddPagoModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    id_socio:   "",
    id_metodo:  "",
    monto:      "",
    concepto:   "",
    referencia: "",
  });
  const [metodos,  setMetodos]  = useState([]);
  const [socios,   setSocios]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [success,  setSuccess]  = useState(null);

  // Búsqueda de socio dentro del modal
  const [socioQuery,    setSocioQuery]    = useState("");
  const [socioResultados, setSocioResultados] = useState([]);
  const [socioSelected, setSocioSelected] = useState(null);
  const [buscandoSocio, setBuscandoSocio] = useState(false);
  const [showSocioList, setShowSocioList] = useState(false);
  const debounceRef = useRef(null);
  const socioRef    = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [m, s] = await Promise.all([
          fetch("http://localhost:8000/api/pagos/metodos", { headers: { Accept: "application/json" } }).then(r => r.json()),
          fetch("http://localhost:8000/api/socios",        { headers: { Accept: "application/json" } }).then(r => r.json()),
        ]);
        if (m.status === "success") setMetodos(m.data);
        if (s.data) setSocios(s.data);
      } catch (err) { console.error(err); }
    };
    cargar();

    // Cerrar dropdown al clic fuera
    const handleClick = (e) => {
      if (socioRef.current && !socioRef.current.contains(e.target)) setShowSocioList(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Búsqueda de socio con debounce
  const handleSocioQuery = (val) => {
    setSocioQuery(val);
    setSocioSelected(null);
    setFormData(prev => ({ ...prev, id_socio: "" }));
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSocioResultados([]); setShowSocioList(false); return; }
    debounceRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      const filtered = socios.filter(s =>
        `${s.nombre} ${s.apellidos}`.toLowerCase().includes(q) ||
        (s.numero_documento && s.numero_documento.toLowerCase().includes(q))
      );
      setSocioResultados(filtered.slice(0, 8));
      setShowSocioList(true);
    }, 300);
  };

  const seleccionarSocio = (s) => {
    setSocioSelected(s);
    setSocioQuery(`${s.nombre} ${s.apellidos}`);
    setFormData(prev => ({ ...prev, id_socio: s.id_socio }));
    setShowSocioList(false);
    setErrors(prev => ({ ...prev, id_socio: null }));
  };

  const field = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.id_socio)  e.id_socio  = "Selecciona un socio";
    if (!formData.id_metodo) e.id_metodo = "Requerido";
    if (!formData.monto || parseFloat(formData.monto) <= 0) e.monto = "Ingresa un monto válido";
    if (!formData.concepto)  e.concepto  = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/pagos", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess(result.data);
        onRefresh();
      } else {
        if (result.errors) setErrors(result.errors);
      }
    } catch (err) {
      console.error("Error al registrar pago:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#23272f]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <CreditCard size={18}/>
            </div>
            <h2 className="text-lg font-bold">Registrar Pago</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400">
            <X size={18}/>
          </button>
        </div>

        {/* Éxito */}
        {success ? (
          <div className="p-6 space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center space-y-2">
              <CheckCircle size={36} className="text-green-400 mx-auto"/>
              <p className="text-green-400 font-bold text-lg">¡Pago registrado!</p>
              <p className="text-gray-400 text-sm">Membresía actualizada a Vigente</p>
              <div className="bg-gray-900/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-500 uppercase font-bold">Folio generado</p>
                <p className="font-mono text-blue-400 font-bold text-lg">{success.folio_digital}</p>
              </div>
              <div className="text-left grid grid-cols-2 gap-2 mt-2 text-sm">
                <InfoItem label="Socio"   value={`${success.socio?.nombre} ${success.socio?.apellidos}`}/>
                <InfoItem label="Monto"   value={`$${parseFloat(success.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}/>
                <InfoItem label="Método"  value={success.metodo?.nombre_metodo}/>
                <InfoItem label="Concepto" value={success.concepto}/>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* Buscar socio */}
            <div className="space-y-1.5" ref={socioRef}>
              <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                <User size={12}/> Socio *
              </label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={socioQuery}
                  onChange={e => handleSocioQuery(e.target.value)}
                  className={`w-full bg-gray-900 border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white outline-none transition-all ${errors.id_socio ? "border-red-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {showSocioList && socioResultados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1f26] border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                    {socioResultados.map(s => (
                      <button
                        key={s.id_socio}
                        type="button"
                        onClick={() => seleccionarSocio(s)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{s.nombre} {s.apellidos}</p>
                          <p className="text-xs text-gray-500">{s.numero_documento ?? `ID #${s.id_socio}`}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.estatus_financiero === "Vigente" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {s.estatus_financiero}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.id_socio && <p className="text-red-400 text-xs">{errors.id_socio}</p>}

              {/* Info del socio seleccionado */}
              {socioSelected && (
                <div className="bg-gray-900/50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {socioSelected.tipo_membresia} · Est. financiero:
                    <span className={`ml-1 font-bold ${socioSelected.estatus_financiero === "Vigente" ? "text-green-400" : "text-red-400"}`}>
                      {socioSelected.estatus_financiero}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Método de pago y Monto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                  <CreditCard size={12}/> Método *
                </label>
                <select
                  className={`w-full bg-gray-900 border rounded-lg p-2.5 text-sm text-white outline-none cursor-pointer transition-all ${errors.id_metodo ? "border-red-500" : "border-gray-700 focus:border-blue-500"}`}
                  value={formData.id_metodo}
                  onChange={e => field("id_metodo", e.target.value)}
                >
                  <option value="">Selecciona...</option>
                  {metodos.map(m => (
                    <option key={m.id_metodo} value={m.id_metodo}>{m.nombre_metodo}</option>
                  ))}
                </select>
                {errors.id_metodo && <p className="text-red-400 text-xs">{errors.id_metodo}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                  <DollarSign size={12}/> Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full bg-gray-900 border rounded-lg pl-7 pr-3 py-2.5 text-sm text-white outline-none transition-all ${errors.monto ? "border-red-500" : "border-gray-700 focus:border-blue-500"}`}
                    value={formData.monto}
                    onChange={e => field("monto", e.target.value)}
                  />
                </div>
                {errors.monto && <p className="text-red-400 text-xs">{errors.monto}</p>}
              </div>
            </div>

            {/* Concepto */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                <FileText size={12}/> Concepto *
              </label>
              <input
                type="text"
                placeholder="Ej. Mensualidad Abril 2026"
                className={`w-full bg-gray-900 border rounded-lg p-2.5 text-sm text-white outline-none transition-all ${errors.concepto ? "border-red-500" : "border-gray-700 focus:border-blue-500"}`}
                value={formData.concepto}
                onChange={e => field("concepto", e.target.value)}
              />
              {errors.concepto && <p className="text-red-400 text-xs">{errors.concepto}</p>}
            </div>

            {/* Referencia */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                <Hash size={12}/> Referencia
                <span className="text-gray-600 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Número de transferencia, cheque, etc."
                className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg p-2.5 text-sm text-white outline-none transition-all"
                value={formData.referencia}
                onChange={e => field("referencia", e.target.value)}
              />
            </div>

            {/* Nota folio */}
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Hash size={11}/> El folio digital se generará automáticamente al registrar el pago.
            </p>

            {/* Footer */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-all border border-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-900/20"
              >
                {loading ? <span className="animate-pulse">Procesando...</span> : <><Save size={16} className="mr-2"/> Registrar Pago</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#14171c] p-4 rounded-xl border border-gray-800 flex items-center space-x-3">
    <div className={`p-2.5 rounded-lg bg-gray-900 ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-[10px] font-medium uppercase leading-tight">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gray-600 uppercase font-bold">{label}</p>
    <p className="text-sm text-white font-semibold">{value ?? "—"}</p>
  </div>
);

export default Pagos;