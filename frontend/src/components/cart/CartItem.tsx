//frontend/src/components/cart/CartItem.tsx
"use client";

import { Button } from "@/components/ui/button";

interface Producto {
  nombre: string;
  precio: number;
  imagenUrl?: string;
}

interface CartItemType {
  id: string;
  quantity: number;
  producto: Producto;
}

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
  const formatPrice = (price: number) =>
    price.toLocaleString("es-CL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <li className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <img
          src={item.producto.imagenUrl ?? "/placeholder.png"}
          alt={item.producto.nombre}
          className="w-20 h-20 object-cover rounded"
        />
        <div>
          <p className="font-semibold">{item.producto.nombre}</p>
          <p className="text-gray-500">${formatPrice(item.producto.precio)}</p>
        </div>
      </div>

      {/* Contenedor vertical para eliminar y controles */}
      <div className="flex flex-col items-center gap-3 min-w-[90px]">
        {/* Botón eliminar */}
        <Button
          size="sm"
          className="bg-[#d8c4fa] text-gray-800 hover:bg-[#cbb1f5] whitespace-nowrap"
          onClick={() => remove(item.id)}
          disabled={processing}
        >
          Eliminar
        </Button>

        {/* Controles de cantidad */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 flex items-center justify-center rounded-full"
            onClick={() => decrement(item.id)}
            disabled={processing}
          >
            -
          </Button>
          <span className="px-3 min-w-[20px] text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 flex items-center justify-center rounded-full"
            onClick={() => increment(item.id)}
            disabled={processing}
          >
            +
          </Button>
        </div>
      </div>
    </li>
  );
}
