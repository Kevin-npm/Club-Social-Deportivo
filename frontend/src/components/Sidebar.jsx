import { Dumbbell, X } from "lucide-react";
import { MenuItems } from "../config/navigation";
import { SidebarItem } from "./SideBarItem";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

const Sidebar = ({ mobileOpen, onClose }) => {
  const { fakeRole } = useRoleSimulator();

  const visibleItems = MenuItems.filter((item) =>
    item.roles.includes(fakeRole)
  );

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
      </aside>
    </>
  );
};

export default Sidebar;
