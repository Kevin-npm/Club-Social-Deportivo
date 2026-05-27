import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, CalendarDays, UserCheck,
  FileDown, RefreshCcw, TrendingUp, Dumbbell,
  Activity, Clock, ChevronUp, ChevronDown, Upload,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import API_BASE from "../../config/api";

// ── Fallback demo data ─────────────────────────────────────────────────────────
const DEMO = {
  kpis: { totalSociosActivos:248, sociosTitulares:185, sociosMiembros:63,
    totalInstructores:12, instalacionesOcupadas:3, totalInstalaciones:8,
    sesionesHoy:8, crecimientoMes:12.5 },
  accionesPorTipo: [{ name:"Accionista", value:185 },{ name:"Rentista", value:63 }],
  nuevosSociosPorMes: [
    {mes:"Dic 25",socios:18},{mes:"Ene 26",socios:22},{mes:"Feb 26",socios:15},
    {mes:"Mar 26",socios:31},{mes:"Abr 26",socios:28},{mes:"May 26",socios:24},
  ],
  proximasSesiones: [
    {id:1,sesion_nombre:"Yoga Matutino",fecha_inicio:"2026-05-27T07:00:00",instructor_nombre:"Ana García",instalacion_nombre:"Sala Yoga",capacidad_maxima:15},
    {id:2,sesion_nombre:"Spinning Avanzado",fecha_inicio:"2026-05-27T08:30:00",instructor_nombre:"Carlos Ruiz",instalacion_nombre:"Sala Spinning",capacidad_maxima:20},
    {id:3,sesion_nombre:"Natación Adultos",fecha_inicio:"2026-05-27T09:00:00",instructor_nombre:"María López",instalacion_nombre:"Alberca",capacidad_maxima:25},
    {id:4,sesion_nombre:"Crossfit Pro",fecha_inicio:"2026-05-27T10:00:00",instructor_nombre:"Luis Torres",instalacion_nombre:"Gimnasio",capacidad_maxima:12},
    {id:5,sesion_nombre:"Zumba Fun",fecha_inicio:"2026-05-27T11:00:00",instructor_nombre:"Sofía Méndez",instalacion_nombre:"Aeróbicos",capacidad_maxima:30},
  ],
  estatusFinanciero:[
    {estatus_financiero:"Vigente",total:196},
    {estatus_financiero:"Adeudo",total:32},
    {estatus_financiero:"Suspendido",total:20},
  ],
};

const PIE_COLORS   = ["#FACC15","#3B82F6","#10B981","#F97316"];
const LINE_COLOR   = "#FACC15";

const fmt = (d) => {
  if (!d) return "—";
  // Backend returns "YYYY-MM-DDTHH:MM:SS" or just "HH:MM:SS"
  const date = d.includes("T") ? new Date(d) : new Date(`1970-01-01T${d}`);
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};
const today = () => new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className={`bg-[#14171c] border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-600 transition-all duration-300 group`}>
    <div className={`p-3 rounded-xl ${color} shrink-0`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider truncate">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      {sub  && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-[11px] font-semibold mt-1 flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          {Math.abs(trend)}% vs mes anterior
        </p>
      )}
    </div>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const Badge = ({ label }) => {
  const map = { Vigente:"bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
                Adeudo:"bg-amber-500/15 text-amber-400 border-amber-500/20",
                Suspendido:"bg-red-500/15 text-red-400 border-red-500/20" };
  const cls = map[label] || "bg-gray-500/15 text-gray-400 border-gray-500/20";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
};

