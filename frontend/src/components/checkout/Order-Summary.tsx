"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/Cart-Context";
import { useCheckout } from "@/context/Checkout-Context";
import Image from "next/image";

// Definimos la estructura del cupón para evitar el uso de 'any'
interface Cupon {
  id: string;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: number;
}

const OrderSummary: React.FC = () => {
  const { cart = [] } = useCart();
  const [coupon, setCoupon] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    formData,
    subtotal = 0,
    descuento = 0,
    cuponAplicado,
    setCuponAplicado,
  } = useCheckout();

  const formatPrice = (price: number | undefined | null): string => {
    if (typeof price !== "number" || isNaN(price)) return "$0";
    return price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });
  };

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    setLoading(true);
    setError(null);

    const montoLimpio = Math.round(subtotal);

    try {
      const url = `http://localhost:3000/promociones/validar-cupon/${coupon}?montoCarrito=${montoLimpio}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setCuponAplicado(null);
        throw new Error(data.message || "Cupón inválido");
      }

      // Tipamos la respuesta como Cupon
      const cuponValido = data as Cupon;
      setCuponAplicado(cuponValido);
    } catch (err) {
      // Manejo de error sin 'any' usando instancia de Error
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
      setCuponAplicado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coupon === "") setError(null);
  }, [coupon]);

  // --- CÁLCULOS ---
  const tieneEnvioCargado = typeof formData?.costoEnvio === "number";
  const costoEnvioReal = tieneEnvioCargado
    ? (formData?.costoEnvio as number)
    : 0;
  const esEnvioGratis = tieneEnvioCargado && costoEnvioReal === 0;

  let montoDescuentoCupon = 0;
  if (cuponAplicado) {
    if (cuponAplicado.tipo === "PORCENTAJE") {
      montoDescuentoCupon = subtotal * (cuponAplicado.valor / 100);
    } else if (cuponAplicado.tipo === "MONTO_FIJO") {
      montoDescuentoCupon = cuponAplicado.valor;
    }
  }

  const esTransferencia = formData?.metodoPago === "TRANSFERENCIA";
  const subtotalConDescuentos = Math.max(
    0,
    subtotal - descuento - montoDescuentoCupon,
  );

  const descuentoTransferencia = esTransferencia
    ? subtotalConDescuentos * 0.1
    : 0;

  const totalFinalAbsoluto =
    subtotalConDescuentos - descuentoTransferencia + costoEnvioReal;

  return (
    <div className="bg-white lg:bg-transparent p-6 lg:p-0 border border-gray-100 lg:border-none rounded-sm sticky top-4 font-sans">
      <h3 className="text-[11px] font-bold mb-6 uppercase text-gray-400 tracking-[0.2em] hidden lg:block">
        Resumen de compra
      </h3>

      <div className="space-y-4 mb-6">
        {cart.map((item) => {
          const precioUnitarioAMostrar =
            item?.precioUnitarioVisual ?? item?.precioOriginal ?? 0;
          const lineaSubtotal = item?.subtotalItem ?? 0;
          const itemQuantity = item?.quantity ?? 1;
          const productoInfo = item.variante?.producto;

          return (
            <div
              key={item.id}
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 border border-gray-100 rounded-sm overflow-hidden bg-gray-50">
                  <Image
                    src={productoInfo?.imagenUrl ?? "/logo-moonlight.png"}
                    alt={productoInfo?.nombre ?? "Producto"}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 bg-[#4A4A4A] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {itemQuantity}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-gray-700 font-medium line-clamp-1">
                    {productoInfo?.nombre ?? "Producto"}
                  </span>
                  <span className="text-[11px] text-gray-400 uppercase">
                    {formatPrice(precioUnitarioAMostrar)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[13px] font-semibold ${lineaSubtotal === 0 ? "text-[#A186ED]" : "text-[#4A4A4A]"}`}
                >
                  {lineaSubtotal === 0 ? "GRATIS" : formatPrice(lineaSubtotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 pt-4 border-t border-gray-100">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
          ¿Tenés un cupón?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="INGRESÁ TU CÓDIGO"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            className={`flex-1 bg-white border ${error ? "border-red-500" : "border-gray-200"} rounded-sm px-3 py-2 text-[11px] tracking-widest focus:outline-none focus:border-[#A186ED] transition-colors placeholder:text-gray-300`}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading || !coupon}
            className={`${
              loading || !coupon
                ? "bg-gray-50 text-gray-300"
                : "bg-[#4A4A4A] text-white hover:bg-black"
            } border px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all`}
          >
            {loading ? "..." : "Aplicar"}
          </button>
        </div>

        {error && (
          <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-tighter">
            {error}
          </p>
        )}

        {cuponAplicado && (
          <div className="flex justify-between items-center mt-2 bg-green-50 p-2 border border-green-100 rounded-sm">
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">
              CUPÓN {cuponAplicado.codigo} APLICADO
            </p>
            <button
              onClick={() => {
                setCuponAplicado(null);
                setCoupon("");
              }}
              className="text-[9px] text-green-700 underline uppercase font-bold"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-light">Subtotal productos</span>
          <span className="text-[#4A4A4A]">{formatPrice(subtotal)}</span>
        </div>

        {montoDescuentoCupon > 0 && (
          <div className="flex justify-between text-[13px] text-green-600">
            <span className="font-medium italic">Cupón de descuento</span>
            <span className="font-bold">
              -{formatPrice(montoDescuentoCupon)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-light">Envío</span>
          <span
            className={
              esEnvioGratis ? "text-green-600 font-bold" : "text-[#4A4A4A]"
            }
          >
            {esEnvioGratis
              ? "Gratis"
              : tieneEnvioCargado
                ? formatPrice(costoEnvioReal)
                : "A calcular"}
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-5 mt-2 border-t border-gray-200">
          <span className="text-sm font-bold uppercase tracking-widest text-[#4A4A4A]">
            Total a pagar
          </span>
          <span className="text-2xl font-bold text-[#4A4A4A]">
            {formatPrice(totalFinalAbsoluto)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
