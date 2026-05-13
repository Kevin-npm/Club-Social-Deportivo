import { useState } from "react";
import { Baby, Search, Loader2 } from "lucide-react";
import LudotecaLiveWidget from "../components/LudotecaLiveWidget";
import { useLudoteca } from "../context/LudotecaContext";

const Dashboard = () => {
  const [inputValue, setInputValue] = useState("");
  const {
    ludotecaStatus,
    loading,
    setSocioId,
    fetchLudotecaStatus,
  } = useLudoteca();

  const verificarLudoteca = async (e) => {
    e?.preventDefault();
    if (!inputValue) return;

    setSocioId(inputValue);
    await fetchLudotecaStatus(inputValue);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-white">Tu panel de Ludoteca</h1>
        <p className="text-sm md:text-base text-gray-400 mt-1">Administra tus niños en la Ludoteca</p>
      </div>

      {/* Buscador de ID de socio */}
      <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-4 md:p-5 shadow-lg w-full md:max-w-md">
        <form onSubmit={verificarLudoteca} className="flex gap-2 md:gap-3">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tu ID de socio..."
            className="flex-1 bg-[#0f131a] border border-gray-700 rounded-xl px-3 md:px-4 py-2.5 text-sm text-white focus:border-yellow-400 outline-none transition min-w-0"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verificar"}
          </button>
        </form>
      </div>

      {/* Widget de Ludoteca - solo visible si hay niños activos */}
      {ludotecaStatus?.status === "success" && ludotecaStatus.data?.length > 0 && (
        <LudotecaLiveWidget data={ludotecaStatus.data} />
      )}

      {/* Info cuando no hay niños */}
      {ludotecaStatus?.status === "empty" && (
        <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-4 md:p-5 shadow-lg w-full md:max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-700/30 flex items-center justify-center">
              <Baby className="text-gray-500" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                No tienes hijos en la ludoteca
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
