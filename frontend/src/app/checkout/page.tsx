// src/app/checkout/page.tsx

import CheckoutContainer from "@/components/checkout/Prueba";

export const metadata = {
  title: "Checkout | Moonlight",
  description: "Finalizá tu compra en Moonlight Oficial",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header Estático y Simple */}
      <div className="border-b py-6 bg-[#FAFCEF]">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-[#6c5b7b] tracking-widest uppercase">
            Finalizar Compra
          </h1>
        </div>
      </div>

      <div className="py-10">
        {/* Aquí renderizamos el componente que tiene toda la lógica */}
        <CheckoutContainer />
      </div>
    </main>
  );
}
