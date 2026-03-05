"use client";

import React, { useEffect, useState } from "react";
import { Truck, Store, Loader2 } from "lucide-react";
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
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    async function loadPuntos() {
      const data = await getPuntosEntrega();
      setPuntos(data);
    }
    loadPuntos();
  }, []);

  // calcular envío automático con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.codigoPostal && formData.codigoPostal.length === 4) {
        handleCalculateShipping();
      }
    }, 500); // espera medio segundo antes de calcular

    return () => clearTimeout(timeout);
  }, [formData.codigoPostal]);

  const handleCalculateShipping = async () => {
    if (!formData.codigoPostal || cart.length === 0) return;

    setLoading(true);
    try {
      const rates = await getShippingRates(formData.codigoPostal, cart);
      setCorreoRates(rates);
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
    setShowOptions(false); // cierra las opciones después de elegir
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Opción seleccionada */}
      {formData.metodoEnvio && (
        <div className="border border-gray-300 bg-white p-4 rounded-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{formData.metodoEnvio}</p>
              <p className="text-xs text-gray-400">
                {formData.costoEnvio === 0
                  ? "Gratis"
                  : `$${formData.costoEnvio?.toLocaleString("es-AR")}`}
              </p>
            </div>

            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs font-bold text-gray-500"
            >
              Ver más opciones
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <>
          {/* Código Postal */}
          <div className="relative border-b border-gray-200">
            <input
              type="text"
              placeholder="Tu código postal"
              value={formData.codigoPostal}
              onChange={(e) => updateFormData({ codigoPostal: e.target.value })}
              className="w-full bg-transparent py-2 pr-20 focus:outline-none text-sm"
            />

            <button
              onClick={handleCalculateShipping}
              disabled={loading}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 flex items-center gap-1"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              CALCULAR
            </button>
          </div>

          {/* Envío a domicilio */}
          {correoRates.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Envío a domicilio
              </p>

              <div className="border border-gray-300 rounded-sm overflow-hidden bg-white">
                {correoRates.map((rate, idx) => {
                  const selected = formData.metodoEnvio === rate.nombre;

                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        selectShipping(
                          rate.nombre,
                          rate.precio,
                          rate.deliveredType === "D"
                            ? "HOME_DELIVERY"
                            : "PICKUP",
                        )
                      }
                      className={`p-4 cursor-pointer border-b last:border-b-0 ${
                        selected ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-sm">{rate.nombre}</span>
                        <span className="font-bold text-sm">
                          ${rate.precio.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Llega entre {rate.plazoMin} y {rate.plazoMax} días
                        hábiles
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Puntos de retiro */}
          <div>
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <Store className="w-4 h-4" /> Retirar por
            </p>

            <div className="border border-gray-300 rounded-sm overflow-hidden bg-white">
              {puntos.map((punto) => {
                const selected = formData.metodoEnvio === punto.nombre;

                return (
                  <div
                    key={punto.id}
                    onClick={() =>
                      selectShipping(punto.nombre, punto.costo, "PICKUP")
                    }
                    className={`p-4 cursor-pointer border-b last:border-b-0 ${
                      selected ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm">{punto.nombre}</span>
                      <span className="font-bold text-sm">
                        {punto.costo === 0
                          ? "Gratis"
                          : `$${punto.costo.toLocaleString("es-AR")}`}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {punto.demora || "Retiras entre 2 y 5 días hábiles"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
