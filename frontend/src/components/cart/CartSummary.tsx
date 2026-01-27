"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Opcional: para un spinner

interface CartSummaryProps {
  totalPrice: number;
  finalTotal: number;
  postalCode: string;
  setPostalCode: (val: string) => void;
  handleCheckout: () => void;
  router: ReturnType<typeof useRouter>;
  openClearCartModal: () => void;
  isLoading?: boolean; // Nueva prop
}

export default function CartSummary({
  totalPrice,
  finalTotal,
  postalCode,
  setPostalCode,
  handleCheckout,
  router,
  isLoading = false,
}: CartSummaryProps) {
  const formatPrice = (price: number) =>
    price.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

  return (
    <div className="mt-6 border-t pt-4 space-y-4">
      {/* ... Subtotal y Medios de envío se mantienen igual ... */}

      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total:</span>
        <div className="text-right">
          <span>{formatPrice(finalTotal)}</span>
          {finalTotal > 0 && (
            <span className="text-sm font-normal block text-gray-500">
              O 3 cuotas sin interés de {formatPrice(finalTotal / 3)}
            </span>
          )}
        </div>
      </div>

      <Button
        className="w-full text-gray-800 bg-[#d8c4fa] hover:bg-[#cbb1f5] font-bold py-6"
        disabled={isLoading || finalTotal === 0}
        onClick={handleCheckout}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            PROCESANDO...
          </>
        ) : (
          "INICIAR COMPRA"
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/")}
        disabled={isLoading}
      >
        Ver más productos
      </Button>
    </div>
  );
}
