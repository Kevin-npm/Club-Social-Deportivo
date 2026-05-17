import { Baby, AlertTriangle, CheckCircle, Hourglass } from "lucide-react";

const getStatusInfo = (segundos) => {
  const minutos = segundos / 60;
  if (minutos >= 120) {
    return { label: "Tiempo excedido", color: "text-red-400 bg-red-500/10 border-red-500/30 animate-pulse", badge: "Excedido", badgeColor: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" };
  }
  if (minutos >= 105) {
    return { label: "Próximo a vencer", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", badge: "Por vencer", badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
  }
  return { label: "Con tiempo", color: "text-green-400 bg-green-500/10 border-green-500/30", badge: "En vivo", badgeColor: "text-green-400 bg-green-500/10 border-green-500/20" };
};

const LudotecaLiveWidget = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Baby className="text-green-400" size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ludoteca</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tus hijos en la ludoteca</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((nino) => {
          const segs = nino.segundos_transcurridos || 0;
          const status = getStatusInfo(segs);
          const horaEntrada = nino.timestamp_entrada
            ? new Date(nino.timestamp_entrada.replace(" ", "T")).toLocaleTimeString("es-ES", {
                hour: "2-digit", minute: "2-digit",
              })
            : "---";
          const excedeLimite = segs / 60 >= 120;

          return (
            <div key={nino.id_nino_fk} className="bg-[#1a1d23] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center">
                    <Baby className="text-yellow-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{nino.nombre} {nino.apellidos}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ingresó: {horaEntrada}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {excedeLimite && <AlertTriangle className="text-red-400 animate-pulse" size={18} />}
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${status.badgeColor}`}>
                    {status.badge}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Tiempo transcurrido: {Math.floor(segs / 3600)}h {Math.floor((segs % 3600) / 60)}m — {status.label}
              </div>
              {excedeLimite && (
                <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-xs font-bold text-center">
                    Tiempo excedido: el niño debe salir de la ludoteca
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LudotecaLiveWidget;
