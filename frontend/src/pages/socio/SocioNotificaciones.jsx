import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioNotificaciones() {
  const { token } = useAuth();

  const [notificaciones, setNotificaciones] = useState([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "Fecha no registrada";

    return new Date(dateValue).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularSinLeer = (lista) =>
    lista.filter((notificacion) => !notificacion.leido_boolean).length;

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/socio/notificaciones`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron cargar las notificaciones.");
        return;
      }

      const lista = data.data || [];
      setNotificaciones(lista);
      setSinLeer(data.sin_leer ?? calcularSinLeer(lista));
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    setAccionLoading(idNotificacion);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/socio/notificaciones/${idNotificacion}/leer`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo marcar la notificación como leída.");
        return;
      }

      const actualizadas = notificaciones.map((notificacion) =>
        notificacion.id_notificacion === idNotificacion
          ? { ...notificacion, leido_boolean: true }
          : notificacion
      );

      setNotificaciones(actualizadas);
      setSinLeer(calcularSinLeer(actualizadas));
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setAccionLoading(null);
    }
  };

  const marcarTodasComoLeidas = async () => {
    setMarcandoTodas(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/socio/notificaciones/leer-todas`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron marcar todas como leídas.");
        return;
      }

      const actualizadas = notificaciones.map((notificacion) => ({
        ...notificacion,
        leido_boolean: true,
      }));

      setNotificaciones(actualizadas);
      setSinLeer(0);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setMarcandoTodas(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [token]);

  if (loading) {
    return (
      <p className="text-sm sm:text-base text-slate-600">
        Cargando notificaciones...
      </p>
    );
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Notificaciones
          </h2>

          <p className="text-sm sm:text-base text-slate-500">
            Consulta los avisos importantes relacionados con tu membresía y actividades.
          </p>
        </div>

        {sinLeer > 0 && (
          <button
            onClick={marcarTodasComoLeidas}
            disabled={marcandoTodas}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            {marcandoTodas ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <p className="text-sm text-slate-500">Total de notificaciones</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {notificaciones.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <p className="text-sm text-slate-500">Sin leer</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {sinLeer}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {notificaciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-5 sm:p-6 text-slate-600">
            No tienes notificaciones registradas.
          </div>
        ) : (
          notificaciones.map((notificacion) => (
            <article
              key={notificacion.id_notificacion}
              className={`bg-white rounded-2xl shadow p-5 sm:p-6 border-l-4 ${
                notificacion.leido_boolean
                  ? "border-slate-300"
                  : "border-blue-600"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                    {notificacion.titulo}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 mt-2 break-words">
                    {notificacion.mensaje}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-400 mt-3">
                    {formatDate(notificacion.created_at)}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-3">
                  <span
                    className={`w-fit px-3 py-1 rounded-full text-sm font-semibold ${
                      notificacion.leido_boolean
                        ? "bg-slate-100 text-slate-600"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {notificacion.leido_boolean ? "Leída" : "Nueva"}
                  </span>

                  {!notificacion.leido_boolean && (
                    <button
                      onClick={() =>
                        marcarComoLeida(notificacion.id_notificacion)
                      }
                      disabled={accionLoading === notificacion.id_notificacion}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm rounded-lg px-4 py-2"
                    >
                      {accionLoading === notificacion.id_notificacion
                        ? "Marcando..."
                        : "Marcar como leída"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}