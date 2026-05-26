import { useEffect, useState } from "react";
import {
  Baby,
  Loader2,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Hourglass,
  LogIn,
} from "lucide-react";
import { useLudoteca } from "../context/LudotecaContext";

const getStatusInfo = (segundos) => {
  const minutos = segundos / 60;

  if (minutos >= 120) {
    return {
      label: "Tiempo excedido",
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      icon: AlertTriangle,
    };
  }

  if (minutos >= 105) {
    return {
      label: "Próximo a vencer",
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      icon: Hourglass,
    };
  }

  return {
    label: "Con tiempo",
    color: "text-green-400 bg-green-500/10 border-green-500/30",
    icon: CheckCircle,
  };
};

export default function Ludoteca() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem("simulated_user_id") || ""
  );
  const [showLogin, setShowLogin] = useState(
    () => !localStorage.getItem("simulated_user_id")
  );
  const [inputValue, setInputValue] = useState("");

  const { ludotecaStatus, loading, setSocioId, fetchLudotecaStatus } =
    useLudoteca();

  useEffect(() => {
    if (userId) {
      setSocioId(userId);
      fetchLudotecaStatus(userId);
    }
  }, [userId, setSocioId, fetchLudotecaStatus]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const socioId = inputValue.trim();

    localStorage.setItem("simulated_user_id", socioId);
    setUserId(socioId);
    setShowLogin(false);
    setSocioId(socioId);
    fetchLudotecaStatus(socioId);
  };

  const handleLogout = () => {
    localStorage.removeItem("simulated_user_id");
    setUserId("");
    setInputValue("");
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

            <h1 className="text-2xl font-bold text-white">
              Panel de Ludoteca
            </h1>

            <p className="text-gray-400 text-sm mt-2">
              Ingresa el ID de socio para consultar a los niños registrados en
              ludoteca.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ID de socio..."
              className="w-full bg-[#0f131a] border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-lg focus:border-yellow-400 outline-none transition"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}

              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const ninos =
    ludotecaStatus?.status === "success" && Array.isArray(ludotecaStatus.data)
      ? ludotecaStatus.data
      : [];

  const totalNinos = ninos.length;

  const activos = ninos.filter(
    (nino) => (nino.segundos_transcurridos || 0) / 60 < 105
  ).length;

  const excedidos = ninos.filter(
    (nino) => (nino.segundos_transcurridos || 0) / 60 >= 120
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Baby className="text-yellow-400" size={28} />
            Panel de Ludoteca
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Socio #{userId} — Monitoreo de niños registrados en ludoteca.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white bg-[#1a1d23] border border-gray-800 px-4 py-2 rounded-xl transition-all flex items-center gap-2 w-max"
        >
          <LogOut size={16} />
          Cambiar usuario
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Baby}
          iconClass="text-green-400"
          bgClass="bg-green-500/10"
          value={totalNinos}
          label="Niños registrados"
        />

        <MetricCard
          icon={CheckCircle}
          iconClass="text-blue-400"
          bgClass="bg-blue-500/10"
          value={activos}
          label="Dentro del tiempo"
        />

        <MetricCard
          icon={AlertTriangle}
          iconClass="text-red-400"
          bgClass="bg-red-500/10"
          value={excedidos}
          label="Tiempo excedido"
        />
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

          <p className="text-gray-400">
            No hay niños registrados en ludoteca actualmente.
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Cuando se registre una entrada, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ninos.map((nino) => {
            const segundos = nino.segundos_transcurridos || 0;
            const status = getStatusInfo(segundos);
            const StatusIcon = status.icon;

            const horaEntrada = nino.timestamp_entrada
              ? new Date(
                  nino.timestamp_entrada.replace(" ", "T")
                ).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "---";

            return (
              <div
                key={nino.id_nino_fk}
                className="bg-[#14171c] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center">
                      <Baby className="text-yellow-400" size={20} />
                    </div>

                    <div>
                      <p className="text-white font-bold">
                        {nino.nombre} {nino.apellidos}
                      </p>

                      <p className="text-xs text-gray-500">
                        Entrada: {horaEntrada}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${status.color}`}
                  >
                    <StatusIcon size={12} className="inline mr-1" />
                    {status.label}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Tiempo transcurrido: {Math.floor(segundos / 3600)}h{" "}
                  {Math.floor((segundos % 3600) / 60)}m
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, iconClass, bgClass, value, label }) {
  return (
    <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}
      >
        <Icon className={iconClass} size={24} />
      </div>

      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}