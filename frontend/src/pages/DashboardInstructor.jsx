import { useEffect, useState } from "react";
import { Activity, Users, TrendingUp, Filter } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const defaultMetricas = {
  clasesImpartidas: 0,
  alumnosTotales: 0,
  promedioOcupacion: 0,
};

const defaultGrafica = [
  { mes: "Ene", alumnos: 0 },
  { mes: "Feb", alumnos: 0 },
  { mes: "Mar", alumnos: 0 },
  { mes: "Abr", alumnos: 0 },
];

const DashboardInstructor = () => {
  const { token } = useAuth();

  const [metricas, setMetricas] = useState(defaultMetricas);
  const [dataGrafica, setDataGrafica] = useState(defaultGrafica);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarMetricas = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/instructor/dashboard`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudieron cargar las métricas.");
      }

      const data = result.data || result;

      setMetricas({
        clasesImpartidas: data.clasesImpartidas ?? data.clases_impartidas ?? 0,
        alumnosTotales: data.alumnosTotales ?? data.alumnos_totales ?? 0,
        promedioOcupacion:
          data.promedioOcupacion ?? data.promedio_ocupacion ?? 0,
      });

      setDataGrafica(
        Array.isArray(data.grafica) && data.grafica.length > 0
          ? data.grafica
          : defaultGrafica
      );
    } catch (err) {
      console.error("Error cargando métricas del instructor:", err);
      setError("No se pudieron cargar las métricas del instructor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Cargando rendimiento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 text-gray-200 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Activity className="text-yellow-400" size={28} />
            Mi Rendimiento
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Métricas personales y estadísticas de tus clases
          </p>
        </div>

        <button
          type="button"
          className="bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-lg self-start text-sm"
        >
          <Filter size={16} className="text-gray-400" />
          Filtrar por Mes
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-yellow-400/50 transition-colors">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Clases Impartidas
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">
            {metricas.clasesImpartidas}
          </h3>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-medium bg-green-500/10 w-max px-2 py-0.5 rounded">
            <TrendingUp size={12} />
            Actualizado
          </p>
        </div>

        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-blue-400/50 transition-colors">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Alumnos Totales
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">
            {metricas.alumnosTotales}
          </h3>
          <p className="text-xs text-blue-400 mt-2 font-medium bg-blue-500/10 w-max px-2 py-0.5 rounded">
            Suma de todas tus sesiones
          </p>
        </div>

        <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-green-400/50 transition-colors">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Promedio de Ocupación
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {metricas.promedioOcupacion}
            </h3>
            <span className="text-lg text-gray-400 font-bold mb-0.5">%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-green-400 h-2 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, metricas.promedioOcupacion)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 md:p-5 shadow-xl max-w-3xl mx-auto w-full min-w-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Crecimiento de Alumnos
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Evolución de asistencias durante el periodo
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 h-[240px]">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart
              data={dataGrafica}
              margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAlumnos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />

              <XAxis
                dataKey="mes"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  borderRadius: "0.8rem",
                  color: "#fff",
                  fontSize: "13px",
                }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
              />

              <Area
                type="monotone"
                dataKey="alumnos"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAlumnos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardInstructor;