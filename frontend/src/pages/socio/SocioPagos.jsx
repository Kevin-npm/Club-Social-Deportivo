import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioPagos() {
  const { token } = useAuth();

  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return amount.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No registrada";

    return new Date(dateValue).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/socio/pagos`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "No se pudieron cargar los pagos.");
          return;
        }

        const pagosData = data.data || [];
        setPagos(pagosData);

        const total = pagosData.reduce((sum, pago) => {
          return sum + Number(pago.monto || 0);
        }, 0);

        setTotalPagado(total);
      } catch (error) {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [token]);

  if (loading) {
    return <p className="text-slate-600">Cargando pagos...</p>;
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
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Mis pagos</h2>
      <p className="text-slate-500">
        Consulta tus pagos registrados y comprobantes digitales.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-slate-500">Pagos registrados</p>
          <p className="text-3xl font-bold text-slate-900">{pagos.length}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-slate-500">Total pagado</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(totalPagado)}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        {pagos.length === 0 ? (
          <div className="p-6 text-slate-600">
            No tienes pagos registrados.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-4">Folio</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Método</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id_pago} className="border-t">
                  <td className="p-4 font-medium">
                    {pago.folio_digital || "Sin folio"}
                  </td>
                  <td className="p-4">{pago.concepto}</td>
                  <td className="p-4">
                    {pago.metodo?.nombre_metodo || `Método #${pago.id_metodo}`}
                  </td>
                  <td className="p-4">{formatCurrency(pago.monto)}</td>
                  <td className="p-4">{formatDate(pago.fecha_pago)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}