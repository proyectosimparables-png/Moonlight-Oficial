"use client";

import { useEffect } from "react";
import { useCart } from "@/context/Cart-Context";

export const AddedToCartModal = () => {
  const { lastAddedItem, closeLastAddedModal } = useCart();

  useEffect(() => {
    if (!lastAddedItem) return;

    // Reiniciamos el timer cada vez que cambia el lastAddedItem
    const timer = setTimeout(() => {
      closeLastAddedModal();
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastAddedItem, closeLastAddedModal]);

  if (!lastAddedItem) return null;

  // Extraemos los datos de forma segura
  const nombreProducto = lastAddedItem.producto?.nombre || "Producto";
  const imagenProducto =
    lastAddedItem.producto?.imagenUrl || "/placeholder.png";
  const cantidad = lastAddedItem.quantity || 1;

  return (
    <div
      key={lastAddedItem.id} // ✅ Importante: Reinicia la animación si agregas otro item rápido
      className="fixed top-5 right-5 z-[999] bg-white shadow-2xl border border-gray-100 rounded-lg p-4 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300 min-w-[320px] max-w-[400px]"
    >
      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
        <img
          src={imagenProducto}
          alt={nombreProducto}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="font-bold text-gray-900 text-[13px] leading-tight mb-0.5 truncate">
          {nombreProducto}
        </p>
        <p className="text-[12px] text-gray-500 leading-snug">
          ¡{nombreProducto} se agregó al carrito!
          <span className="ml-1 font-bold text-purple-600">({cantidad})</span>
        </p>
      </div>

      <button
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-900 text-xl leading-none p-1 transition-colors"
        onClick={closeLastAddedModal}
      >
        ✕
      </button>
    </div>
  );
};
