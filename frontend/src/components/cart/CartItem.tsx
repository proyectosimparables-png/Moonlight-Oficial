"use client";

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
  // Formato de moneda Argentina con los decimales como en la foto
  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  return (
    <li className="flex gap-4 py-6 border-b border-gray-100 relative group">
      {/* Imagen del producto - Tamaño y estilo de la captura */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={item.producto.imagenUrl ?? "/placeholder.png"}
          alt={item.producto.nombre}
          className="w-full h-full object-cover rounded-sm"
        />
      </div>

      {/* Información del Producto */}
      <div className="flex flex-col flex-1 justify-between py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[15px] font-normal text-gray-500 mb-1">
              {item.producto.nombre}
            </h3>
            <p className="text-base font-bold text-[#4A4A4A]">
              {formatPrice(item.producto.precio)}
            </p>
          </div>

          {/* Botón Borrar - Estilo link minimalista */}
          <button
            onClick={() => remove(item.id)}
            disabled={processing}
            className="text-[11px] text-gray-400 underline hover:text-red-400 transition-colors uppercase tracking-tighter"
          >
            Borrar
          </button>
        </div>

        {/* Selector de Cantidad - Recuadro gris minimalista */}
        <div className="flex justify-end mt-2">
          <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden h-8">
            <button
              onClick={() => decrement(item.id)}
              disabled={processing || item.quantity <= 1}
              className="px-3 h-full text-gray-400 hover:bg-gray-50 transition-colors border-r border-gray-200 text-sm"
            >
              −
            </button>
            <span className="px-4 min-w-[32px] text-center text-sm font-light text-gray-600">
              {item.quantity}
            </span>
            <button
              onClick={() => increment(item.id)}
              disabled={processing}
              className="px-3 h-full text-gray-400 hover:bg-gray-50 transition-colors border-l border-gray-200 text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
