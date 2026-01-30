// src/app/checkout/page.tsx

import CheckoutContainer from "@/components/checkout/CheckoutContainer";

export const metadata = {
  title: "Checkout | Moonlight",
  description: "Finalizá tu compra en Moonlight Oficial",
};

export default function CheckoutPage() {
  return (
    // Aplicamos el color crema exacto que pediste (#faf5e5)
    <main className="min-h-screen bg-[#faf5e5]">
      {/* Eliminamos el py-10 extra para que el logo quede arriba como en la foto */}
      <CheckoutContainer />
    </main>
  );
}
