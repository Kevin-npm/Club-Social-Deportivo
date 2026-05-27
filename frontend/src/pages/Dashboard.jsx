import { useState, useEffect } from "react";
import { Baby, Loader2, LogOut, AlertTriangle, CheckCircle, Hourglass, LogIn } from "lucide-react";
import { useLudoteca } from "../context/LudotecaContext";

const getStatusInfo = (segundos) => {
  const minutos = segundos / 60;
  if (minutos >= 120) {
    return { label: "Tiempo excedido", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: AlertTriangle };
  }
  if (minutos >= 105) {
    return { label: "Próximo a vencer", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: Hourglass };
  }
  return { label: "Con tiempo", color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle };
};

const Dashboard = () => {
  const [userId, setUserId] = useState(() => localStorage.getItem("simulated_user_id") || "");
  const [showLogin, setShowLogin] = useState(!localStorage.getItem("simulated_user_id"));
  const [inputValue, setInputValue] = useState("");

  const {
    ludotecaStatus,
    loading,
    setSocioId,
    fetchLudotecaStatus,
  } = useLudoteca();

  useEffect(() => {
    if (userId) {
      setSocioId(userId);
      fetchLudotecaStatus(userId);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    localStorage.setItem("simulated_user_id", inputValue);
    setUserId(inputValue);
    setShowLogin(false);
    setSocioId(inputValue);
    fetchLudotecaStatus(inputValue);
  };

  const handleLogout = () => {
    localStorage.removeItem("simulated_user_id");
    setUserId("");
    setShowLogin(true);
    setSocioId("");
  };

  if (showLogin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-8 shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Baby className="text-yellow-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel de Ludoteca</h1>
            <p className="text-gray-400 text-sm mt-2">Ingresa tu ID de socio para ver a tus hijos en la ludoteca</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tu ID de socio..."
              className="w-full bg-[#0f131a] border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-lg focus:border-yellow-400 outline-none transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !inputValue}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const ninos = ludotecaStatus?.status === "success" && ludotecaStatus.data ? ludotecaStatus.data : [];
  const totalNinos = ninos.length;
  const activos = ninos.filter(n => (n.segundos_transcurridos || 0) / 60 < 105).length;
  const excedidos = ninos.filter(n => (n.segundos_transcurridos || 0) / 60 >= 120).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Baby className="text-yellow-400" size={28} />
            Panel de Ludoteca
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Socio #{userId} — Monitoreo de tus hijos en la ludoteca
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white bg-[#1a1d23] border border-gray-800 px-4 py-2 rounded-xl transition-all flex items-center gap-2 w-max"
        >
          <LogOut size={16} /> Cambiar usuario
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Baby className="text-green-400" size={24} />
          </div>
<<<<<<< HEAD
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
=======
>>>>>>> origin/main
          <div>
            <p className="text-2xl font-bold text-white">{totalNinos}</p>
            <p className="text-xs text-gray-400">Hijos registrados</p>
          </div>
        </div>
        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CheckCircle className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{activos}</p>
            <p className="text-xs text-gray-400">Dentro del tiempo</p>
          </div>
        </div>
        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{excedidos}</p>
            <p className="text-xs text-gray-400">Tiempo excedido</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-yellow-400" />
        </div>
      ) : totalNinos === 0 ? (
        <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Baby className="text-gray-500" size={28} />
          </div>
          <p className="text-gray-400">No tienes hijos en la ludoteca actualmente.</p>
          <p className="text-gray-600 text-sm mt-1">Cuando registres a un hijo, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ninos.map((nino) => {
            const segs = nino.segundos_transcurridos || 0;
            const status = getStatusInfo(segs);
            const StatusIcon = status.icon;
            const horaEntrada = nino.timestamp_entrada
              ? new Date(nino.timestamp_entrada.replace(" ", "T")).toLocaleTimeString("es-ES", {
                  hour: "2-digit", minute: "2-digit"
                })
              : "---";

            return (
              <div
                key={nino.id_nino_fk}
                className="bg-[#14171c] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center">
                      <Baby className="text-yellow-400" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold">{nino.nombre} {nino.apellidos}</p>
                      <p className="text-xs text-gray-500">Entrada: {horaEntrada}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${status.color}`}>
                    <StatusIcon size={12} className="inline mr-1" />
                    {status.label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tiempo transcurrido: {Math.floor(segs / 3600)}h {Math.floor((segs % 3600) / 60)}m
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
