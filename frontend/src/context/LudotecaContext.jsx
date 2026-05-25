import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LudotecaContext = createContext(null);

export const LudotecaProvider = ({ children }) => {
  const [ludotecaStatus, setLudotecaStatus] = useState(null);
  const [ninosLudoteca, setNinosLudoteca] = useState(() => {
    const guardados = localStorage.getItem("ludoteca_ninos");
    if (!guardados) return [];
    try {
      const parsed = JSON.parse(guardados);
      return parsed.map((n) => ({
        ...n,
        tiempo_entrada: (n.tiempo_entrada || "").replace(" ", "T"),
      }));
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [socioId, setSocioId] = useState("");

  // Perseverar en localStorage
  useEffect(() => {
    localStorage.setItem("ludoteca_ninos", JSON.stringify(ninosLudoteca));
  }, [ninosLudoteca]);

  // Función para obtener el status de la ludoteca desde la API
  const fetchLudotecaStatus = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ludoteca/mi-status?id_socio=${id}`);
      const data = await res.json();
      setLudotecaStatus(data);

      // Convertir datos de la API al formato que usa Recepción
      if (data.status === "success" && data.data && Array.isArray(data.data)) {
        const ninos = data.data.map((nino) => ({
          id_socio: nino.id_nino_fk,
          nombre_nino: `${nino.nombre} ${nino.apellidos}`,
          tutor: nino.tutor_nombre || "Tutor",
          tiempo_entrada: (nino.timestamp_entrada || "").replace(" ", "T"),
          segundos_transcurridos: nino.segundos_transcurridos || 0,
        }));
        setNinosLudoteca(ninos);
      } else {
        setNinosLudoteca([]);
      }
    } catch (error) {
      console.error("Error fetching ludoteca status:", error);
      setLudotecaStatus({ status: "error" });
      setNinosLudoteca([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para agregar un nuevo niño a la ludoteca
  const agregarNino = useCallback((nino) => {
    const normalizado = {
      ...nino,
      tiempo_entrada: (nino.tiempo_entrada || "").replace(" ", "T"),
    };
    setNinosLudoteca((prev) => [...prev, normalizado]);
    setLudotecaStatus((prev) => {
      const nuevoItem = {
        id_nino_fk: nino.id_socio,
        nombre: nino.nombre_nino || "",
        apellidos: "",
        timestamp_entrada: normalizado.tiempo_entrada,
        segundos_transcurridos: 0,
      };
      if (prev?.status === "success" && prev?.data) {
        return {
          ...prev,
          data: [...prev.data, nuevoItem],
        };
      }
      return { status: "success", data: [nuevoItem] };
    });
  }, []);

  // Función para remover un niño
  const removerNino = useCallback((idSocio) => {
    setNinosLudoteca((prev) => prev.filter((n) => n.id_socio !== idSocio));
    setLudotecaStatus((prev) => {
      if (prev?.status === "success" && prev?.data) {
        return {
          ...prev,
          data: prev.data.filter((n) => n.id_nino_fk !== idSocio),
        };
      }
      return prev;
    });
  }, []);

  const ajustarTiempo = useCallback(async (idNino, minutos) => {
    try {
      const res = await fetch(`http://localhost:8000/api/ludoteca/ajustar-tiempo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_nino: idNino, minutos }),
      });
      const data = await res.json();
      if (data.status !== "success") return false;

      const nuevoTimestamp = data.timestamp_entrada.replace(" ", "T");

      setNinosLudoteca((prev) =>
        prev.map((n) =>
          n.id_socio === idNino ? { ...n, tiempo_entrada: nuevoTimestamp } : n
        )
      );
      setLudotecaStatus((prev) => {
        if (prev?.status !== "success" || !prev?.data) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id_nino_fk === idNino
              ? { ...n, timestamp_entrada: nuevoTimestamp }
              : n
          ),
        };
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetTiempo = useCallback(async (idNino) => {
    try {
      const res = await fetch(`http://localhost:8000/api/ludoteca/reset-tiempo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_nino: idNino }),
      });
      const data = await res.json();
      if (data.status !== "success") return false;

      const nuevoTimestamp = data.timestamp_entrada.replace(" ", "T");

      setNinosLudoteca((prev) =>
        prev.map((n) =>
          n.id_socio === idNino ? { ...n, tiempo_entrada: nuevoTimestamp } : n
        )
      );
      setLudotecaStatus((prev) => {
        if (prev?.status !== "success" || !prev?.data) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id_nino_fk === idNino
              ? { ...n, timestamp_entrada: nuevoTimestamp }
              : n
          ),
        };
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  // Auto-refrescar cada 60 segundos solo para mantener sincronizado (no afecta al widget del dashboard)
  useEffect(() => {
    if (!socioId) return;

    const intervalo = setInterval(() => {
      fetchLudotecaStatus(socioId);
    }, 60000); // Cada 60 segundos - solo para datos internos, el widget usa su propio contador

    return () => clearInterval(intervalo);
  }, [socioId, fetchLudotecaStatus]);

  const value = {
    ludotecaStatus,
    setLudotecaStatus,
    ninosLudoteca,
    setNinosLudoteca,
    loading,
    socioId,
    setSocioId,
    fetchLudotecaStatus,
    agregarNino,
    removerNino,
    ajustarTiempo,
    resetTiempo,
  };

  return (
    <LudotecaContext.Provider value={value}>
      {children}
    </LudotecaContext.Provider>
  );
};

export const useLudoteca = () => {
  const context = useContext(LudotecaContext);
  if (!context) {
    throw new Error("useLudoteca debe ser usado dentro de LudotecaProvider");
  }
  return context;
};
