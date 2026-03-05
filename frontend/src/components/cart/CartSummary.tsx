"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Truck, Store, Loader2 } from "lucide-react";
import { getPuntosEntrega } from "@/services/entregas";
import { getShippingRates } from "@/services/correo/correoService";
// 1. Importamos la interfaz oficial para evitar el error de tipos
import { CartItem } from "@/context/CartContext";

// --- INTERFACES ---

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

// Borramos la interfaz CartItem local que estaba aquí antes

interface CartSummaryProps {
  totalPrice: number;
  finalTotal: number;
  postalCode: string;
  setPostalCode: (val: string) => void;
  handleCheckout: () => void;
  router: ReturnType<typeof useRouter>;
  openClearCartModal: () => void;
  isLoading?: boolean;
  items: CartItem[];
  onShippingChange?: (
    nombre: string,
    costo: number,
    deliveredType: "HOME_DELIVERY" | "PICKUP",
  ) => void;
}

type SeleccionEnvio =
  | (PuntoEntrega & { precio?: never })
  | (CorreoRate & { id?: never; costo?: never });

export default function CartSummary({
  totalPrice,
  finalTotal,
  postalCode,
  setPostalCode,
  handleCheckout,
  onShippingChange,
  items,
}: CartSummaryProps) {
  const [puntos, setPuntos] = useState<PuntoEntrega[]>([]);
  const [correoRates, setCorreoRates] = useState<CorreoRate[]>([]);
  const [loadingCorreo, setLoadingCorreo] = useState(false);
  const [puntoSeleccionado, setPuntoSeleccionado] =
    useState<SeleccionEnvio | null>(null);

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
    // Validamos que haya items antes de llamar a la API
    if (postalCode.length < 4 || !items || items.length === 0) {
      console.warn("No hay productos para calcular el envío o el CP es corto");
      return;
    }

    setLoadingCorreo(true);
    try {
      // Ahora 'items' llega correctamente desde el padre
      const rates: CorreoRate[] = await getShippingRates(postalCode, items);
      setCorreoRates(rates);
    } catch (error) {
      console.error("Error calculando envío:", error);
    } finally {
      setLoadingCorreo(false);
    }
  };

  const handleSelectPunto = (punto: PuntoEntrega) => {
    setPuntoSeleccionado(punto);
    if (onShippingChange) {
      onShippingChange(punto.nombre, punto.costo, "PICKUP");
    }
  };

  const handleSelectCorreo = (rate: CorreoRate) => {
    setPuntoSeleccionado(rate);
    if (onShippingChange) {
      const type = rate.deliveredType === "D" ? "HOME_DELIVERY" : "PICKUP";
      onShippingChange(rate.nombre, rate.precio, type);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  const currentShippingCost = puntoSeleccionado
    ? "precio" in puntoSeleccionado
      ? puntoSeleccionado.precio
      : puntoSeleccionado.costo
    : 0;

  const totalConEnvio = finalTotal + currentShippingCost;
  const transferPrice = totalConEnvio * 0.9;
  const isReadyToCheckout = finalTotal > 0 && puntoSeleccionado !== null;

  return (
    <div className="mt-8 space-y-6 border-t border-gray-100 pt-4 font-sans text-[#4A4A4A]">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">
          Subtotal{" "}
          <span className="font-normal text-gray-400">(sin envío) :</span>
        </span>
        <span className="text-base font-bold">{formatPrice(totalPrice)}</span>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-bold mb-4 uppercase tracking-tight">
          Medios de envío
        </h3>

        <div className="relative mb-2">
          <div className="relative border-b border-gray-200 transition-colors">
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
          <a
            href="https://www.correoargentino.com.ar/formularios/cpa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 underline mt-1 block hover:text-gray-600"
          >
            No sé mi código postal
          </a>
        </div>

        {/* --- CORREO ARGENTINO --- */}
        <div className="mb-6 mt-4">
          <p className="text-[13px] font-bold mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" /> Envío a domicilio
          </p>

          {correoRates.length > 0 ? (
            <div className="border border-gray-300 rounded-sm overflow-hidden bg-white shadow-sm">
              {correoRates.map((rate, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCorreo(rate)}
                  className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-start gap-3 transition-all ${
                    puntoSeleccionado?.nombre === rate.nombre
                      ? "bg-gray-50"
                      : "hover:bg-gray-50/30"
                  }`}
                >
                  <div
                    className={`mt-1 w-4 h-4 border flex items-center justify-center transition-all ${
                      puntoSeleccionado?.nombre === rate.nombre
                        ? "border-black bg-black"
                        : "border-gray-300"
                    }`}
                  >
                    {puntoSeleccionado?.nombre === rate.nombre && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start w-full">
                      <span
                        className={`text-[13px] leading-tight ${puntoSeleccionado?.nombre === rate.nombre ? "font-bold" : "font-medium"}`}
                      >
                        {rate.nombre}
                      </span>
                      <span className="text-[13px] text-black font-bold ml-2">
                        {formatPrice(rate.precio)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Llega entre {rate.plazoMin} y {rate.plazoMax} días hábiles
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-sm p-5 bg-[#F9F9F9] border-dashed">
              <p className="text-[11px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
                Ingresá tu CP para ver <br />
                <span className="font-bold text-gray-500">
                  opciones de Correo Argentino
                </span>
              </p>
            </div>
          )}
        </div>

        {/* --- PUNTOS PROPIOS --- */}
        <div className="mb-4">
          <p className="text-[13px] font-bold mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-400" /> Retirar por
          </p>
          <div className="border border-gray-300 rounded-sm overflow-hidden bg-white shadow-sm">
            {puntos.map((punto) => (
              <div
                key={punto.id}
                onClick={() => handleSelectPunto(punto)}
                className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-start gap-3 transition-all ${
                  puntoSeleccionado?.id === punto.id
                    ? "bg-gray-50"
                    : "hover:bg-gray-50/30"
                }`}
              >
                <div
                  className={`mt-1 w-4 h-4 border flex items-center justify-center transition-all ${
                    puntoSeleccionado?.id === punto.id
                      ? "border-black bg-black"
                      : "border-gray-300"
                  }`}
                >
                  {puntoSeleccionado?.id === punto.id && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start w-full">
                    <span
                      className={`text-[13px] leading-tight ${puntoSeleccionado?.id === punto.id ? "font-bold" : "font-medium"}`}
                    >
                      {punto.nombre}
                    </span>
                    <span className="text-[13px] text-green-600 font-bold ml-2">
                      {punto.costo === 0 ? "Gratis" : formatPrice(punto.costo)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {punto.demora || "Retiras entre 2 y 5 días hábiles"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TOTALES --- */}
      <div className="pt-6 border-t border-gray-100 space-y-1 text-right">
        <div className="flex justify-between items-end">
          <span className="text-lg font-light text-gray-400 tracking-[0.2em] uppercase">
            Total:
          </span>
          <span className="text-xl font-bold text-[#4A4A4A]">
            {formatPrice(totalConEnvio)}
          </span>
        </div>
        <p className="text-[10px] md:text-[11px] text-gray-400 uppercase tracking-tighter">
          O {formatPrice(transferPrice)} CON TRANSFERENCIA{" "}
          <span className="text-[#A186ED]">💜</span>
        </p>
      </div>

      <Button
        className={`w-full py-7 rounded-sm text-xs uppercase tracking-[0.2em] transition-all shadow-sm font-bold ${
          isReadyToCheckout
            ? "bg-[#A186ED] hover:bg-[#8e72e0] text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        disabled={!isReadyToCheckout}
        onClick={handleCheckout}
      >
        {puntoSeleccionado
          ? "Iniciar Compra"
          : "Seleccioná un punto de envío o retiro"}
      </Button>
    </div>
  );
}
