"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

// Reutilizamos tus tipos de pago
export type MetodoPago =
  | "MERCADO_PAGO"
  | "TRANSFERENCIA"
  | "GO_CUOTAS"
  | "UALA"
  | "";

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
  deliveredType: "HOME_DELIVERY" | "PICKUP";
  metodoPago: MetodoPago;
  notasEntrega: string;
}

interface CheckoutContextType {
  step: number;
  formData: CheckoutFormData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  isStep1Valid: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();

  // Capturamos datos iniciales de la URL (vienen del Carrito)
  const urlShippingCost = Number(searchParams.get("shippingCost")) || 0;
  const urlShippingName = searchParams.get("shippingName") || "A convenir";

  const urlShippingType =
    (searchParams.get("shippingType") as "HOME_DELIVERY" | "PICKUP") ||
    "PICKUP";

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
    notasEntrega: "",
    metodoEnvio: urlShippingName,
    costoEnvio: urlShippingCost,
    deliveredType: urlShippingType,
    metodoPago: "",
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Lógica de validación centralizada (puedes expandirla con Regex si quieres)
  const isStep1Valid =
    formData.nombre.trim() !== "" &&
    formData.dni.length > 6 &&
    formData.telefono.trim() !== "" &&
    formData.calle.trim() !== "" &&
    formData.provincia !== "" &&
    formData.metodoEnvio !== "";

  return (
    <CheckoutContext.Provider
      value={{
        step,
        formData,
        setStep,
        nextStep,
        prevStep,
        updateFormData,
        isStep1Valid,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context)
    throw new Error("useCheckout debe usarse dentro de un CheckoutProvider");
  return context;
};
