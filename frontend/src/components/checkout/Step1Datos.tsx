"use client";

import React from "react";
import { CheckoutFormData } from "./CheckoutWizard";

interface Step1Props {
  formData: CheckoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  nextStep: () => void;
}

const Step1Datos: React.FC<Step1Props> = ({
  formData,
  setFormData,
  nextStep,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CheckoutFormData) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-semibold mb-4 uppercase text-gray-700">
        Datos de Contacto
      </h3>
      <input
        type="email"
        name="email"
        placeholder="E-mail"
        className="w-full p-3 border border-gray-300 rounded mb-6 outline-purple-500"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <h3 className="text-lg font-semibold mb-4 uppercase text-gray-700">
        Datos del Destinatario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.apellido}
          onChange={handleChange}
          required
        />
      </div>

      <input
        type="text"
        name="telefono"
        placeholder="Teléfono"
        className="w-full p-3 border border-gray-300 rounded mb-4 outline-purple-500"
        value={formData.telefono}
        onChange={handleChange}
        required
      />

      <h3 className="text-lg font-semibold mb-4 uppercase text-gray-700">
        Entrega
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="codigoPostal"
          placeholder="Código Postal"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.codigoPostal}
          onChange={handleChange}
          required
        />

        {/* --- CAMPO AGREGADO: PROVINCIA --- */}
        <input
          type="text"
          name="provincia"
          placeholder="Provincia"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.provincia}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="calle"
          placeholder="Calle"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.calle}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="numero"
            placeholder="Número"
            className="w-full p-3 border border-gray-300 rounded outline-purple-500"
            value={formData.numero}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="piso"
            placeholder="Piso (Opcional)"
            className="w-full p-3 border border-gray-300 rounded outline-purple-500"
            value={formData.piso}
            onChange={handleChange}
          />
          <input
            type="text"
            name="depto"
            placeholder="Depto (Opcional)"
            className="w-full p-3 border border-gray-300 rounded outline-purple-500"
            value={formData.depto}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          name="ciudad"
          placeholder="Localidad / Ciudad"
          className="w-full p-3 border border-gray-300 rounded outline-purple-500"
          value={formData.ciudad}
          onChange={handleChange}
          required
        />
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-4 uppercase text-gray-700">
        Facturación
      </h3>
      <input
        type="text"
        name="dni"
        placeholder="DNI o CUIT"
        className="w-full p-3 border border-gray-300 rounded mb-8 outline-purple-500"
        value={formData.dni}
        onChange={handleChange}
        required
      />

      <button
        onClick={nextStep}
        className="w-full bg-purple-600 text-white font-bold py-4 rounded-md hover:bg-purple-700 transition-colors uppercase shadow-md"
      >
        Continuar
      </button>
    </div>
  );
};

export default Step1Datos;
