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

  const calcularSinLeer = (lista) => {
    return lista.filter((notificacion) => !notificacion.leido_boolean).length;
  };

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setMarcandoTodas(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [token]);

  if (loading) {
    return <p className="text-slate-300">Cargando notificaciones...</p>;
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Notificaciones
          </h2>

          <p className="text-slate-400">
            Consulta los avisos importantes relacionados con tu membresía y actividades.
          </p>
        </div>

        {sinLeer > 0 && (
          <button
            onClick={marcarTodasComoLeidas}
            disabled={marcandoTodas}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-900/50 text-slate-950 font-semibold rounded-lg px-4 py-2"
          >
            {marcandoTodas ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-950/50 border border-red-800 text-red-300 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6">
          <p className="text-sm text-slate-400">Total de notificaciones</p>
          <p className="text-3xl font-bold text-white">
            {notificaciones.length}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6">
          <p className="text-sm text-slate-400">Sin leer</p>
          <p className="text-3xl font-bold text-yellow-400">{sinLeer}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {notificaciones.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6 text-slate-300">
            No tienes notificaciones registradas.
          </div>
        ) : (
          notificaciones.map((notificacion) => (
            <article
              key={notificacion.id_notificacion}
              className={`bg-slate-900 border border-slate-800 rounded-2xl shadow p-6 border-l-4 ${
                notificacion.leido_boolean
                  ? "border-l-slate-700"
                  : "border-l-yellow-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {notificacion.titulo}
                  </h3>

                  <p className="text-slate-300 mt-2">
                    {notificacion.mensaje}
                  </p>

                  <p className="text-sm text-slate-500 mt-3">
                    {formatDate(notificacion.created_at)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      notificacion.leido_boolean
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
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
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-900/50 text-slate-950 font-semibold text-sm rounded-lg px-4 py-2"
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