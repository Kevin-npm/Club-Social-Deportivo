import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, CalendarDays, CreditCard, Bell, LogOut, Menu, X, Shield, QrCode } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/socio",                label: "Mi Perfil",       icon: User },
  { to: "/socio/asistencia",     label: "Asistencia QR",   icon: QrCode },
  { to: "/socio/reservas",       label: "Reservas",        icon: CalendarDays },
  { to: "/socio/pagos",          label: "Mis Pagos",       icon: CreditCard },
  { to: "/socio/notificaciones", label: "Notificaciones",  icon: Bell },
];

export default function SocioLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    path === "/socio"
      ? location.pathname === "/socio"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#14171c] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/10">
            <Shield size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Club Social</p>
            <p className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Logout visible en desktop */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
          {/* Hamburger en móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── MENÚ MÓVIL (drawer) ── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 h-full w-64 bg-[#14171c] border-l border-gray-800 p-5 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 mt-12">Navegación</p>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive(to)
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="mt-auto pt-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR DESKTOP ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#14171c] border-r border-gray-800 p-4 gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">Menú</p>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(to)
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── NAV INFERIOR MÓVIL ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14171c] border-t border-gray-800 flex">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-semibold gap-1 transition ${
              isActive(to) ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}