import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioReservas() {
  const { token } = useAuth();

  const [reservas, setReservas] = useState([]);
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "No registrada";

    return new Date(dateValue).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEspacioNombre = (reserva) => {
    return (
      reserva?.espacio?.nombre ||
      reserva?.espacio?.nombre_espacio ||
      reserva?.espacio?.nombre_instalacion ||
      "Sin espacio"
    );
  };

  const fetchReservas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/socio/reservas`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron cargar las reservas.");
        return;
      }

      setReservas(data.data || []);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (idReserva) => {
    setDetalleLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/socio/reservas/${idReserva}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo cargar el detalle.");
        return;
      }

      setReservaDetalle(data.data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setDetalleLoading(false);
    }
  };

  const cancelarReserva = async () => {
    if (!reservaDetalle) return;

    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta reserva?"
    );

    if (!confirmar) return;

    setCancelando(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/socio/reservas/${reservaDetalle.id_reserva}/cancelar`,
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
        setError(data.message || "No se pudo cancelar la reserva.");
        return;
      }

      const reservaActualizada = data.data;

      setReservas((prev) =>
        prev.map((reserva) =>
          reserva.id_reserva === reservaActualizada.id_reserva
            ? reservaActualizada
            : reserva
        )
      );

      setReservaDetalle(reservaActualizada);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCancelando(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [token]);

  if (loading) {
    return <p className="text-slate-600">Cargando reservas...</p>;
  }

  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        Mis reservas
      </h2>

      <p className="text-sm sm:text-base text-slate-500">
        Consulta tus reservas activas e históricas.
      </p>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        {reservas.length === 0 ? (
          <div className="p-6 text-slate-600">
            No tienes reservas registradas.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4">Folio</th>
                  <th className="p-4">Espacio</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Hora</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id_reserva} className="border-t">
                    <td className="p-4 font-medium whitespace-nowrap">
                      {reserva.folio_reserva || "Sin folio"}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {getEspacioNombre(reserva)}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {formatDate(reserva.fecha)}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {reserva.hora_inicio} - {reserva.hora_fin}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                          reserva.estatus === "Activa"
                            ? "bg-green-100 text-green-700"
                            : reserva.estatus === "Cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {reserva.estatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => verDetalle(reserva.id_reserva)}
                        disabled={detalleLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg px-4 py-2 text-sm whitespace-nowrap"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reservaDetalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Detalle de reserva
                </h3>

                <p className="text-sm text-slate-500 break-all">
                  Folio: {reservaDetalle.folio_reserva || "Sin folio"}
                </p>
              </div>

              <button
                onClick={() => setReservaDetalle(null)}
                className="text-slate-500 hover:text-slate-900 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Espacio"
                value={getEspacioNombre(reservaDetalle)}
              />

              <InfoItem
                label="Fecha"
                value={formatDate(reservaDetalle.fecha)}
              />

              <InfoItem
                label="Hora inicio"
                value={reservaDetalle.hora_inicio}
              />

              <InfoItem
                label="Hora fin"
                value={reservaDetalle.hora_fin}
              />

              <InfoItem
                label="Estatus"
                value={reservaDetalle.estatus}
              />

              <InfoItem
                label="No-show"
                value={reservaDetalle.estatus_noshow ? "Sí" : "No"}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setReservaDetalle(null)}
                className="w-full sm:w-auto border border-slate-300 text-slate-700 rounded-lg px-4 py-2"
              >
                Cerrar
              </button>

              {reservaDetalle.estatus === "Activa" && (
                <button
                  onClick={cancelarReserva}
                  disabled={cancelando}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg px-4 py-2"
                >
                  {cancelando ? "Cancelando..." : "Cancelar reserva"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="font-semibold text-slate-900 break-words">
        {value || "No registrado"}
      </p>
    </div>
  );
}