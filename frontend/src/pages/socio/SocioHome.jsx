import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
  User,
  BadgeCheck,
  ShieldAlert,
  ShieldX,
  CalendarClock,
  CreditCard,
  Hash,
  LogOut,
} from "lucide-react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return "No registrada";
  return new Date(val).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }) {
  const map = {
    Vigente:    { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", Icon: BadgeCheck,  label: "Vigente"    },
    Adeudo:     { bg: "bg-amber-500/15 border-amber-500/30",     text: "text-amber-400",   Icon: ShieldAlert, label: "Adeudo"     },
    Suspendido: { bg: "bg-red-500/15 border-red-500/30",         text: "text-red-400",     Icon: ShieldX,     label: "Suspendido" },
    Inactivo:   { bg: "bg-gray-500/15 border-gray-500/30",       text: "text-gray-400",    Icon: ShieldX,     label: "Inactivo"   },
  };
  const cfg = map[status] || map.Inactivo;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, accent = "yellow" }) {
  const colors = {
    yellow: "bg-yellow-400/10 text-yellow-400",
    blue:   "bg-blue-400/10 text-blue-400",
    purple: "bg-purple-400/10 text-purple-400",
    green:  "bg-emerald-400/10 text-emerald-400",
  };
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-[#1b2130] p-4">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white">{value || "No registrado"}</p>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SocioHome() {
  const { token, logout } = useAuth();
  const navigate          = useNavigate();

  const [socio,   setSocio]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/socio/perfil`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || "No se pudo cargar la información."); return; }
        setSocio(data.socio);
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Cargando perfil...
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );

  const qrValue = JSON.stringify({ id_socio: socio.id_socio });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── HERO CARD ── */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[#14171c] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-yellow-400/5 blur-3xl" />

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10">
              <User size={32} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {socio.nombre} {socio.apellidos}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Socio #{socio.id_socio}</span>
                <span className="text-gray-700">·</span>
                <StatusBadge status={socio.estatus_financiero} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-400">
                {socio.tipo_membresia} — {socio.modalidad}
              </p>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate("/login", { replace: true }); }}
            className="hidden md:flex items-center gap-2 self-start rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── GRID: QR + INFO ── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* ── QR CARD ── */}
        <div className="flex flex-col items-center rounded-3xl border border-gray-800 bg-[#14171c] p-6 gap-5">
          <div>
            <h2 className="text-center text-lg font-bold text-white">Código QR de acceso</h2>
            <p className="text-center text-xs text-gray-500 mt-1">
              Muéstralo en la entrada del club
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xl">
            <QRCodeSVG
              value={qrValue}
              size={200}
              bgColor="#ffffff"
              fgColor="#0b0e14"
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600 font-mono bg-[#0f131a] rounded-lg px-3 py-2 border border-gray-800">
              {qrValue}
            </p>
            <p className="text-[11px] text-gray-600">
              Al escanear se obtiene el ID del socio
            </p>
          </div>
        </div>

        {/* ── DATOS CARD ── */}
        <div className="rounded-3xl border border-gray-800 bg-[#14171c] p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white">Mis datos</h2>
          <div className="grid gap-3">
            <InfoCard icon={Hash}          label="Número de socio"    value={`#${socio.id_socio}`}                    accent="yellow" />
            <InfoCard icon={CreditCard}    label="Tipo de membresía"  value={socio.tipo_membresia}                    accent="blue"   />
            <InfoCard icon={User}          label="Modalidad"          value={socio.modalidad}                         accent="purple" />
            <InfoCard icon={CalendarClock} label="Inicio de vigencia" value={formatDate(socio.fecha_inicio_vigencia)} accent="green"  />
            <InfoCard icon={CalendarClock} label="Fin de vigencia"    value={formatDate(socio.fecha_fin_vigencia)}    accent="green"  />
          </div>
        </div>
      </div>

      {/* ── Cerrar sesión (solo móvil) ── */}
      <div className="md:hidden">
        <button
          onClick={() => { logout(); navigate("/login", { replace: true }); }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}