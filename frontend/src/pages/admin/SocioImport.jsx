import { useState } from "react";
import {
  UploadCloud,
  FileCheck2,
  Download,
  FileDown,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function SocioImport() {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setMessage("");
    setError("");
    setResult(null);
  };

  const downloadBlob = async (url, defaultFileName, setLoading, acceptType) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: acceptType,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        setError("No se pudo descargar el archivo.");
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;

      const disposition = response.headers.get("Content-Disposition");
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/);

      link.download = fileNameMatch?.[1] || defaultFileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      setMessage("Archivo descargado correctamente.");
    } catch {
      setError("Error de conexión al descargar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadBlob(
      `${API_BASE_URL}/socios/plantilla/csv`,
      "plantilla_importacion_socios.csv",
      setLoadingTemplate,
      "text/csv"
    );
  };

  const handleExportCsv = () => {
    downloadBlob(
      `${API_BASE_URL}/socios/exportar/csv`,
      "socios_exportados.csv",
      setLoadingExport,
      "text/csv"
    );
  };

  const handleExportPdf = () => {
    downloadBlob(
      `${API_BASE_URL}/socios/exportar/pdf`,
      "socios_clubmanager360.pdf",
      setLoadingPdf,
      "application/pdf"
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo CSV o TXT.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "txt"].includes(extension)) {
      setError("El archivo debe ser CSV o TXT.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoadingImport(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/socios/importar`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Ocurrió un error al importar los datos.");
        return;
      }

      setResult(data);
      setMessage(data.message || "Importación completada correctamente.");
      setFile(null);

      const input = document.getElementById("file-upload");
      if (input) input.value = "";
    } catch {
      setError(
        "Error de conexión con el servidor. Verifica que el backend esté ejecutándose."
      );
    } finally {
      setLoadingImport(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#14171c]">
        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Importación y exportación de socios
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Sincroniza socios desde archivos CSV y exporta información para
            otros sistemas.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              title="Descargar plantilla"
              description="Obtén el formato base para cargar socios desde CSV."
              icon={Download}
              buttonText="Descargar plantilla CSV"
              loading={loadingTemplate}
              onClick={handleDownloadTemplate}
            />

            <ActionCard
              title="Exportar CSV"
              description="Descarga todos los socios registrados en formato CSV."
              icon={FileDown}
              buttonText="Exportar socios CSV"
              loading={loadingExport}
              onClick={handleExportCsv}
            />

            <ActionCard
              title="Exportar PDF"
              description="Descarga un reporte PDF con los últimos 100 socios."
              icon={FileText}
              buttonText="Exportar socios PDF"
              loading={loadingPdf}
              onClick={handleExportPdf}
            />

            <div className="rounded-2xl border border-gray-800 bg-[#0f131a] p-5">
              <h3 className="text-lg font-bold text-white">
                Formato permitido
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                El archivo debe ser delimitado por comas y contener las columnas
                mínimas:
              </p>

              <p className="mt-3 rounded-xl bg-black/30 px-3 py-2 text-xs text-yellow-400 break-words">
                nombre, apellidos, email
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="mx-auto mt-8 max-w-3xl">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Archivo de datos
              </label>

              <div
                className={`mt-1 flex justify-center rounded-xl border px-6 pb-8 pt-10 transition hover:border-yellow-400 ${
                  file
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-dashed border-gray-700 bg-[#0f131a]"
                }`}
              >
                <div className="space-y-2 text-center">
                  {file ? (
                    <FileCheck2 className="mx-auto h-12 w-12 text-emerald-400" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                  )}

                  <div className="flex justify-center text-sm text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none"
                    >
                      <span>
                        {file ? "Cambiar archivo" : "Seleccionar archivo"}
                      </span>

                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <p className="text-xs text-gray-500">
                    CSV o TXT delimitado por comas.
                  </p>
                </div>
              </div>

              {file && (
                <p className="mt-3 text-center text-sm font-medium text-gray-400">
                  Archivo seleccionado:{" "}
                  <span className="text-white">{file.name}</span>
                </p>
              )}
            </div>

            <div className="pt-6">
              <button
                onClick={handleUpload}
                disabled={loadingImport || !file}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  loadingImport || !file
                    ? "cursor-not-allowed bg-gray-800 text-gray-500"
                    : "bg-yellow-400 text-black shadow-sm shadow-yellow-400/20 hover:bg-yellow-500"
                }`}
              >
                {loadingImport && <Loader2 size={18} className="animate-spin" />}
                {loadingImport
                  ? "Procesando e importando..."
                  : "Iniciar importación"}
              </button>
            </div>

            {result && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ResultCard
                  label="Insertados"
                  value={result.insertados ?? 0}
                  color="text-emerald-400"
                />
                <ResultCard
                  label="Actualizados"
                  value={result.actualizados ?? 0}
                  color="text-blue-400"
                />
                <ResultCard
                  label="Errores"
                  value={result.errores?.length ?? 0}
                  color="text-red-400"
                />
              </div>
            )}

            {result?.errores?.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-xl border border-red-500/30">
                <div className="bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                  Errores encontrados durante la importación
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-800 bg-[#0f131a]">
                  {result.errores.map((item, index) => (
                    <div
                      key={`${item.fila}-${index}`}
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      <span className="font-semibold text-red-300">
                        Fila {item.fila}:
                      </span>{" "}
                      {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  buttonText,
  loading,
  onClick,
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0f131a] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
          <Icon size={22} className="text-yellow-400" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-yellow-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Procesando..." : buttonText}
      </button>
    </div>
  );
}

function ResultCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0f131a] p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}