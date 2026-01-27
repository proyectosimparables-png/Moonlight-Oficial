"use client";

import React from "react";
import { CheckoutFormData } from "./CheckoutWizard";

interface Step2Props {
  formData: CheckoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  nextStep: () => void;
  prevStep: () => void;
}

const Step2Envio: React.FC<Step2Props> = ({
  formData,
  setFormData,
  nextStep,
  prevStep,
}) => {
  const opcionesEnvio = [
    {
      id: "ca-clasico",
      nombre: "Correo Argentino Clásico a domicilio",
      costo: 7254,
    },
    {
      id: "ca-expreso",
      nombre: "Correo Argentino Expreso a domicilio",
      costo: 7981,
    },
    {
      id: "retiro-ituzaingo",
      nombre: "Retiro por Moonlight - Villa Udaondo, Ituzaingó",
      costo: 0,
    },
    {
      id: "retiro-moron",
      nombre: "Retiro por Moonlight Point Morón",
      costo: 1000,
    },
  ];

  const handleSelect = (nombre: string, costo: number) => {
    setFormData((prev) => ({
      ...prev,
      metodoEnvio: nombre,
      costoEnvio: costo,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-semibold mb-2 uppercase text-gray-700">
        Entrega
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Seleccioná cómo querés recibir tu pedido:
      </p>

      <div className="space-y-4 mb-8">
        {opcionesEnvio.map((opcion) => (
          <label
            key={opcion.id}
            className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all ${
              formData.metodoEnvio === opcion.nombre
                ? "border-purple-500 bg-purple-50 shadow-sm"
                : "border-gray-300 hover:border-purple-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="envio"
                checked={formData.metodoEnvio === opcion.nombre}
                onChange={() => handleSelect(opcion.nombre, opcion.costo)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-gray-700 font-medium">{opcion.nombre}</span>
            </div>
            <span className="font-bold text-gray-900">
              {opcion.costo === 0
                ? "Gratis"
                : `$${opcion.costo.toLocaleString("es-AR")}`}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          className="w-1/3 border border-gray-300 text-gray-600 font-bold py-4 rounded-md hover:bg-gray-50 uppercase transition-all"
        >
          Volver
        </button>
        <button
          onClick={nextStep}
          disabled={!formData.metodoEnvio}
          className={`w-2/3 text-white font-bold py-4 rounded-md transition-all uppercase shadow-md ${
            formData.metodoEnvio
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Continuar para el pago
        </button>
      </div>
    </div>
  );
};

export default Step2Envio;
