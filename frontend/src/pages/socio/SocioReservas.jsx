import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioReservas() {
  const { token } = useAuth();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "No registrada";

    return new Date(dateValue).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
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
      } catch (error) {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [token]);

  if (loading) {
    return <p className="text-slate-600">Cargando reservas...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Mis reservas</h2>
      <p className="text-slate-500">
        Consulta tus reservas activas e históricas.
      </p>

      <div className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        {reservas.length === 0 ? (
          <div className="p-6 text-slate-600">
            No tienes reservas registradas.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-4">Folio</th>
                <th className="p-4">Espacio</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id_reserva} className="border-t">
                  <td className="p-4">{reserva.folio_reserva}</td>
                  <td className="p-4">
                    {reserva.espacio?.nombre || reserva.espacio?.nombre_espacio || "Sin espacio"}
                  </td>
                  <td className="p-4">{formatDate(reserva.fecha)}</td>
                  <td className="p-4">
                    {reserva.hora_inicio} - {reserva.hora_fin}
                  </td>
                  <td className="p-4">{reserva.estatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}