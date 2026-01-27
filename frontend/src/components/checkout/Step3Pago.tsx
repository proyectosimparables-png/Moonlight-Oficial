"use client";

import React, { useState } from "react";
import { CheckoutFormData } from "./CheckoutWizard";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface Step3Props {
  formData: CheckoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  prevStep: () => void;
}

// Definimos las interfaces para evitar el uso de 'any'
interface OrderResponse {
  id: string;
  total: number;
  estado: string;
}

interface PreferenceResponse {
  id: string;
  init_point: string;
}

interface BackendError {
  message: string | string[];
}

const Step3Pago: React.FC<Step3Props> = ({
  formData,
  setFormData,
  prevStep,
}) => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePaymentSelect = (
    metodo: "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO",
  ) => {
    setFormData((prev) => ({ ...prev, metodoPago: metodo }));
  };

  const finalizarCompra = async () => {
    if (!user?.id) return toast.error("Debes iniciar sesión");

    setLoading(true);
    const toastId = toast.loading("Procesando pedido...");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      // 1. CREAR LA ORDEN
      const response = await fetch(`${API_URL}/ordenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          emailContacto: formData.email,
          nombreDestinatario: formData.nombre,
          apellidoDestinatario: formData.apellido,
          dniDestinatario: formData.dni,
          telefonoDestinatario: formData.telefono,
          metodoEnvio: formData.metodoEnvio,
          costoEnvio: Number(formData.costoEnvio),
          codigoPostal: formData.codigoPostal,
          provincia: formData.provincia,
          localidad: formData.ciudad,
          calle: formData.calle,
          numero: formData.numero,
          piso: formData.piso || "",
          departamento: formData.depto || "",
          metodoPago: formData.metodoPago,
          // Mapeo de items para el backend si es necesario
          items: cart.map((item) => ({
            productoId: item.productoId,
            cantidad: item.quantity,
            precio: item.producto.precio,
          })),
        }),
      });

      if (!response.ok) {
        const errorData: BackendError = await response.json();
        throw new Error(
          Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || "Error al crear la orden",
        );
      }

      const order: OrderResponse = await response.json();

      // 2. CREAR PREFERENCIA DE MERCADO PAGO
      if (formData.metodoPago === "MERCADO_PAGO") {
        const paymentRes = await fetch(
          `${API_URL}/payments/create-preference/${order.id}`,
          {
            method: "POST",
          },
        );

        if (!paymentRes.ok) {
          // ESTO ES CLAVE: Vamos a ver qué dice el BACKEND realmente
          const errorDetalle = await paymentRes.json();
          console.error("ERROR REAL DEL BACKEND:", errorDetalle);

          // Aquí es donde hoy sale tu mensaje genérico, vamos a cambiarlo:
          throw new Error(errorDetalle.message || "Fallo en Mercado Pago");
        }

        const payment: PreferenceResponse = await paymentRes.json();
        window.location.href = payment.init_point;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage, { id: toastId });
      console.error("Error detallado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-semibold mb-6 uppercase text-gray-700 tracking-wider">
        Medio de Pago
      </h3>

      <div className="space-y-4 mb-8">
        {(["MERCADO_PAGO", "TRANSFERENCIA"] as const).map((metodo) => (
          <label
            key={metodo}
            className={`flex items-center justify-between p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
              formData.metodoPago === metodo
                ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600"
                : "border-gray-200 hover:border-purple-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="paymentMethod"
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                checked={formData.metodoPago === metodo}
                onChange={() => handlePaymentSelect(metodo)}
              />
              <span className="font-semibold text-gray-800">
                {metodo === "MERCADO_PAGO"
                  ? "Mercado Pago"
                  : "Transferencia Bancaria (10% OFF)"}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          className="w-1/3 border-2 border-gray-200 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase text-sm"
        >
          Volver
        </button>
        <button
          onClick={finalizarCompra}
          disabled={loading || !formData.metodoPago}
          className="w-2/3 bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:shadow-none transition-all uppercase text-sm"
        >
          {loading ? "Procesando..." : "Finalizar Compra"}
        </button>
      </div>
    </div>
  );
};

export default Step3Pago;
