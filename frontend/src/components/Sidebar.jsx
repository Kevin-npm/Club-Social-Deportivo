import { Dumbbell, X, LogOut } from "lucide-react";
import { MenuItems } from "../config/navigation";
import { SidebarItem } from "./SideBarItem";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.roleString || "admin";

  const visibleItems = MenuItems.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Overlay en móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 w-64 h-full bg-[#14171c] border-r border-gray-800 flex flex-col shrink-0 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo + Close button */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-xl shrink-0">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white tracking-wide">
              CM360
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menú */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {visibleItems.map((item) => (
            <SidebarItem key={item.title} item={item} onClick={onClose} />
          ))}
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
