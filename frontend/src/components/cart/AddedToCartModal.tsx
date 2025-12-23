//frontend/src/components/cart/AddedToCartModal.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export const AddedToCartModal = () => {
  const { lastAddedItem, closeLastAddedModal } = useCart();

  useEffect(() => {
    if (!lastAddedItem) return;

    const timer = setTimeout(() => {
      closeLastAddedModal();
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [lastAddedItem, closeLastAddedModal]);

  if (!lastAddedItem) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-white shadow-lg border rounded p-4 flex items-center space-x-4 animate-fade-in">
      <img
        src={lastAddedItem.producto.imagenUrl || "/placeholder.png"}
        alt={lastAddedItem.producto.nombre}
        className="w-16 h-16 object-cover rounded"
      />
      <div>
        <p className="font-semibold">{lastAddedItem.producto.nombre}</p>
        <p className="text-sm text-gray-500">
          Se agregó al carrito ({lastAddedItem.quantity})
        </p>
      </div>
      <button
        className="ml-auto text-gray-600 hover:text-black text-xl leading-none"
        onClick={closeLastAddedModal}
      >
        ✕
      </button>
    </div>
  );
};
