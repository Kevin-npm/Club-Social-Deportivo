import { useEffect, useState } from "react";
import {
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle2,
} from "lucide-react";

import api from "../config/api";

const defaultSettings = {
  email_notifications: true,
  system_alerts: true,
  security_alerts: true,
  compact_mode: false,
  theme: "dark",
  accent: "yellow",
};

export default function Configuracion() {
  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get("/user/settings");

      if (response.data?.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/user/settings", {
        email_notifications: settings.email_notifications,
        system_alerts: settings.system_alerts,
        security_alerts: settings.security_alerts,
        compact_mode: settings.compact_mode,
        theme: settings.theme,
        accent: settings.accent,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-yellow-400">
            Preferencias
          </p>

          <h1 className="text-3xl font-bold text-white">
            Configuración
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Opciones generales del sistema para el usuario actual.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-500 disabled:opacity-50"
        >
          <Save size={16} />

          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 size={18} />
          Configuración guardada correctamente.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ConfigPanel
          icon={Bell}
          title="Notificaciones"
          description="Administrar avisos y alertas del sistema."
        >
          <ToggleRow
            title="Notificaciones por correo"
            checked={settings.email_notifications}
            onChange={(value) =>
              updateSetting("email_notifications", value)
            }
          />

          <ToggleRow
            title="Alertas del sistema"
            checked={settings.system_alerts}
            onChange={(value) =>
              updateSetting("system_alerts", value)
            }
          />

          <ToggleRow
            title="Alertas de seguridad"
            checked={settings.security_alerts}
            onChange={(value) =>
              updateSetting("security_alerts", value)
            }
          />
        </ConfigPanel>

        <ConfigPanel
          icon={Shield}
          title="Seguridad"
          description="Preferencias de sesión y visualización."
        >
          <ToggleRow
            title="Modo compacto"
            checked={settings.compact_mode}
            onChange={(value) =>
              updateSetting("compact_mode", value)
            }
          />
        </ConfigPanel>

        <ConfigPanel
          icon={Palette}
          title="Apariencia"
          description="Preferencias visuales del sistema."
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-white">
                Tema
              </p>

              <div className="flex gap-2">
                <ThemeButton
                  active={settings.theme === "dark"}
                  label="Oscuro"
                  onClick={() => updateSetting("theme", "dark")}
                />

                <ThemeButton
                  active={settings.theme === "light"}
                  label="Claro"
                  onClick={() => updateSetting("theme", "light")}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-white">
                Color de acento
              </p>

              <div className="flex gap-2">
                <AccentButton
                  color="bg-yellow-400"
                  active={settings.accent === "yellow"}
                  onClick={() => updateSetting("accent", "yellow")}
                />

                <AccentButton
                  color="bg-blue-500"
                  active={settings.accent === "blue"}
                  onClick={() => updateSetting("accent", "blue")}
                />

                <AccentButton
                  color="bg-emerald-500"
                  active={settings.accent === "green"}
                  onClick={() => updateSetting("accent", "green")}
                />
              </div>
            </div>
          </div>
        </ConfigPanel>
      </section>
    </div>
  );
}

function ConfigPanel({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#14171c] p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10">
        <Icon className="text-yellow-400" size={24} />
      </div>

      <h2 className="text-lg font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {description}
      </p>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#0f131a] p-4">
      <p className="text-sm font-medium text-white">
        {title}
      </p>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-yellow-400" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeButton({
  active,
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
          : "border-gray-700 text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function AccentButton({
  color,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 w-10 rounded-full border-2 transition ${
        active
          ? "border-white scale-110"
          : "border-transparent"
      } ${color}`}
    />
  );
}