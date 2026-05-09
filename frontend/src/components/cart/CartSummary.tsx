"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Loader2, Gift } from "lucide-react";
import { getPuntosEntrega } from "@/services/entregas";
import { getShippingRates } from "@/services/correo/correoService";
import { CartItem, useCart } from "@/context/CartContext"; // Importamos el hook useCart

// --- INTERFACES (Se mantienen igual) ---
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
  productType: string;
  deliveredType: "D" | "S";
  plazoMin: number;
  plazoMax: number;
}

interface CartSummaryProps {
  subtotal: number;
  descuento: number;
  totalPrice: number;
  postalCode: string;
  setPostalCode: (val: string) => void;
  handleCheckout: () => void;
  openClearCartModal: () => void;
  items: CartItem[];
  onShippingChange?: (
    nombre: string,
    costo: number,
    deliveredType: "HOME_DELIVERY" | "PICKUP",
  ) => void;
}

type SeleccionEnvio = {
  nombre: string;
  precioFinal: number;
  tipo: "HOME_DELIVERY" | "PICKUP";
  idRef?: string;
};

export default function CartSummary({
  subtotal,
  descuento,
  totalPrice,
  postalCode,
  setPostalCode,
  handleCheckout,
  openClearCartModal,
  onShippingChange,
  items,
}: CartSummaryProps) {
  // 1. Extraemos los datos de envío gratis del Contexto
  const { esEnvioGratis, montoFaltante } = useCart();

  const [puntos, setPuntos] = useState<PuntoEntrega[]>([]);
  const [correoRates, setCorreoRates] = useState<CorreoRate[]>([]);
  const [loadingCorreo, setLoadingCorreo] = useState(false);
  const [seleccion, setSeleccion] = useState<SeleccionEnvio | null>(null);

  useEffect(() => {
    async function loadPuntos() {
      try {
        const data = await getPuntosEntrega();
        setPuntos(data);
      } catch (error) {
        console.error("Error cargando puntos de entrega:", error);
      }
    }
    loadPuntos();
  }, []);

  const handleCalculateShipping = async () => {
    if (postalCode.length < 4 || !items || items.length === 0) return;
    setLoadingCorreo(true);
    try {
      const rates: CorreoRate[] = await getShippingRates(postalCode, items);
      setCorreoRates(rates);
    } catch (error) {
      console.error("Error calculando envío:", error);
    } finally {
      setLoadingCorreo(false);
    }
  };

  const handleSelectPunto = (punto: PuntoEntrega) => {
    // Aplicamos costo 0 si el beneficio está activo
    const costoFinal = esEnvioGratis ? 0 : punto.costo;

    const nuevaSeleccion: SeleccionEnvio = {
      nombre: punto.nombre,
      precioFinal: costoFinal,
      tipo: "PICKUP",
      idRef: punto.id,
    };
    setSeleccion(nuevaSeleccion);
    onShippingChange?.(punto.nombre, costoFinal, "PICKUP");
  };

  const handleSelectCorreo = (rate: CorreoRate) => {
    // Aplicamos costo 0 si el beneficio está activo
    const costoFinal = esEnvioGratis ? 0 : rate.precio;
    const type = rate.deliveredType === "D" ? "HOME_DELIVERY" : "PICKUP";

    const nuevaSeleccion: SeleccionEnvio = {
      nombre: rate.nombre,
      precioFinal: costoFinal,
      tipo: type,
    };
    setSeleccion(nuevaSeleccion);
    onShippingChange?.(rate.nombre, costoFinal, type);
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });

  // El costo de envío ahora ya viene "morfado" por la lógica de esEnvioGratis si corresponde
  const currentShippingCost = seleccion?.precioFinal ?? 0;
  const totalFinalConEnvio = totalPrice + currentShippingCost;
  const transferPrice = totalFinalConEnvio * 0.9;

  const isReadyToCheckout = totalPrice > 0 && seleccion !== null;

  return (
    <div className="mt-8 space-y-6 border-t border-gray-100 pt-4 font-sans text-[#4A4A4A]">
      {/* 🚀 NUEVO: Mensaje dinámico de Envío Gratis */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        {esEnvioGratis ? (
          <div className="flex items-center gap-3 text-[#A186ED]">
            <Gift className="w-5 h-5 animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-wider">
              ¡Genial! Tu envío es GRATIS ✨
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Gift className="w-4 h-4 text-purple-300" />
            </div>
            <span className="text-xs font-medium">
              Agregá{" "}
              <span className="text-[#A186ED] font-bold">
                {formatPrice(montoFaltante)}
              </span>{" "}
              para tener **Envío Gratis**.
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {descuento > 0 && (
          <div className="flex justify-between items-center text-sm text-[#A186ED] font-bold">
            <span>Descuentos promocionales</span>
            <span>-{formatPrice(descuento)}</span>
          </div>
        )}

        {seleccion && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Envío ({seleccion.nombre})</span>
            <span
              className={`font-medium ${seleccion.precioFinal === 0 ? "text-green-600" : ""}`}
            >
              {seleccion.precioFinal === 0
                ? "Bonificado"
                : formatPrice(seleccion.precioFinal)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-bold mb-4 uppercase tracking-tight">
          Medios de envío
        </h3>
        <div className="relative mb-2">
          <div className="relative border-b border-gray-200">
            <input
              type="text"
              placeholder="Tu código postal"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-transparent py-2 pr-20 focus:outline-none text-sm placeholder-gray-300"
            />
            <button
              onClick={handleCalculateShipping}
              disabled={loadingCorreo}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold hover:text-black transition-colors flex items-center gap-2"
            >
              {loadingCorreo && <Loader2 className="w-3 h-3 animate-spin" />}
              CALCULAR
            </button>
          </div>
        </div>

        {/* Listado Correo Argentino */}
        {correoRates.length > 0 && (
          <div className="mb-6 mt-4 border border-gray-300 rounded-sm overflow-hidden bg-white">
            {correoRates.map((rate, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectCorreo(rate)}
                className="p-4 border-b border-gray-100 cursor-pointer flex items-start gap-3 hover:bg-gray-50"
              >
                <div
                  className={`mt-1 w-4 h-4 border flex items-center justify-center ${seleccion?.nombre === rate.nombre ? "border-black bg-black" : "border-gray-300"}`}
                >
                  {seleccion?.nombre === rate.nombre && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 flex justify-between">
                  <span className="text-[13px]">{rate.nombre}</span>
                  <span
                    className={`text-[13px] font-bold ${esEnvioGratis ? "text-green-600" : ""}`}
                  >
                    {esEnvioGratis ? "Gratis" : formatPrice(rate.precio)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Retiro en puntos propios */}
        <div className="mb-4">
          <p className="text-[13px] font-bold mb-3 flex items-center gap-2">
            <Store className="w-4 h-4" /> Retirar por
          </p>
          <div className="border border-gray-300 rounded-sm overflow-hidden">
            {puntos.map((punto) => (
              <div
                key={punto.id}
                onClick={() => handleSelectPunto(punto)}
                className="p-4 border-b border-gray-100 cursor-pointer flex items-start gap-3 hover:bg-gray-50"
              >
                <div
                  className={`mt-1 w-4 h-4 border flex items-center justify-center ${seleccion?.idRef === punto.id ? "border-black bg-black" : "border-gray-300"}`}
                >
                  {seleccion?.idRef === punto.id && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 flex justify-between">
                  <span className="text-[13px]">{punto.nombre}</span>
                  <span className="text-[13px] text-green-600 font-bold">
                    {punto.costo === 0 || esEnvioGratis
                      ? "Gratis"
                      : formatPrice(punto.costo)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 space-y-1 text-right">
        <div className="flex justify-between items-end">
          <span className="text-lg font-light text-gray-400 tracking-[0.2em] uppercase">
            Total:
          </span>
          <span className="text-xl font-bold text-[#4A4A4A]">
            {formatPrice(totalFinalConEnvio)}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase">
          O {formatPrice(transferPrice)} con transferencia 💜
        </p>
      </div>

      <Button
        className={`w-full py-7 rounded-sm text-xs uppercase tracking-[0.2em] font-bold ${isReadyToCheckout ? "bg-[#A186ED] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        disabled={!isReadyToCheckout}
        onClick={handleCheckout}
      >
        {seleccion ? "Iniciar Compra" : "Seleccioná un punto de envío"}
      </Button>

      <button
        onClick={openClearCartModal}
        className="w-full text-[10px] text-gray-400 uppercase underline mt-2"
      >
        Vaciar carrito
      </button>
    </div>
  );
}
