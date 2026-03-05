"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext"; // 👈 Importamos el nuevo contexto

const OrderSummary: React.FC = () => {
  const { cart } = useCart();
  const { formData } = useCheckout(); // 👈 Consumimos los datos directamente

  // 1. Cálculo del subtotal base (productos)
  const subtotal = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0,
  );

  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  // 2. Lógica de Envío (Ya no depende de props, viene del contexto)
  const tieneEnvioCargado = typeof formData.costoEnvio === "number";
  const costoEnvioReal = tieneEnvioCargado ? formData.costoEnvio : 0;
  const esEnvioGratis = tieneEnvioCargado && formData.costoEnvio === 0;

  // 3. Cálculo de beneficios por medio de pago
  const esTransferencia = formData.metodoPago === "TRANSFERENCIA";
  const descuentoTransferencia = esTransferencia ? subtotal * 0.1 : 0;

  // 4. Total Final
  const totalFinal = subtotal - descuentoTransferencia + costoEnvioReal;

  return (
    <div className="bg-white lg:bg-transparent p-6 lg:p-0 border border-gray-100 lg:border-none rounded-sm sticky top-4 font-sans shadow-sm lg:shadow-none">
      <h3 className="text-[11px] font-bold mb-6 uppercase text-gray-400 tracking-[0.2em] hidden lg:block">
        Resumen de compra
      </h3>

      {/* Lista de Productos */}
      <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0 border border-gray-100 rounded-sm overflow-hidden bg-gray-50">
                <img
                  src={item.producto.imagenUrl ?? "/placeholder.png"}
                  alt={item.producto.nombre}
                  className="object-cover w-full h-full"
                />
                <span className="absolute -top-1 -right-1 bg-[#4A4A4A] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-700 font-medium leading-tight">
                  {item.producto.nombre}
                </span>
                <span className="text-[11px] text-gray-400 uppercase mt-0.5">
                  {formatPrice(item.producto.precio)}
                </span>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-[#4A4A4A]">
              {formatPrice(item.producto.precio * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Desglose de Totales */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-normal">Subtotal</span>
          <span className="text-[#4A4A4A] font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Costo de Envío Dinámico */}
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500 font-normal">
            Envío ({formData.metodoEnvio || "A convenir"})
          </span>
          <span
            className={`font-medium ${esEnvioGratis ? "text-green-600 font-bold" : "text-[#4A4A4A]"}`}
          >
            {esEnvioGratis
              ? "Gratis"
              : tieneEnvioCargado
                ? formatPrice(formData.costoEnvio)
                : "A calcular"}
          </span>
        </div>

        {/* Descuento por Transferencia */}
        {esTransferencia && (
          <div className="flex justify-between text-[13px] text-green-600 font-medium bg-green-50 p-2 rounded-sm border border-green-100 border-dashed">
            <span>Descuento 10% (Transferencia)</span>
            <span>-{formatPrice(descuentoTransferencia)}</span>
          </div>
        )}

        <div className="pt-2">
          <button className="text-[10px] text-gray-400 underline uppercase tracking-widest hover:text-[#A186ED] transition-colors">
            ¿Tenés un cupón de descuento?
          </button>
        </div>

        {/* Total Final */}
        <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-gray-200">
          <span className="text-sm font-bold uppercase tracking-wider text-[#4A4A4A]">
            Total
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#4A4A4A]">
              {formatPrice(totalFinal)}
            </span>
            {esTransferencia && (
              <p className="text-[10px] text-green-600 font-bold uppercase mt-1">
                ¡Ahorraste {formatPrice(descuentoTransferencia)}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
