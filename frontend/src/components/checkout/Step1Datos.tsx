"use client";

import React, { useEffect } from "react";
import { CheckoutFormData } from "./CheckoutWizard";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();

  useEffect(() => {
    // Solo actualizamos si hay un usuario y si los campos están vacíos
    // para no pisar lo que el usuario escriba o lo que viene del cart
    if (user) {
      setFormData((prev) => ({
        ...prev, // MANTENEMOS TODO LO DEMÁS (incluyendo costoEnvio)
        email: prev.email || user.email || "",
        nombre: prev.nombre || user.name?.split(" ")[0] || "",
        apellido:
          prev.apellido || user.name?.split(" ").slice(1).join(" ") || "",
        calle: prev.calle || user.address || "",
      }));
    }
  }, [user, setFormData]); // IMPORTANTE: No pongas formData aquí porque se haría un loop

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputStyle =
    "w-full p-3 border border-gray-300 bg-[#F9F9F9] text-sm text-gray-600 focus:outline-none focus:border-[#A186ED] transition-colors placeholder-gray-400";
  const sectionTitleStyle =
    "text-[13px] font-bold mb-4 uppercase text-[#4A4A4A] tracking-tight";

  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.dni.length > 6 &&
    formData.telefono.trim() !== "" &&
    formData.calle.trim() !== "" &&
    formData.provincia !== "";

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-500">
      <section>
        <h3 className={sectionTitleStyle}>Datos de Contacto</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 border border-gray-200 bg-gray-50 rounded-sm">
            <p className="text-[11px] text-gray-400 uppercase font-bold">
              E-mail de la cuenta
            </p>
            <p className="text-sm text-gray-600">
              {formData.email || user?.email}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleStyle}>Datos para la Entrega</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            className={inputStyle}
            value={formData.nombre}
            onChange={handleChange}
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            className={inputStyle}
            value={formData.apellido}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="dni"
            placeholder="DNI / CUIL"
            className={inputStyle}
            value={formData.dni}
            onChange={handleChange}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className={inputStyle}
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <input
              type="text"
              name="calle"
              placeholder="Calle / Dirección"
              className={inputStyle}
              value={formData.calle}
              onChange={handleChange}
            />
          </div>
          <input
            type="text"
            name="numero"
            placeholder="Nro"
            className={inputStyle}
            value={formData.numero}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="codigoPostal"
            placeholder="Código Postal"
            className={inputStyle}
            value={formData.codigoPostal}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad / Localidad"
            className={inputStyle}
            value={formData.ciudad}
            onChange={handleChange}
          />
        </div>

        <select
          name="provincia"
          className={inputStyle}
          value={formData.provincia}
          onChange={handleChange}
        >
          <option value="">Seleccionar Provincia</option>
          <option value="Buenos Aires">Buenos Aires</option>
          <option value="CABA">CABA</option>
          <option value="Córdoba">Córdoba</option>
          <option value="Santa Fe">Santa Fe</option>
          <option value="Mendoza">Mendoza</option>
        </select>
      </section>

      <button
        onClick={nextStep}
        disabled={!isFormValid}
        className="w-full bg-[#A186ED] text-white font-bold py-5 rounded-sm text-sm uppercase tracking-[0.2em] hover:bg-[#8e72e0] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        Continuar al pago
      </button>
    </div>
  );
};

export default Step1Datos;
