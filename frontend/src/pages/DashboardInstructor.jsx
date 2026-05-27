import { useMemo, useState } from "react";
import {
  Activity,
  TrendingUp,
  Filter,
  X,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardInstructor = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  const datosPorMes = {
    todos: {
      nombre: "Todos los meses",
      clasesImpartidas: 24,
      alumnosTotales: 342,
      promedioOcupacion: 85,
      cambioClases: "+3 este mes",
      textoAlumnos: "Suma de todas tus sesiones",
    },
    enero: {
      nombre: "Enero",
      clasesImpartidas: 15,
      alumnosTotales: 120,
      promedioOcupacion: 68,
      cambioClases: "+2 en enero",
      textoAlumnos: "Alumnos registrados en enero",
    },
    febrero: {
      nombre: "Febrero",
      clasesImpartidas: 18,
      alumnosTotales: 150,
      promedioOcupacion: 72,
      cambioClases: "+3 en febrero",
      textoAlumnos: "Alumnos registrados en febrero",
    },
    marzo: {
      nombre: "Marzo",
      clasesImpartidas: 20,
      alumnosTotales: 210,
      promedioOcupacion: 78,
      cambioClases: "+2 en marzo",
      textoAlumnos: "Alumnos registrados en marzo",
    },
    abril: {
      nombre: "Abril",
      clasesImpartidas: 24,
      alumnosTotales: 342,
      promedioOcupacion: 85,
      cambioClases: "+4 en abril",
      textoAlumnos: "Alumnos registrados en abril",
    },
  };

  const dataGraficaCompleta = [
    { mes: "Ene", mesKey: "enero", clases: 15, alumnos: 120 },
    { mes: "Feb", mesKey: "febrero", clases: 18, alumnos: 150 },
    { mes: "Mar", mesKey: "marzo", clases: 20, alumnos: 210 },
    { mes: "Abr", mesKey: "abril", clases: 24, alumnos: 342 },
  ];

  const metricas = datosPorMes[mesSeleccionado];

  const dataGrafica = useMemo(() => {
    if (mesSeleccionado === "todos") {
      return dataGraficaCompleta;
    }

    return dataGraficaCompleta.filter(
      (item) => item.mesKey === mesSeleccionado
    );
  }, [mesSeleccionado]);

  const opcionesMes = [
    { value: "todos", label: "Todos los meses" },
    { value: "enero", label: "Enero" },
    { value: "febrero", label: "Febrero" },
    { value: "marzo", label: "Marzo" },
    { value: "abril", label: "Abril" },
  ];

  const seleccionarMes = (value) => {
    setMesSeleccionado(value);
    setMostrarFiltro(false);
  };

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

          <p className="text-yellow-400 text-xs font-bold mt-2">
            Mostrando: {metricas.nombre}
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMostrarFiltro(!mostrarFiltro)}
            className="bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-lg text-sm"
          >
            <Filter size={16} className="text-gray-400" />
            Filtrar por Mes
          </button>

          {mostrarFiltro && (
            <div className="absolute right-0 mt-3 w-56 bg-[#14171c] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-bold text-white">Seleccionar mes</p>

                <button
                  type="button"
                  onClick={() => setMostrarFiltro(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-2 space-y-1">
                {opcionesMes.map((opcion) => (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => seleccionarMes(opcion.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mesSeleccionado === opcion.value
                        ? "bg-yellow-400 text-black"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span>{opcion.label}</span>

                    {mesSeleccionado === opcion.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
            {metricas.cambioClases}
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
            {metricas.textoAlumnos}
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
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metricas.promedioOcupacion}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 md:p-5 shadow-xl max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Crecimiento de Alumnos
            </h3>

            <p className="text-gray-500 text-xs mt-0.5">
              Evolución de asistencias durante el cuatrimestre
            </p>
          </div>

          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full px-3 py-1 font-bold w-max">
            {metricas.nombre}
          </span>
        </div>

        <div className="h-[200px] md:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dataGrafica}
              margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
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
                labelStyle={{ color: "#facc15", fontWeight: "bold" }}
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