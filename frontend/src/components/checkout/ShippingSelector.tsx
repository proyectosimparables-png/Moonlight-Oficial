"use client";

import React, { useEffect, useState } from "react";
import { Truck, Store, Loader2, AlertCircle } from "lucide-react";
import { getPuntosEntrega } from "@/services/entregas";
import { getShippingRates } from "@/services/correo/correoService";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";

interface PuntoEntrega {
  id: string;
  nombre: string;
  direccion: string;
  costo: number;
  demora?: string;
}

interface CorreoRate {
  nombre: string;
  precio: number;
  deliveredType: "D" | "S";
  plazoMin: number;
  plazoMax: number;
}

export default function ShippingSelector() {
  const { formData, updateFormData } = useCheckout();
  const { cart } = useCart();

  const [puntos, setPuntos] = useState<PuntoEntrega[]>([]);
  const [correoRates, setCorreoRates] = useState<CorreoRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(!formData.metodoEnvio);

  // Carga inicial de puntos de retiro propios
  useEffect(() => {
    async function loadPuntos() {
      try {
        const data = await getPuntosEntrega();
        setPuntos(data);
      } catch (err) {
        console.error("Error cargando puntos:", err);
      }
    }
    loadPuntos();
  }, []);

  // Calcular envío automático con debounce cuando cambia el CP
  useEffect(() => {
    const cp = formData.codigoPostal?.trim();
    if (cp && cp.length >= 4) {
      const timeout = setTimeout(() => {
        handleCalculateShipping(cp);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [formData.codigoPostal]);

  const handleCalculateShipping = async (cp: string) => {
    if (!cp || cart.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const rates = await getShippingRates(cp, cart);
      setCorreoRates(rates);
      if (rates.length === 0)
        setError("No hay envíos disponibles para este CP.");
    } catch (err) {
      setError("No pudimos calcular el envío. Intenta más tarde.");
      setCorreoRates([]);
    } finally {
      setLoading(false);
    }
  };

  const selectShipping = (
    nombre: string,
    costo: number,
    type: "HOME_DELIVERY" | "PICKUP",
  ) => {
    updateFormData({
      metodoEnvio: nombre,
      costoEnvio: costo,
      deliveredType: type,
    });
    setShowOptions(false);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });

  return (
    <div className="space-y-6 mt-4 font-sans">
      {/* Opción seleccionada actualmente */}
      {formData.metodoEnvio && (
        <div className="border border-[#A186ED] bg-purple-50/30 p-4 rounded-sm flex justify-between items-center animate-in fade-in">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              Método seleccionado
            </p>
            <p className="text-sm font-bold text-[#4A4A4A]">
              {formData.metodoEnvio}
            </p>
            <p className="text-xs text-[#A186ED] font-semibold">
              {formData.costoEnvio === 0
                ? "Envío Gratis"
                : formatCurrency(formData.costoEnvio)}
            </p>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-[11px] font-bold text-gray-500 underline uppercase tracking-tighter"
          >
            {showOptions ? "Cerrar" : "Cambiar"}
          </button>
        </div>
      )}

      {showOptions && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Input Código Postal */}
          <div className="relative border-b border-gray-200 focus-within:border-[#A186ED] transition-colors">
            <input
              type="text"
              placeholder="Tu código postal (ej: 1712)"
              value={formData.codigoPostal}
              onChange={(e) => updateFormData({ codigoPostal: e.target.value })}
              className="w-full bg-transparent py-3 pr-20 focus:outline-none text-sm placeholder-gray-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-[#A186ED]" />
              )}
              <span className="text-[10px] font-bold text-gray-300 uppercase">
                CP
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-50 p-2 rounded-sm">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}

          {/* Listado Correo Argentino */}
          {correoRates.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 flex items-center gap-2">
                <Truck className="w-3 h-3" /> Correo Argentino
              </p>
              <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                {correoRates.map((rate, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      selectShipping(
                        rate.nombre,
                        rate.precio,
                        rate.deliveredType === "D" ? "HOME_DELIVERY" : "PICKUP",
                      )
                    }
                    className="p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 flex justify-between items-center transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{rate.nombre}</p>
                      <p className="text-[10px] text-gray-400">
                        Entre {rate.plazoMin}-{rate.plazoMax} días hábiles
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[#4A4A4A]">
                      {formatCurrency(rate.precio)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Puntos de retiro */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 flex items-center gap-2">
              <Store className="w-3 h-3" /> Retiro Local (Showrooms)
            </p>
            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
              {puntos.map((punto) => (
                <div
                  key={punto.id}
                  onClick={() =>
                    selectShipping(punto.nombre, punto.costo, "PICKUP")
                  }
                  className="p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{punto.nombre}</p>
                    <p className="text-[10px] text-gray-400">
                      {punto.demora || "Listo en 48hs hábiles"}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-sm ${punto.costo === 0 ? "text-green-600" : "text-[#4A4A4A]"}`}
                  >
                    {punto.costo === 0 ? "Gratis" : formatCurrency(punto.costo)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
