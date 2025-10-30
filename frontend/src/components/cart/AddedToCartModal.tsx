"use client"; // 🔹 OBLIGATORIO para usar hooks de React o contextos de cliente

import { useCart } from "@/context/CartContext";

export const AddedToCartModal = () => {
  const { lastAddedItem, closeLastAddedModal } = useCart();

  if (!lastAddedItem) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-lg border rounded p-4 flex items-center space-x-4 animate-fade-in">
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
        className="ml-auto text-gray-400 hover:text-gray-600"
        onClick={closeLastAddedModal}
      >
        ✕
      </button>
    </div>
  );
};
