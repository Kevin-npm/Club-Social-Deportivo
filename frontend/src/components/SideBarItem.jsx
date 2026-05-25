import { NavLink } from "react-router-dom";

export const SidebarItem = ({ item, onClick }) => {
  const { title, icon: Icon, path } = item;

  return (
    <NavLink
      to={path}
      end={path === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-yellow-400 text-black font-semibold"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      <Icon size={20} className="mr-3" />
      <span>{title}</span>
    </NavLink>
  );
};