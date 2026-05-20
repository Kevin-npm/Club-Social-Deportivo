import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SocioLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Mi información", path: "/socio" },
    { label: "Mis reservas", path: "/socio/reservas" },
    { label: "Mis pagos", path: "/socio/pagos" },
    { label: "Notificaciones", path: "/socio/notificaciones" },
  ];

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-200 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Portal del Socio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="lg:flex">
        <aside className="bg-slate-900 text-white lg:w-64 lg:min-h-[calc(100vh-73px)]">
          <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-col lg:gap-3 lg:p-5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/socio"}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}