"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Step1Datos from "./Step1Datos";
import Step3Pago from "./Step3Pago";
import OrderSummary from "./OrderSummary";

// Definimos la unión de tipos para el método de pago
export type MetodoPago = "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO" | "";

export interface CheckoutFormData {
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  calle: string;
  numero: string;
  piso?: string;
  depto?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  metodoEnvio: string;
  costoEnvio: number;
  metodoPago: MetodoPago;
  notasEntrega: string;
}

// Separamos el contenido para poder usar useSearchParams correctamente con Suspense
const CheckoutContent: React.FC = () => {
  const searchParams = useSearchParams();

  // Capturamos los datos reales que vienen de la URL del carrito
  const urlShippingCost = Number(searchParams.get("shippingCost")) || 0;
  const urlShippingName = searchParams.get("shippingName") || "A convenir";

  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    calle: "",
    numero: "",
    piso: "",
    depto: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    notasEntrega: "",
    // Usamos los valores reales capturados de la URL
    metodoEnvio: urlShippingName,
    costoEnvio: urlShippingCost,
    metodoPago: "",
  });

  const nextStep = () => setStep(3);
  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen bg-[#faf5e5] font-sans text-[#4A4A4A]">
      <header className="py-10 flex flex-col items-center bg-transparent">
        <div className="mb-10">
          <img src="/moonlight.png" alt="Moonlight" className="h-10 w-auto" />
        </div>

        <div className="relative flex items-center justify-between w-full max-w-md px-6">
          <div className="absolute top-[16px] left-10 right-10 h-[1px] bg-gray-300 -z-0"></div>

          {[
            { label: "Carrito", icon: "✓" },
            { label: "Entrega", icon: "🚚" },
            { label: "Pago", icon: "💳" },
          ].map((item, index) => {
            const stepNum = index + 1;
            const showCheck = stepNum === 1 || (stepNum === 2 && step === 3);
            const isHighlighted =
              (stepNum === 2 && step === 1) || (stepNum === 3 && step === 3);
            const isFuture = stepNum === 3 && step === 1;

            return (
              <div
                key={index}
                className="flex flex-col items-center z-10 bg-[#faf5e5] px-3"
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
            {step === 1 ? (
              <Step1Datos
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
              />
            ) : (
              <Step3Pago
                formData={formData}
                setFormData={setFormData}
                prevStep={prevStep}
              />
            )}
          </div>
          <aside className="lg:col-span-5">
            <div className="sticky top-10">
              <OrderSummary formData={formData} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// Exportamos envuelto en Suspense para evitar errores de hidratación de Next.js al usar hooks de navegación
export default function CheckoutWizard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf5e5] flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
