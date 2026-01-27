"use client";

import React from "react";
import { CheckoutFormData } from "./CheckoutWizard";
import { useCart } from "@/context/CartContext"; // Importamos tu hook real

interface SummaryProps {
  formData: CheckoutFormData;
}

const OrderSummary: React.FC<SummaryProps> = ({ formData }) => {
  const { cart } = useCart(); // Obtenemos los productos reales del carrito

  const subtotal = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0,
  );

  const descuentoTransferencia =
    formData.metodoPago === "TRANSFERENCIA" ? subtotal * 0.1 : 0;

  const totalFinal = subtotal + formData.costoEnvio - descuentoTransferencia;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-4">
      <h3 className="text-lg font-bold mb-6 uppercase text-gray-700">
        Resumen de compra
      </h3>

      {/* Lista de Productos REALES */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                {item.producto.imagenUrl && (
                  <img
                    src={item.producto.imagenUrl}
                    alt={item.producto.nombre}
                    className="object-cover w-full h-full rounded"
                  />
                )}
              </div>
              <span className="text-gray-600">
                {item.producto.nombre}{" "}
                <b className="text-gray-400">x{item.quantity}</b>
              </span>
            </div>
            <span className="font-semibold text-gray-800">
              ${(item.producto.precio * item.quantity).toLocaleString("es-AR")}
            </span>
          </div>
        ))}
      </div>

      <hr className="mb-4 border-gray-300" />

      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-800 font-medium">
            ${subtotal.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">
            Envío ({formData.metodoEnvio || "No seleccionado"})
          </span>
          <span className="text-gray-800 font-medium">
            {formData.costoEnvio === 0
              ? "Gratis"
              : `$${formData.costoEnvio.toLocaleString("es-AR")}`}
          </span>
        </div>

        {formData.metodoPago === "TRANSFERENCIA" && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Descuento Transferencia (10%)</span>
            <span>-${descuentoTransferencia.toLocaleString("es-AR")}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4">
        <span>Total</span>
        <span>${totalFinal.toLocaleString("es-AR")}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
