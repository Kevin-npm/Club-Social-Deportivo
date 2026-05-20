import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioHome() {
  const { token } = useAuth();

  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "No registrada";

    return new Date(dateValue).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchSocioProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/socio/perfil`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "No se pudo cargar la información.");
          return;
        }

        setSocio(data.socio);
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchSocioProfile();
  }, [token]);

  if (loading) {
    return (
      <p className="text-sm sm:text-base text-slate-600">
        Cargando información del socio...
      </p>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Mi información
        </h2>

        <p className="text-sm sm:text-base text-slate-500">
          Consulta tus datos registrados dentro del club.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 break-words">
            {socio?.nombre} {socio?.apellidos}
          </h3>

          <p className="text-sm sm:text-base text-slate-500">
            Socio #{socio?.id_socio}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <InfoItem label="Tipo de membresía" value={socio?.tipo_membresia} />
          <InfoItem label="Modalidad" value={socio?.modalidad} />
          <InfoItem
            label="Estatus financiero"
            value={socio?.estatus_financiero}
          />
          <InfoItem label="Género" value={socio?.genero} />
          <InfoItem
            label="Fecha de nacimiento"
            value={formatDate(socio?.fecha_nacimiento)}
          />
          <InfoItem
            label="Inicio de vigencia"
            value={formatDate(socio?.fecha_inicio_vigencia)}
          />
          <InfoItem
            label="Fin de vigencia"
            value={formatDate(socio?.fecha_fin_vigencia)}
          />
          <InfoItem label="Faltas registradas" value={socio?.faltas ?? 0} />
        </div>
      </div>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 min-w-0">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="font-semibold text-slate-900 break-words">
        {value || "No registrado"}
      </p>
    </div>
  );
}