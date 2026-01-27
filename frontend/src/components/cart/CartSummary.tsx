"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  totalPrice: number;
  finalTotal: number;
  postalCode: string;
  setPostalCode: (val: string) => void;
  handleCheckout: () => void;
  router: ReturnType<typeof useRouter>;
  openClearCartModal: () => void;
  isLoading?: boolean;
}

export default function CartSummary({
  totalPrice,
  finalTotal,

  handleCheckout,
  router,

  openClearCartModal, // Agregada a la desestructuración
}: CartSummaryProps) {
  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

  return (
    <div className="mt-6 border-t pt-4 space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between items-center text-gray-600">
        <span>Subtotal (sin envío)</span>
        <span className="font-semibold">{formatPrice(totalPrice)}</span>
      </div>

      {/* Informativo de Envío */}
      <div className="bg-gray-50 p-3 rounded-md border border-dashed border-gray-300">
        <p className="text-xs text-gray-500 text-center">
          El costo de envío y posibles descuentos se calcularán en el siguiente
          paso.
        </p>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total estimado:</span>
        <div className="text-right">
          <span>{formatPrice(finalTotal)}</span>
          {finalTotal > 0 && (
            <span className="text-sm font-normal block text-gray-500">
              O 3 cuotas sin interés de {formatPrice(finalTotal / 3)}
            </span>
          )}
        </div>
      </div>

      {/* Botón Principal */}
      <Button
        className="w-full text-gray-800 bg-[#d8c4fa] hover:bg-[#cbb1f5] font-bold py-6 uppercase tracking-wider"
        disabled={finalTotal === 0}
        onClick={handleCheckout}
      >
        Iniciar Compra
      </Button>

      {/* Botones Secundarios */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="w-full text-xs"
          onClick={() => router.push("/")}
        >
          Ver más productos
        </Button>
        <Button
          variant="ghost"
          className="w-full text-xs text-red-400 hover:text-red-500 hover:bg-red-50"
          onClick={openClearCartModal}
        >
          Vaciar carrito
        </Button>
      </div>
    </div>
  );
}
