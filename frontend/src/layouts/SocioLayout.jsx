import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SocioLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Portal del Socio
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-slate-900 text-white p-5">
          <nav className="flex flex-col gap-3">
            <Link
              to="/socio"
              className="rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Mi información
            </Link>

            <Link
              to="/socio/reservas"
              className="rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Mis reservas
            </Link>

            <Link
              to="/socio/pagos"
              className="rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Mis pagos
            </Link>

            <Link
              to="/socio/notificaciones"
              className="rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Notificaciones
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}