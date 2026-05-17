"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Percent, Calendar, Users, Loader2 } from "lucide-react";
import { CuponResponse } from "@/types/promociones";
import { promocionesService } from "@/services/admin/admin-promociones-service";

interface FormCuponProps {
  cuponData?: CuponResponse;
  onSuccess: () => void;
}

interface FormState {
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO" | "ENVIO_GRATIS";
  valor: string | number;
  limiteUso: string | number;
  minimoCarrito: string | number;
  activo: boolean;
  acumulable: boolean;
  soloPrimeraCompra: boolean;
  fechaInicio: string;
  fechaFin: string;
}

const FormCupon = ({ cuponData, onSuccess }: FormCuponProps) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    codigo: "",
    tipo: "PORCENTAJE",
    valor: 0,
    limiteUso: "",
    minimoCarrito: 0,
    activo: true,
    acumulable: false,
    soloPrimeraCompra: false,
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    if (cuponData) {
      // Normalizamos el tipo por si el backend guardó "FIJO" en vez de "MONTO_FIJO"
      let tipoForm: "PORCENTAJE" | "MONTO_FIJO" | "ENVIO_GRATIS" = "PORCENTAJE";
      if (cuponData.tipo === "FIJO" || cuponData.tipo === "MONTO_FIJO")
        tipoForm = "MONTO_FIJO";
      if (cuponData.tipo === "ENVIO_GRATIS") tipoForm = "ENVIO_GRATIS";

      setFormData({
        codigo: cuponData.codigo,
        tipo: tipoForm,
        valor: cuponData.valor,
        minimoCarrito: cuponData.minimoCarrito,
        activo: cuponData.activo,
        acumulable: cuponData.acumulable ?? false,
        soloPrimeraCompra: cuponData.soloPrimeraCompra ?? false,
        limiteUso: cuponData.limiteUso ?? "",
        fechaInicio: cuponData.fechaInicio
          ? new Date(cuponData.fechaInicio).toISOString().split("T")[0]
          : "",
        fechaFin: cuponData.fechaFin
          ? new Date(cuponData.fechaFin).toISOString().split("T")[0]
          : "",
      });
    }
  }, [cuponData]);

  const handleSubmit = async () => {
    setLoading(true);
    const isEditing = !!cuponData;

    const payload = {
      ...formData,
      valor: Number(formData.valor),
      minimoCarrito: Number(formData.minimoCarrito),
      limiteUso: formData.limiteUso !== "" ? Number(formData.limiteUso) : null,
      fechaInicio: formData.fechaInicio || null,
      fechaFin: formData.fechaFin || null,
    };

    try {
      if (isEditing && cuponData.id) {
        await promocionesService.updateCupon(cuponData.id, payload);
      } else {
        await promocionesService.createCupon(payload);
      }

      onSuccess();
    } catch (error: unknown) {
      // 👈 Cambiado a 'unknown' para silenciar ESLint de forma segura
      console.error("Error al procesar el cupón a través del servicio:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al intentar guardar el cupón.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activeTab = "bg-purple-600 text-white shadow-md";
  const inactiveTab =
    "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen pb-32">
      <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-3 pt-10">
        <Ticket className="w-8 h-8" />
        {cuponData ? `Editando: ${cuponData.codigo}` : "Crear nuevo cupón"}
      </h1>

      {/* CÓDIGO */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
        <label className="block text-sm font-semibold text-purple-900 mb-2">
          Código del cupón
        </label>
        <input
          type="text"
          value={formData.codigo}
          onChange={(e) =>
            setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
          }
          placeholder="Ej: MOONLIGHT20"
          className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none uppercase font-mono text-lg"
        />
      </section>

      {/* TIPO Y VALOR */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 space-y-6">
        <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <Percent className="w-5 h-5" /> Configuración del descuento
        </h2>
        <div className="flex flex-wrap gap-3">
          {(["PORCENTAJE", "MONTO_FIJO", "ENVIO_GRATIS"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFormData({ ...formData, tipo: t })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.tipo === t ? activeTab : inactiveTab}`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor del descuento
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-purple-400 font-bold">
                {formData.tipo === "PORCENTAJE" ? "%" : "$"}
              </span>
              <input
                type="number"
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
                className="w-full pl-8 p-3 border border-purple-200 rounded-lg outline-none focus:border-purple-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mínimo de compra
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-purple-400 font-bold">
                $
              </span>
              <input
                type="number"
                value={formData.minimoCarrito}
                onChange={(e) =>
                  setFormData({ ...formData, minimoCarrito: e.target.value })
                }
                className="w-full pl-8 p-3 border border-purple-200 rounded-lg outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RESTRICCIONES */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 space-y-6">
        <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <Users className="w-5 h-5" /> Restricciones y Uso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite de usos totales
            </label>
            <input
              type="number"
              placeholder="Ilimitado si se deja vacío"
              value={formData.limiteUso}
              onChange={(e) =>
                setFormData({ ...formData, limiteUso: e.target.value })
              }
              className="w-full p-3 border border-purple-200 rounded-lg outline-none focus:border-purple-400"
            />
          </div>
          <div className="space-y-3 pt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.soloPrimeraCompra}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soloPrimeraCompra: e.target.checked,
                  })
                }
                className="accent-purple-600 w-4 h-4"
              />
              <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                Solo primera compra
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="accent-purple-600 w-4 h-4"
              />
              <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                Cupón habilitado
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-50">
          <div className="space-y-2">
            <label className="text-xs font-bold text-purple-800 flex items-center gap-1 uppercase tracking-tighter">
              <Calendar className="w-3 h-3" /> Fecha Inicio
            </label>
            <input
              type="date"
              value={formData.fechaInicio}
              onChange={(e) =>
                setFormData({ ...formData, fechaInicio: e.target.value })
              }
              className="w-full p-2 border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-purple-800 flex items-center gap-1 uppercase tracking-tighter">
              <Calendar className="w-3 h-3" /> Fecha Fin
            </label>
            <input
              type="date"
              value={formData.fechaFin}
              onChange={(e) =>
                setFormData({ ...formData, fechaFin: e.target.value })
              }
              className="w-full p-2 border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </section>

      {/* FOOTER ACCIÓN */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-purple-100 flex justify-end max-w-4xl mx-auto shadow-2xl z-50 rounded-t-3xl md:rounded-none">
        <button
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.codigo ||
            (!formData.valor && formData.tipo !== "ENVIO_GRATIS")
          }
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale shadow-lg active:scale-95"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {cuponData ? "Actualizar Cupón" : "Publicar Cupón"}
        </button>
      </div>
    </div>
  );
};

export default FormCupon;
