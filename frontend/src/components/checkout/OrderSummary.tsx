"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import Image from "next/image";

const OrderSummary: React.FC = () => {
  const { cart = [] } = useCart();
  const [coupon, setCoupon] = useState("");

  const {
    formData,
    subtotal = 0,
    descuento = 0,
    totalFinal = 0,
  } = useCheckout();

  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== "number" || isNaN(price)) return "$0";
    return price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });
  };

  const tieneEnvioCargado = typeof formData?.costoEnvio === "number";
  const costoEnvioReal = tieneEnvioCargado ? formData.costoEnvio : 0;
  const esEnvioGratis = tieneEnvioCargado && formData.costoEnvio === 0;

  const esTransferencia = formData?.metodoPago === "TRANSFERENCIA";
  const descuentoTransferencia = esTransferencia ? totalFinal * 0.1 : 0;

  const totalFinalAbsoluto =
    totalFinal - descuentoTransferencia + costoEnvioReal;

  return (
    <div className="bg-white lg:bg-transparent p-6 lg:p-0 border border-gray-100 lg:border-none rounded-sm sticky top-4 font-sans">
      <h3 className="text-[11px] font-bold mb-6 uppercase text-gray-400 tracking-[0.2em] hidden lg:block">
        Resumen de compra
      </h3>

      {/* Lista de Productos */}
      <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {cart.map((item) => {
          const precioUnitarioAMostrar =
            item?.precioUnitarioVisual ?? item?.precioOriginal ?? 0;
          const lineaSubtotal = item?.subtotalItem ?? 0;
          const itemQuantity = item?.quantity ?? 1;
          const tienePromoItem = (item?.ahorroItem ?? 0) > 0;

          return (
            <div
              key={item.id}
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 border border-gray-100 rounded-sm overflow-hidden bg-gray-50">
                  <Image
                    src={item.producto?.imagenUrl ?? "/placeholder.png"}
                    alt={item.producto?.nombre ?? "Producto"}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 bg-[#4A4A4A] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {itemQuantity}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-gray-700 font-medium line-clamp-1">
                    {item.producto?.nombre ?? "Cargando..."}
                  </span>
                  <span className="text-[11px] text-gray-400 uppercase">
                    {formatPrice(precioUnitarioAMostrar)}
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col">
                <span
                  className={`text-[13px] font-semibold ${lineaSubtotal === 0 ? "text-[#A186ED]" : "text-[#4A4A4A]"}`}
                >
                  {lineaSubtotal === 0 ? "GRATIS" : formatPrice(lineaSubtotal)}
                </span>
                {tienePromoItem && (
                  <span className="text-[9px] text-[#A186ED] font-bold uppercase tracking-tighter">
                    {lineaSubtotal === 0 ? "Regalo" : "Promo"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- SECCIÓN DE CUPÓN (Visual corregida) --- */}
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
            className="flex-1 bg-white border border-gray-200 rounded-sm px-3 py-2 text-[11px] tracking-widest focus:outline-none focus:border-[#A186ED] transition-colors placeholder:text-gray-300"
          />
          <button
            disabled
            className="bg-gray-50 text-gray-300 border border-gray-100 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Desglose de Totales */}
      <div className="space-y-3">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-light">Subtotal productos</span>
          <span className="text-[#4A4A4A]">{formatPrice(subtotal)}</span>
        </div>

        {descuento > 0 && (
          <div className="flex justify-between text-[13px] text-[#A186ED]">
            <span className="font-medium italic">Ahorro por promociones</span>
            <span className="font-bold">-{formatPrice(descuento)}</span>
          </div>
        )}

        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-light">
            Envío {formData?.metodoEnvio && `(${formData.metodoEnvio})`}
          </span>
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

        {esTransferencia && (
          <div className="flex justify-between text-[12px] text-green-600 font-bold bg-green-50/50 p-2 border border-green-100 rounded-sm">
            <span>DTO. TRANSFERENCIA (10% OFF)</span>
            <span>-{formatPrice(descuentoTransferencia)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-5 mt-2 border-t border-gray-200">
          <span className="text-sm font-bold uppercase tracking-widest text-[#4A4A4A]">
            Total a pagar
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#4A4A4A]">
              {formatPrice(totalFinalAbsoluto)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
