"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export type MetodoPago =
  | "MERCADO_PAGO"
  | "TRANSFERENCIA"
  | "GO_CUOTAS"
  | "UALA"
  | "";

// Definimos un tipo para el tipo de entrega para reutilizarlo
export type DeliveredType = "HOME_DELIVERY" | "PICKUP";

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
  deliveredType: DeliveredType;
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
  subtotal: number;
  descuento: number;
  totalFinal: number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

const CHECKOUT_STORAGE_KEY = "moonlight_checkout_form";

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const { subtotal, descuentoTotal, total } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    // Intentar recuperar de localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as CheckoutFormData;
        } catch (error) {
          console.error("Error parsing checkout data", error);
        }
      }
    }

    // Validación de tipo para DeliveredType desde la URL
    const rawType = searchParams.get("shippingType");
    const validDeliveredType: DeliveredType =
      rawType === "HOME_DELIVERY" || rawType === "PICKUP" ? rawType : "PICKUP";

    return {
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
      metodoEnvio: searchParams.get("shippingName") || "A convenir",
      costoEnvio: Number(searchParams.get("shippingCost")) || 0,
      deliveredType: validDeliveredType,
      metodoPago: "",
    };
  });

  const [step, setStep] = useState(1);

  useEffect(() => {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

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
        subtotal: subtotal ?? 0,
        descuento: descuentoTotal ?? 0,
        totalFinal: total ?? 0,
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
