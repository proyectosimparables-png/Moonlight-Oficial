"use client";

import React, { Suspense } from "react";
import { CheckoutProvider, useCheckout } from "@/context/CheckoutContext";
import Step1Datos from "./Step1Datos";
import Step2Pago from "./Step2Pago";
import OrderSummary from "./OrderSummary";

const CheckoutContent: React.FC = () => {
  const { step } = useCheckout();

  return (
    <div className="min-h-screen bg-[#FAFCEF] font-sans text-[#4A4A4A]">
      <header className="py-10 flex flex-col items-center bg-transparent">
        <div className="mb-10">
          <img src="/moonlight.png" alt="Moonlight" className="h-10 w-auto" />
        </div>

        {/* Stepper Visual */}
        <div className="relative flex items-center justify-between w-full max-w-md px-6">
          <div className="absolute top-[16px] left-10 right-10 h-[1px] bg-gray-300 -z-0"></div>

          {[
            { label: "Carrito", icon: "✓" },
            { label: "Entrega", icon: "🚚" },
            { label: "Pago", icon: "💳" },
          ].map((item, index) => {
            const stepNum = index + 1;
            // Lógica visual del stepper
            const showCheck = stepNum === 1 || (stepNum === 2 && step === 2);
            const isHighlighted =
              (stepNum === 2 && step === 1) || (stepNum === 3 && step === 2);
            const isFuture = stepNum === 3 && step === 1;

            return (
              <div
                key={index}
                className="flex flex-col items-center z-10 bg-[#fafcef] px-3"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    isHighlighted || showCheck
                      ? "border-gray-800 text-gray-800"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <span
                    className={`text-sm grayscale ${isFuture ? "opacity-30" : "opacity-100"}`}
                  >
                    {showCheck ? "✓" : item.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] uppercase mt-2 tracking-widest ${
                    isHighlighted
                      ? "font-bold text-gray-800"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-6xl pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            {/* Renderizado condicional basado en el context */}
            {step === 1 ? <Step1Datos /> : <Step2Pago />}
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-10">
              <OrderSummary />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default function CheckoutWizard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf5e5] flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <CheckoutProvider>
        <CheckoutContent />
      </CheckoutProvider>
    </Suspense>
  );
}
