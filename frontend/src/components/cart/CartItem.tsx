"use client";

import React from "react";
import Image from "next/image";
import { CartItem as CartItemType } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
  processing: boolean;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
}

export default function CartItem({
  item,
  processing,
  increment,
  decrement,
  remove,
}: CartItemProps) {
  // ✅ Función de formateo de moneda argentina
  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== "number" || isNaN(price)) return "$0";

    return price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });
  };

  /** * ✅ SINCRONIZACIÓN CON LA LÓGICA DEL BACKEND
   * Usamos 'precioUnitarioVisual' para decidir si tachamos o no el precio unitario.
   * Usamos 'subtotalItem' y 'ahorroItem' para mostrar el beneficio final de la línea.
   */
  const quantity = item?.quantity ?? 1;
  const precioBaseSinPromo = item?.precioOriginal ?? 0;
  const ahorroTotalLinea = item?.ahorroItem ?? 0;
  const subtotalDeEstaLinea = item?.subtotalItem ?? 0;

  // Si el back no manda precioUnitarioVisual, usamos el precioBase
  const precioAMostrarUnitario =
    item?.precioUnitarioVisual ?? precioBaseSinPromo;

  // Solo tachamos si el precio unitario que calculó el back es menor al de lista
  // (Esto pasará en 20% OFF, pero no en un 3x2 donde el unitario se mantiene)
  const mostrarTachadoUnitario = precioAMostrarUnitario < precioBaseSinPromo;
  const tieneAhorroEnLinea = ahorroTotalLinea > 0;

  return (
    <li className="flex gap-4 py-6 border-b border-gray-100 relative group">
      {/* Imagen del producto */}
      <div className="w-24 h-24 shrink-0 overflow-hidden rounded-sm bg-gray-50 relative">
        <Image
          src={item.producto?.imagenUrl ?? "/placeholder.png"}
          alt={item.producto?.nombre ?? "Producto"}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[15px] font-normal text-gray-500 mb-1">
              {item.producto?.nombre ?? "Cargando producto..."}
            </h3>

            <div className="flex flex-col">
              {mostrarTachadoUnitario && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(precioBaseSinPromo)}
                </span>
              )}
              <p
                className={`text-base font-bold ${
                  mostrarTachadoUnitario ? "text-[#A186ED]" : "text-[#4A4A4A]"
                }`}
              >
                {formatPrice(precioAMostrarUnitario)}
                <span className="text-[10px] ml-1 font-normal text-gray-400 uppercase">
                  c/u
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => remove(item.id)}
            disabled={processing}
            className="text-[11px] text-gray-400 underline hover:text-red-400 transition-colors uppercase tracking-tighter"
          >
            Borrar
          </button>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              Subtotal
            </span>
            <span className="text-sm font-medium text-[#4A4A4A]">
              {formatPrice(subtotalDeEstaLinea)}
            </span>

            {/* Mensaje de ahorro dinámico */}
            {tieneAhorroEnLinea && (
              <span className="text-[9px] text-[#A186ED] font-bold italic">
                {ahorroTotalLinea >= precioBaseSinPromo && quantity === 1
                  ? "¡UNIDAD DE REGALO!"
                  : `¡Ahorraste ${formatPrice(ahorroTotalLinea)}!`}
              </span>
            )}
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden h-8 bg-white">
            <button
              onClick={() => decrement(item.id)}
              disabled={processing || quantity <= 1}
              className="px-3 h-full text-gray-400 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-light text-gray-600">
              {quantity}
            </span>
            <button
              onClick={() => increment(item.id)}
              disabled={processing}
              className="px-3 h-full text-gray-400 hover:bg-gray-50 border-l border-gray-200"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
