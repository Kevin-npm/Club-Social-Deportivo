import { User, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MiCuenta() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-yellow-400">Perfil</p>
        <h1 className="text-3xl font-bold text-white">Mi cuenta</h1>
        <p className="mt-2 text-sm text-gray-400">
          Información básica del usuario autenticado.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-800 bg-[#14171c] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-400/10">
            <User className="text-yellow-400" size={30} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Usuario del sistema
            </h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoCard
            icon={Mail}
            title="Correo electrónico"
            value={user?.email || "No disponible"}
          />

          <InfoCard
            icon={ShieldCheck}
            title="Rol"
            value={user?.role || "No disponible"}
          />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f131a] p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-400">
        <Icon size={18} className="text-yellow-400" />
        <p className="text-sm">{title}</p>
      </div>

      <p className="font-semibold capitalize text-white">{value}</p>
    </div>
  );
}