// ── PDF Export ────────────────────────────────────────────────────────────────
const generatePDF = (data) => {
  const kpis      = data.kpis;
  const sesiones  = data.proximasSesiones;
  const acciones  = data.accionesPorTipo;
  const estatus   = data.estatusFinanciero;
  const fecha     = new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});
  const total     = kpis.totalSociosActivos || 1;

  const win = window.open("","_blank","width=900,height=700");
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <title>Reporte Ejecutivo – clubdeportivo360</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#111;background:#fff;font-size:12px;padding:30px 40px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #FACC15;padding-bottom:18px;margin-bottom:22px}
    .brand{display:flex;align-items:center;gap:12px}
    .logo{width:46px;height:46px;background:#FACC15;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}
    .cn{font-size:20px;font-weight:700}.cs{font-size:10px;color:#666;margin-top:2px}
    .rt{font-size:13px;font-weight:700;color:#333;text-align:right}.rd{font-size:10px;color:#666;margin-top:4px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px}
    .card{border:1px solid #e5e7eb;border-radius:10px;padding:14px;background:#fafafa}
    .cl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;margin-bottom:4px}
    .cv{font-size:22px;font-weight:700;color:#111}.cs2{font-size:10px;color:#666;margin-top:3px}
    .ca{border-top:3px solid #FACC15}.cb{border-top:3px solid #3B82F6}.cg{border-top:3px solid #10B981}.co{border-top:3px solid #F97316}
    .sec{margin-bottom:20px;page-break-inside:avoid}
    .sh{font-size:12px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:10px;display:flex;align-items:center;gap:6px}
    .dot{width:7px;height:7px;border-radius:50%;background:#FACC15;display:inline-block}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th{background:#111;color:#FACC15;padding:7px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
    td{padding:7px 10px;border-bottom:1px solid #f3f4f6;color:#374151}
    tr:nth-child(even) td{background:#fafafa}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px}
    .ftr{border-top:1px solid #e5e7eb;padding-top:10px;margin-top:24px;display:flex;justify-content:space-between}
    .ft{font-size:10px;color:#9ca3af}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="hdr">
    <div class="brand"><div class="logo">🏋️</div>
      <div><div class="cn">clubdeportivo360</div><div class="cs">Sistema Integral de Gestión Deportiva</div></div>
    </div>
    <div><div class="rt">Reporte Ejecutivo de Administración</div><div class="rd">Generado: ${fecha}</div></div>
  </div>
  <div class="grid">
    <div class="card ca"><div class="cl">Socios Activos</div><div class="cv">${kpis.totalSociosActivos}</div><div class="cs2">${kpis.sociosTitulares} Titulares · ${kpis.sociosMiembros} Miembros</div></div>
    <div class="card cb"><div class="cl">Instructores</div><div class="cv">${kpis.totalInstructores}</div><div class="cs2">Contratados actualmente</div></div>
    <div class="card cg"><div class="cl">Instalaciones</div><div class="cv">${kpis.instalacionesOcupadas}/${kpis.totalInstalaciones}</div><div class="cs2">En uso hoy</div></div>
    <div class="card co"><div class="cl">Sesiones Hoy</div><div class="cv">${kpis.sesionesHoy}</div><div class="cs2">Clases programadas</div></div>
  </div>
  <div class="two">
    <div class="sec"><div class="sh"><span class="dot"></span>Distribución de Acciones</div>
      <table><thead><tr><th>Tipo</th><th>Socios</th><th>%</th></tr></thead><tbody>
      ${acciones.map(a=>`<tr><td>${a.name||a.tipo_membresia||""}</td><td>${a.value||a.total||0}</td><td>${Math.round(((a.value||a.total||0)/total)*100)}%</td></tr>`).join("")}
      </tbody></table>
    </div>
    <div class="sec"><div class="sh"><span class="dot"></span>Estatus Financiero</div>
      <table><thead><tr><th>Estatus</th><th>Total</th></tr></thead><tbody>
      ${estatus.map(e=>`<tr><td>${e.estatus_financiero}</td><td>${e.total}</td></tr>`).join("")}
      </tbody></table>
    </div>
  </div>
  <div class="sec"><div class="sh"><span class="dot"></span>Sesiones del Día</div>
    <table><thead><tr><th>Sesión</th><th>Hora</th><th>Instructor</th><th>Instalación</th><th>Cap.</th></tr></thead><tbody>
    ${sesiones.map(s=>`<tr><td>${s.sesion_nombre||"—"}</td><td>${fmt(s.fecha_inicio)}</td><td>${(s.instructor_nombre||"Sin asignar").trim()}</td><td>${s.instalacion_nombre||"—"}</td><td style="text-align:center">${s.capacidad_maxima||"—"}</td></tr>`).join("")}
    </tbody></table>
  </div>
  <div class="ftr">
    <span class="ft">clubdeportivo360 — Reporte generado automáticamente</span>
    <span class="ft">Página 1 de 1</span>
  </div>
  <script>window.onload=()=>{window.print()}</script>
  </body></html>`);
  win.document.close();
};

// ── CSV Export ────────────────────────────────────────────────────────────────
const exportarSociosCSV = async () => {
  try {
    const res = await fetch(`${API_BASE}/socios`);
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      alert("No hay socios para exportar.");
      return;
    }

    const socios = json.data;
    // Extraer las cabeceras (usamos las claves del primer socio)
    const cabeceras = [
      "ID", "Nombre", "Apellidos", "Fecha Nacimiento", "Género", 
      "Tipo Membresía", "Modalidad", "Estatus Financiero", "Es Titular"
    ];

    // Mapear los datos a filas CSV
    const filas = socios.map(s => [
      s.id_socio,
      `"${s.nombre || ''}"`,
      `"${s.apellidos || ''}"`,
      s.fecha_nacimiento,
      s.genero,
      s.tipo_membresia,
      s.modalidad,
      s.estatus_financiero,
      s.es_titular ? "Sí" : "No"
    ]);

    // Unir cabeceras y filas
    const contenidoCSV = [cabeceras.join(",")].concat(filas.map(f => f.join(","))).join("\n");

    // Crear el Blob con BOM para forzar UTF-8 en Excel
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `socios_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error al exportar CSV:", error);
    alert("Hubo un error al exportar el CSV.");
  }
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo,  setIsDemo]  = useState(false);
  const [last,    setLast]    = useState(new Date());

  // Filters
  const [fEstatus, setFEstatus] = useState("");
  const [fTipo,    setFTipo]    = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/admin/dashboard`);
      const json = await res.json();
      if (json.status === "success") { setData(json.data); setIsDemo(false); }
      else throw new Error();
    } catch {
      setData(DEMO); setIsDemo(true);
    } finally {
      setLoading(false); setLast(new Date());
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const d          = data || DEMO;
  const kpis       = d.kpis;
  const sesiones   = (d.proximasSesiones || []);
  const acciones   = (d.accionesPorTipo  || []);
  const sociosMes  = (d.nuevosSociosPorMes || []);
  const estatus    = (d.estatusFinanciero  || []);

  const sesFiltradas = sesiones.filter(s =>
    (!fEstatus) && (!fTipo || (s.sesion_nombre||"").toLowerCase().includes(fTipo.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-black" />
            </span>
            Dashboard de Administración
          </h1>
          <p className="text-gray-500 text-sm mt-1 capitalize">{today()}</p>
          {isDemo && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 mt-1 inline-block">
              ⚡ Modo demostración — conecta el backend para datos reales
            </span>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14171c] border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white text-sm transition">
            <RefreshCcw size={14} /> Actualizar
          </button>
          <button onClick={exportarSociosCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14171c] border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white text-sm transition">
            <FileDown size={14} /> Exportar Socios (CSV)
          </button>
          <button onClick={() => generatePDF(d)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20">
            <FileDown size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}      label="Socios Activos"   value={kpis.totalSociosActivos}
          sub={`${kpis.sociosTitulares} Titulares · ${kpis.sociosMiembros} Miembros`}
          color="bg-blue-500/10 text-blue-400" trend={kpis.crecimientoMes} />
        <KpiCard icon={Dumbbell}   label="Instructores"     value={kpis.totalInstructores}
          sub="Contratados actualmente" color="bg-purple-500/10 text-purple-400" />
        <KpiCard icon={Building2}  label="Instalaciones"
          value={`${kpis.instalacionesOcupadas} / ${kpis.totalInstalaciones}`}
          sub="Ocupadas hoy" color="bg-emerald-500/10 text-emerald-400" />
        <KpiCard icon={CalendarDays} label="Sesiones Hoy"   value={kpis.sesionesHoy}
          sub="Clases programadas" color="bg-yellow-500/10 text-yellow-400" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut acciones */}
        <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <h2 className="text-sm font-bold text-white">Acciones del Club</h2>
            <span className="text-xs text-gray-500 ml-auto">Accionista vs Rentista</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={acciones} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                paddingAngle={4} dataKey="value" nameKey="name">
                {acciones.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={{background:"#14171c",border:"1px solid #374151",borderRadius:8,color:"#fff",fontSize:12}}
                formatter={(v,n)=>[v, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,color:"#9ca3af"}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart nuevos socios */}
        <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <h2 className="text-sm font-bold text-white">Registro de Nuevos Socios</h2>
            <span className="text-xs text-gray-500 ml-auto">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sociosMes} margin={{left:-10,right:10}}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FACC15" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="mes" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#14171c",border:"1px solid #374151",borderRadius:8,color:"#fff",fontSize:12}}/>
              <Line type="monotone" dataKey="socios" stroke={LINE_COLOR} strokeWidth={2.5}
                dot={{fill:LINE_COLOR,strokeWidth:0,r:4}} activeDot={{r:6,fill:LINE_COLOR}} name="Nuevos socios"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filters + Sessions table ── */}
      <div className="bg-[#14171c] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            <h2 className="text-sm font-bold text-white">Sesiones del Día</h2>
            <span className="ml-2 text-[11px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5">
              {sesiones.length} programadas
            </span>
          </div>
          <div className="flex gap-2">
            <input value={fTipo} onChange={e=>setFTipo(e.target.value)} placeholder="Buscar sesión…"
              className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-1.5 text-xs text-white outline-none focus:border-yellow-400 transition w-36"/>
            <select value={fEstatus} onChange={e=>setFEstatus(e.target.value)}
              className="rounded-lg border border-gray-700 bg-[#0f131a] px-3 py-1.5 text-xs text-white outline-none focus:border-yellow-400 transition">
              <option value="">Todos</option>
              <option value="Vigente">Vigente</option>
              <option value="Adeudo">Adeudo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {["Sesión","Hora","Instructor","Instalación","Capacidad"].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sesFiltradas.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600 text-sm">No hay sesiones para hoy</td></tr>
              ) : sesFiltradas.map((s,i) => (
                <tr key={s.id || i} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3 font-medium text-white">{s.sesion_nombre || "—"}</td>
                  <td className="px-5 py-3 text-yellow-400 font-mono text-sm">{fmt(s.fecha_inicio)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {(s.instructor_nombre||"?").trim()[0]?.toUpperCase()}
                      </div>
                      <span className="text-gray-300 text-sm">{(s.instructor_nombre||"Sin asignar").trim() || "Sin asignar"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-sm">{s.instalacion_nombre || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
                      {s.capacidad_maxima || "—"} lugares
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Estatus financiero ── */}
      <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <h2 className="text-sm font-bold text-white">Estatus Financiero de Socios</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {estatus.map((e,i) => {
            const colors = ["bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            "bg-red-500/10 text-red-400 border-red-500/20"];
            const pct = kpis.totalSociosActivos > 0 ? Math.round((e.total / kpis.totalSociosActivos)*100) : 0;
            const barColors = ["bg-emerald-400","bg-amber-400","bg-red-400"];
            return (
              <div key={i} className={`rounded-xl border p-4 ${colors[i]?.split(" ").slice(2).join(" ")}`}>
                <div className="flex justify-between items-center mb-2">
                  <Badge label={e.estatus_financiero} />
                  <span className="text-xl font-bold">{e.total}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColors[i]} transition-all duration-700`} style={{width:`${pct}%`}} />
                </div>
                <p className="text-[11px] opacity-70 mt-1">{pct}% del total activo</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-700">
        Última actualización: {last.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
      </p>
    </div>
  );
}
