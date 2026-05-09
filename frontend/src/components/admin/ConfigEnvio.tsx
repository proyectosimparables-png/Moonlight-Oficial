"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Save,
  Loader2,
  Edit3,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import {
  getConfigEnvio,
  updateConfigEnvio,
} from "@/services/configEnvioService";

// --- INTERFAZ ---
interface ConfigEnvioData {
  id: string;
  montoMinimo: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ConfigEnvio() {
  const [config, setConfig] = useState<ConfigEnvioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados del formulario tipados
  const [montoMinimo, setMontoMinimo] = useState<number>(0);
  const [activo, setActivo] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getConfigEnvio();
      if (data) {
        setConfig(data);
        setMontoMinimo(data.montoMinimo);
        setActivo(data.activo);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!config?.id) return;

    setIsSaving(true);
    try {
      const success = await updateConfigEnvio(config.id, {
        montoMinimo,
        activo,
      });
      if (success) {
        await loadData();
        setIsEditing(false);
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-purple-600">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="font-medium">Cargando configuración...</p>
      </div>
    );

  // --- VISTA DE EDICIÓN (FORMULARIO) ---
  if (isEditing) {
    return (
      <div className="max-w-2xl bg-white rounded-[2rem] shadow-sm border border-purple-100 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Volver
            </span>
          </button>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
            Editar Regla
          </h2>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider ml-1">
              Monto mínimo de compra
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                $
              </span>
              <input
                type="number"
                value={montoMinimo}
                onChange={(e) => setMontoMinimo(Number(e.target.value))}
                className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 outline-none text-2xl font-bold text-gray-800 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-purple-50 rounded-[1.5rem] border border-purple-100">
            <div>
              <p className="font-bold text-purple-900">Estado del beneficio</p>
              <p className="text-xs text-purple-400 font-medium">
                Habilita o deshabilita la regla globalmente
              </p>
            </div>
            <button
              onClick={() => setActivo(!activo)}
              className={`w-14 h-8 rounded-full transition-all duration-300 relative ${activo ? "bg-purple-600 shadow-lg shadow-purple-200" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-all duration-300 ${activo ? "left-7" : "left-1"}`}
              />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gray-900 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            <span className="text-lg">Actualizar Configuración</span>
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA DE LISTA (CARD PRINCIPAL) ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:border-purple-200 transition-all group relative">
        {/* Botón de Editar con estilo Moonlight */}
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
          title="Editar configuración"
        >
          <Edit3 size={18} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform duration-500">
            <Truck size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
              Regla Global
            </span>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">
              Envío Gratis
            </h3>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Se aplica desde
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-800">
                ${config?.montoMinimo.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {config?.activo ? (
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-widest border border-green-100">
                <CheckCircle2 size={12} /> ACTIVO
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100">
                <XCircle size={12} /> INACTIVO
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-2 text-gray-400">
          <p className="text-[11px] font-medium leading-relaxed italic">
            Monto mínimo configurable para incentivar el aumento del ticket
            promedio.
          </p>
        </div>
      </div>
    </div>
  );
}
