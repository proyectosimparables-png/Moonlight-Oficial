import React, { useState } from "react";
import Step1Datos from "./Step1Datos";
import Step2Envio from "./Step2Envio";
import Step3Pago from "./Step3Pago";
import OrderSummary from "./OrderSummary";

// Exportamos la interfaz para que los otros pasos la usen
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
  metodoPago: "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO" | "";
}

const CheckoutWizard: React.FC = () => {
  const [step, setStep] = useState(1);

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
    metodoEnvio: "",
    costoEnvio: 0,
    metodoPago: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between mb-8 border-b pb-4">
          <span
            className={`font-bold ${step >= 1 ? "text-purple-600" : "text-gray-400"}`}
          >
            1. Datos
          </span>
          <span
            className={`font-bold ${step >= 2 ? "text-purple-600" : "text-gray-400"}`}
          >
            2. Envío
          </span>
          <span
            className={`font-bold ${step >= 3 ? "text-purple-600" : "text-gray-400"}`}
          >
            3. Pago
          </span>
        </div>

        {step === 1 && (
          <Step1Datos
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <Step2Envio
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <Step3Pago
            formData={formData}
            setFormData={setFormData}
            prevStep={prevStep}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        <OrderSummary formData={formData} />
      </div>
    </div>
  );
};

export default CheckoutWizard;
