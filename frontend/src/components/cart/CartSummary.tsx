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
}

export default function CartSummary({
  totalPrice,
  finalTotal,
  postalCode,
  setPostalCode,
  handleCheckout,
  router,
}: CartSummaryProps) {
  const formatPrice = (price: number) =>
    price.toLocaleString("es-CL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mt-6 border-t pt-4 space-y-4">
      <div className="flex justify-between">
        <span>Subtotal (sin envío):</span>
        <span>${formatPrice(totalPrice)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span>Medios de envío</span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tu código postal"
            className="border p-2 rounded flex-1"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <Button onClick={() => alert(`Calculando envío para ${postalCode}`)}>
            Calcular
          </Button>
        </div>
        <p
          className="text-gray-500 text-sm cursor-pointer hover:underline"
          onClick={() =>
            window.open(
              "https://www.correoargentino.com.ar/formularios/cpa",
              "_blank"
            )
          }
        >
          No sé mi código postal
        </p>
      </div>

      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total:</span>
        <span>
          ${formatPrice(finalTotal)}
          {finalTotal > 0 && (
            <span className="text-sm font-normal block">
              O hasta 3 x ${formatPrice(finalTotal / 3)} sin interés
            </span>
          )}
        </span>
      </div>

      <Button
        className="w-full text-white"
        style={{ backgroundColor: "#7b5ca2" }}
        onClick={handleCheckout}
      >
        INICIAR COMPRA
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/")}
      >
        Ver más productos
      </Button>
    </div>
  );
}
