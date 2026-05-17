"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Construction, Lock, MessageSquare, Power } from "lucide-react";

interface ConfigTienda {
  id: string;
  mantenimientoActivo: boolean;
  mantenimientoMensaje: string;
  mantenimientoCodigo: string;
}

export default function ConfigMantenimiento() {
  const [config, setConfig] = useState<ConfigTienda | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion-tienda/publico`)
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => toast.error("Error al cargar la configuración"));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setUpdating(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuracion-tienda/mantenimiento/${config.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        },
      );

      if (res.ok) {
        toast.success("Configuración actualizada");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Estilo Moonlight */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Construction className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Modo Mantenimiento
          </h1>
        </div>
        <p className="text-gray-500 ml-11">
          Gestioná la visibilidad pública de Moonlight y el acceso exclusivo.
        </p>
      </header>

      <div className="grid gap-6">
        {/* Card Principal: Estado del Sitio */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${config?.mantenimientoActivo ? "bg-amber-100" : "bg-green-100"}`}
              >
                <Power
                  className={`w-6 h-6 ${config?.mantenimientoActivo ? "text-amber-600" : "text-green-600"}`}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Estado del Sitio
                </h2>
                <p className="text-sm text-gray-500 italic">
                  {config?.mantenimientoActivo
                    ? "La tienda está oculta al público general."
                    : "La tienda está publicada y visible para todos."}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setConfig({
                  ...config!,
                  mantenimientoActivo: !config?.mantenimientoActivo,
                })
              }
              className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                config?.mantenimientoActivo ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${
                  config?.mantenimientoActivo ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Mensaje y Código */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
          {/* Mensaje */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <label>Mensaje para tus clientes</label>
            </div>
            <textarea
              value={config?.mantenimientoMensaje}
              onChange={(e) =>
                setConfig({ ...config!, mantenimientoMensaje: e.target.value })
              }
              placeholder="Ej: Estamos renovando stock para brillar más..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 transition-all min-h-[120px] resize-none"
            />
          </div>

          {/* Código VIP */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Lock className="w-4 h-4 text-purple-500" />
              <label>Contraseña VIP de acceso</label>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={config?.mantenimientoCodigo}
                onChange={(e) =>
                  setConfig({ ...config!, mantenimientoCodigo: e.target.value })
                }
                placeholder="Ingresá un código (Ej: MOONLIGHT2026)"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pl-12 text-gray-700 font-mono tracking-wider outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 transition-all"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <p className="text-xs text-purple-400 font-medium pl-2 italic">
              * Compartí este código solo con personas que necesiten testear la
              tienda.
            </p>
          </div>

          {/* Botón Guardar Estilo Moonlight */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={updating}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {updating ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
