import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioPagos() {
  const { token } = useAuth();

  const [pagos, setPagos] = useState([]);
  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [totalPagado, setTotalPagado] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No registrada";

    return new Date(dateValue).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const verDetalle = async (idPago) => {
    setDetalleLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/socio/pagos/${idPago}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo cargar el detalle del pago.");
        return;
      }

      setPagoDetalle(data.data);
    } catch (error) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setDetalleLoading(false);
    }
  };

  const imprimirComprobante = () => {
    window.print();
  };

  useEffect(() => {
    fetchPagos();
  }, [token]);

  if (loading) {
    return <p className="text-slate-300">Cargando pagos...</p>;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-2">Mis pagos</h2>

      <p className="text-slate-400">
        Consulta tus pagos registrados y comprobantes digitales.
      </p>

      {error && (
        <div className="mt-4 bg-red-950/50 border border-red-800 text-red-300 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6">
          <p className="text-sm text-slate-400">Pagos registrados</p>
          <p className="text-3xl font-bold text-white">{pagos.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6">
          <p className="text-sm text-slate-400">Total pagado</p>
          <p className="text-3xl font-bold text-yellow-400">
            {formatCurrency(totalPagado)}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl shadow overflow-hidden">
        {pagos.length === 0 ? (
          <div className="p-6 text-slate-300">No tienes pagos registrados.</div>
        ) : (
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950/80 text-yellow-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Folio</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Método</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((pago) => (
                <tr
                  key={pago.id_pago}
                  className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                >
                  <td className="p-4 font-medium text-white">
                    {pago.folio_digital || "Sin folio"}
                  </td>

                  <td className="p-4">{pago.concepto}</td>

                  <td className="p-4">
                    {pago.metodo?.nombre_metodo || `Método #${pago.id_metodo}`}
                  </td>

                  <td className="p-4">{formatCurrency(pago.monto)}</td>

                  <td className="p-4">{formatDate(pago.fecha_pago)}</td>

                  <td className="p-4">
                    <button
                      onClick={() => verDetalle(pago.id_pago)}
                      disabled={detalleLoading}
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-900/50 text-slate-950 font-semibold rounded-lg px-4 py-2 text-sm"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagoDetalle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 print:shadow-none">
            <div className="flex justify-between items-start gap-4 mb-6 print:hidden">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Comprobante de pago
                </h3>

                <p className="text-slate-400">
                  Folio: {pagoDetalle.folio_digital || "Sin folio"}
                </p>
              </div>

              <button
                onClick={() => setPagoDetalle(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="hidden print:block mb-6">
              <h1 className="text-2xl font-bold">ClubManager360</h1>
              <p>Comprobante de pago</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem label="Folio digital" value={pagoDetalle.folio_digital} />

              <InfoItem label="Concepto" value={pagoDetalle.concepto} />

              <InfoItem
                label="Método de pago"
                value={
                  pagoDetalle.metodo?.nombre_metodo ||
                  `Método #${pagoDetalle.id_metodo}`
                }
              />

              <InfoItem label="Monto" value={formatCurrency(pagoDetalle.monto)} />

              <InfoItem label="Referencia" value={pagoDetalle.referencia} />

              <InfoItem
                label="Fecha de pago"
                value={formatDate(pagoDetalle.fecha_pago)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 print:hidden">
              <button
                onClick={() => setPagoDetalle(null)}
                className="border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2"
              >
                Cerrar
              </button>

              <button
                onClick={imprimirComprobante}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold rounded-lg px-4 py-2"
              >
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-4">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="font-semibold text-white">
        {value || "No registrado"}
      </p>
    </div>
  );
}