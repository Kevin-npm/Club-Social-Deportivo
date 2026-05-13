import { useEffect, useState } from "react";
import { Clock, Baby, AlertTriangle } from "lucide-react";

const formatearSegundos = (totalSegundos) => {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segs = Math.floor(totalSegundos % 60);
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
};

const LudotecaLiveWidget = ({ data }) => {
  const [segundos, setSegundos] = useState(() => data?.[0]?.segundos_transcurridos || 0);

  useEffect(() => {
    const intervalo = setInterval(() => setSegundos((prev) => prev + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (!data || data.length === 0) return null;

  const minutosTotales = segundos / 60;
  const excedeLimite = minutosTotales >= 120;
  const porExceder = minutosTotales >= 105 && !excedeLimite;

  return (
    <div className={`rounded-2xl border p-5 shadow-lg ${
      excedeLimite
        ? "border-red-500/30 bg-gradient-to-br from-red-950/30 to-[#14171c] shadow-red-500/10"
        : porExceder
        ? "border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-[#14171c] shadow-yellow-500/10"
        : "border-green-500/20 bg-gradient-to-br from-[#14171c] to-[#0f131a] shadow-green-500/5"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            excedeLimite ? "bg-red-500/10" : porExceder ? "bg-yellow-500/10" : "bg-green-500/10"
          }`}>
            <Baby className={`${excedeLimite ? "text-red-400" : porExceder ? "text-yellow-400" : "text-green-400"}`} size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ludoteca</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tu hijo est&aacute; jugando</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${
          excedeLimite
            ? "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse"
            : porExceder
            ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
            : "text-green-400 bg-green-500/10 border-green-500/20"
        }`}>
          {excedeLimite ? "Excedido" : porExceder ? "Pr&oacute;ximo a vencer" : "En vivo"}
        </span>
      </div>

      <div className="space-y-3">
        {data.map((nino) => (
          <div key={nino.id_nino_fk} className="bg-[#1a1d23] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base">{nino.nombre} {nino.apellidos}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ingres&oacute;:{" "}
                  {nino.timestamp_entrada
                    ? new Date(nino.timestamp_entrada.replace(" ", "T")).toLocaleTimeString("es-ES", {
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "---"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {excedeLimite && <AlertTriangle className="text-red-400 animate-pulse" size={18} />}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  excedeLimite
                    ? "bg-red-500/10 border-red-500/20"
                    : porExceder
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-green-500/5 border-green-500/10"
                }`}>
                  <Clock className={`${excedeLimite ? "text-red-400" : porExceder ? "text-yellow-400" : "text-green-400"}`} size={16} />
                  <span className={`font-mono text-lg font-bold tabular-nums ${
                    excedeLimite ? "text-red-400" : porExceder ? "text-yellow-400" : "text-green-400"
                  }`}>
                    {formatearSegundos(segundos)}
                  </span>
                </div>
              </div>
            </div>
            {excedeLimite && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs font-bold text-center">
                  Tiempo excedido: el niño debe salir de la ludoteca
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LudotecaLiveWidget;
