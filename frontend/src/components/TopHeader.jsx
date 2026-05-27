import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Check, Menu, Repeat } from "lucide-react";
import { headerActions } from "../config/header_actions";
import { useAuth } from "../context/AuthContext";

const SOCIO_ID_SIMULADO = 5;

const TopHeader = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const roleDisplay = user?.roleString || "admin";

  const [notificaciones, setNotificaciones] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentActions = headerActions[location.pathname] || [];
  const pageTitle = location.pathname.replace("/", "") || "Dashboard";

  const noLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leido_boolean).length,
    [notificaciones]
  );

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/mis-notificaciones?id_socio=${SOCIO_ID_SIMULADO}`
      );
      const result = await response.json();

      if (result.status === "success") {
        setNotificaciones(result.data);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/notificaciones/${idNotificacion}/leer`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setNotificaciones((prev) =>
          prev.map((n) =>
            n.id_notificacion === idNotificacion
              ? { ...n, leido_boolean: true }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  const handleRoleChange = () => {
    // Role change removed since we use actual auth now
  };

  return (
    <header className="h-16 md:h-20 bg-[#14171c] border-b border-gray-800 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-bold capitalize truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {currentActions.map((btn, index) => (
          <button
            key={index}
            onClick={btn.action}
            className="hidden md:flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 bg-yellow-400 text-black"
          >
            <btn.icon size={18} className="mr-2" />
            {btn.label}
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              cargarNotificaciones();
            }}
            className="relative p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-all"
            title="Notificaciones"
          >
            <Bell size={20} />

            {noLeidas > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border border-[#14171c]">
                {noLeidas}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-96 max-w-[calc(100vw-1rem)] bg-[#1c1f26] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">
                    Notificaciones
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Socio simulado #{SOCIO_ID_SIMULADO}
                  </p>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-bold shrink-0">
                  {noLeidas} nuevas
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 italic">
                    No hay notificaciones.
                  </p>
                ) : (
                  notificaciones.map((n) => (
                    <button
                      key={n.id_notificacion}
                      onClick={() => marcarComoLeida(n.id_notificacion)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800/60 transition-colors ${
                        !n.leido_boolean ? "bg-yellow-400/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm leading-snug ${
                              !n.leido_boolean
                                ? "font-bold text-white"
                                : "font-medium text-gray-400"
                            }`}
                          >
                            {n.titulo}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-snug break-words">
                            {n.mensaje}
                          </p>
                          <p className="text-[11px] text-gray-600 mt-2">
                            {new Date(n.created_at).toLocaleString("es-MX")}
                          </p>
                        </div>

                        {!n.leido_boolean && (
                          <span className="text-[10px] bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full shrink-0">
                            Nuevo
                          </span>
                        )}

                        {n.leido_boolean && (
                          <Check size={15} className="text-green-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-3 bg-[#14171c] border-t border-gray-800">
                <button
                  onClick={cargarNotificaciones}
                  className="w-full text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Actualizar notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* <button
          onClick={handleRoleChange}
          className="flex items-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold bg-gray-800 text-white border border-gray-700 transition-all hover:scale-105"
          title="Cambiar vista temporal"
        >
          <Repeat size={16} className="mr-1.5 md:mr-2" />
          <span className="hidden sm:inline">{isAdmin ? "Cambiar a Instructor" : "Cambiar a Admin"}</span>
          <span className="sm:hidden">{isAdmin ? "Instructor" : "Admin"}</span>
        </button> */}

        <div className="w-px h-6 md:h-8 bg-gray-800 mx-1 md:mx-2" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs md:text-sm font-bold">Usuario</p>
            <p className="text-[10px] md:text-xs text-yellow-400 capitalize">{roleDisplay}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-full border-2 border-yellow-400" />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;