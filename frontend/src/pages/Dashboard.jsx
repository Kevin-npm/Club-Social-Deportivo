import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Bell,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#facc15", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { token } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const formatDate = (value) => {
    if (!value) return "Sin fecha";

    return new Date(value).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "Sin fecha";

    return new Date(value).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSocioNombre = (socio) => {
    if (!socio) return "Socio no registrado";

    return (
      `${socio.nombre || ""} ${socio.apellidos || ""}`.trim() ||
      "Socio no registrado"
    );
  };

  const getEspacioNombre = (reserva) => {
    return (
      reserva?.espacio?.nombre_especifico ||
      reserva?.espacio?.nombre ||
      reserva?.espacio?.nombre_espacio ||
      reserva?.espacio?.nombre_instalacion ||
      "Espacio no registrado"
    );
  };

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron cargar las métricas.");
        return;
      }

      setMetrics(data.data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  const cards = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        title: "Total de socios",
        value: metrics.total_socios,
        detail: "Registros acumulados",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        title: "Socios activos",
        value: metrics.socios_activos,
        detail: `${metrics.socios_inactivos || 0} inactivos`,
        icon: UserCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        title: "Reservas activas",
        value: metrics.reservas_activas,
        detail: `${metrics.reservas_canceladas || 0} canceladas`,
        icon: CalendarCheck,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
      },
      {
        title: "Pagos del mes",
        value: metrics.pagos_mes,
        detail: formatCurrency(metrics.ingresos_mes),
        icon: CreditCard,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
      },
      {
        title: "Ingresos del mes",
        value: formatCurrency(metrics.ingresos_mes),
        detail: "Monto registrado",
        icon: DollarSign,
        color: "text-green-400",
        bg: "bg-green-500/10",
      },
      {
        title: "Notificaciones no leídas",
        value: metrics.notificaciones_no_leidas,
        detail: "Pendientes de revisar",
        icon: Bell,
        color: "text-red-400",
        bg: "bg-red-500/10",
      },
    ];
  }, [metrics]);

  const membershipChartData = useMemo(() => {
    return (
      metrics?.socios_por_membresia?.map((item) => ({
        name: item.tipo_membresia || "Sin tipo",
        value: Number(item.total || 0),
      })) || []
    );
  }, [metrics]);

  const reservationChartData = useMemo(() => {
    return [
      {
        name: "Activas",
        total: Number(metrics?.reservas_activas || 0),
      },
      {
        name: "Canceladas",
        total: Number(metrics?.reservas_canceladas || 0),
      },
    ];
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-yellow-400" size={28} />
          Cargando métricas del dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-yellow-400">
            Vista general del sistema
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white">
            Dashboard administrativo
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Métricas operativas de socios, reservas, pagos y notificaciones.
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-800 bg-[#14171c] px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-yellow-400/40 hover:text-white disabled:opacity-60 sm:w-auto"
        >
          <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Actualizando..." : "Actualizar métricas"}
        </button>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, value, detail, icon: Icon, color, bg }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="mt-2 text-2xl font-bold text-white break-words">
                  {value ?? 0}
                </p>
                <p className="mt-1 text-xs text-gray-500">{detail}</p>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={24} className={color} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">
              Distribución de membresías
            </h2>
            <p className="text-sm text-gray-500">
              Visualización general de socios por membresía.
            </p>
          </div>

          {membershipChartData.length ? (
            <div className="relative h-[320px] min-h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={membershipChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {membershipChartData.map((entry, index) => (
                      <Cell
                        key={`membership-cell-${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#14171c",
                      border: "1px solid #1f2937",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="No hay datos de membresías." />
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">
              Estado de reservas
            </h2>
            <p className="text-sm text-gray-500">
              Comparativa entre reservas activas y canceladas.
            </p>
          </div>

          <div className="relative h-[320px] min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={reservationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14171c",
                    border: "1px solid #1f2937",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Últimos pagos</h2>
              <p className="text-sm text-gray-500">
                Movimientos financieros recientes.
              </p>
            </div>
            <CreditCard className="text-yellow-400" size={22} />
          </div>

          {metrics?.ultimos_pagos?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="border-b border-gray-800 text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Folio</th>
                    <th className="py-3 pr-4">Socio</th>
                    <th className="py-3 pr-4">Concepto</th>
                    <th className="py-3 pr-4">Monto</th>
                    <th className="py-3 pr-4">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.ultimos_pagos.map((pago) => (
                    <tr
                      key={pago.id_pago}
                      className="border-b border-gray-800/70"
                    >
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                        {pago.folio_digital || "Sin folio"}
                      </td>

                      <td className="py-3 pr-4 text-white">
                        {getSocioNombre(pago.socio)}
                      </td>

                      <td className="py-3 pr-4 text-gray-400">
                        {pago.concepto || "Sin concepto"}
                      </td>

                      <td className="py-3 pr-4 font-semibold text-emerald-400 whitespace-nowrap">
                        {formatCurrency(pago.monto)}
                      </td>

                      <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                        {formatDateTime(pago.fecha_pago)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No hay pagos recientes registrados." />
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Membresías</h2>
              <p className="text-sm text-gray-500">Distribución de socios.</p>
            </div>
            <Activity className="text-yellow-400" size={22} />
          </div>

          {metrics?.socios_por_membresia?.length ? (
            <div className="space-y-3">
              {metrics.socios_por_membresia.map((item) => {
                const totalSocios = Number(metrics.total_socios || 1);
                const porcentaje = Math.round(
                  (Number(item.total) / totalSocios) * 100
                );

                return (
                  <div key={item.tipo_membresia || "Sin tipo"}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.tipo_membresia || "Sin tipo"}
                      </span>
                      <span className="text-gray-500">{item.total}</span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-yellow-400"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No hay datos de membresías." />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-[#14171c] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Reservas próximas</h2>
            <p className="text-sm text-gray-500">
              Próximos espacios reservados por socios.
            </p>
          </div>
          <CalendarCheck className="text-yellow-400" size={22} />
        </div>

        {metrics?.reservas_proximas?.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {metrics.reservas_proximas.map((reserva) => (
              <div
                key={reserva.id_reserva}
                className="rounded-xl border border-gray-800 bg-[#0f131a] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {getEspacioNombre(reserva)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {getSocioNombre(reserva.socio)}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
                    {reserva.estatus}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  {formatDate(reserva.fecha)} · {reserva.hora_inicio} -{" "}
                  {reserva.hora_fin}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {reserva.folio_reserva || "Sin folio"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No hay reservas próximas activas." />
        )}
      </section>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f131a] px-4 py-8 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}