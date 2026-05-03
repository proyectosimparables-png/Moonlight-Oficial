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

export type DeliveredType = "HOME_DELIVERY" | "PICKUP";

// Definimos la interfaz para el cupón
export interface CuponAplicado {
  id: string;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: number;
}

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
  cuponCodigo?: string; // 👈 Agregamos esto para mandarlo luego al backend
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
  // --- NUEVOS CAMPOS PARA EL CUPÓN ---
  cuponAplicado: CuponAplicado | null;
  setCuponAplicado: (cupon: CuponAplicado | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

const CHECKOUT_STORAGE_KEY = "moonlight_checkout_form";

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const { subtotal, descuentoTotal, total } = useCart();

  // Estado para el cupón aplicado
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(
    null,
  );

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
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
      cuponCodigo: "",
    };
  });

  // Sincronizar el código del cupón en formData cuando se aplica uno
  useEffect(() => {
    updateFormData({ cuponCodigo: cuponAplicado?.codigo || "" });
  }, [cuponAplicado]);

  useEffect(() => {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const [step, setStep] = useState(1);

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
        // Exponemos el cupón
        cuponAplicado,
        setCuponAplicado,
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
