"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import ShippingSelector from "@/components/checkout/ShippingSelector";

const Step1Datos: React.FC = () => {
  const { user } = useAuth();
  const { formData, updateFormData, nextStep, isStep1Valid } = useCheckout();

  useEffect(() => {
    // Autocompletado inteligente desde el perfil del usuario
    if (user) {
      updateFormData({
        email: formData.email || user.email || "",
        nombre: formData.nombre || user.name?.split(" ")[0] || "",
        apellido:
          formData.apellido || user.name?.split(" ").slice(1).join(" ") || "",
        calle: formData.calle || user.address || "",
      });
    }
  }, [user]); // Solo se ejecuta cuando el usuario carga o cambia

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // Estilos reutilizables para mantener el JSX limpio
  const inputStyle =
    "w-full p-3 border border-gray-300 bg-[#F9F9F9] text-sm text-gray-600 focus:outline-none focus:border-[#A186ED] transition-colors placeholder-gray-400";
  const sectionTitleStyle =
    "text-[13px] font-bold mb-4 uppercase text-[#4A4A4A] tracking-tight";

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-500 bg-[#FAFCEF] p-6">
      {/* Sección: Contacto */}
      <section>
        <h3 className={sectionTitleStyle}>Datos de Contacto</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 border border-gray-200 bg-gray-50 rounded-sm">
            <p className="text-[11px] text-gray-400 uppercase font-bold">
              E-mail de la cuenta
            </p>
            <p className="text-sm text-gray-600">
              {formData.email || user?.email || "Sin email registrado"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className={sectionTitleStyle}>Medio de Envío</h3>
          <ShippingSelector />
        </div>
      </section>

      {/* Sección: Entrega */}
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
            placeholder="Localidad"
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
          <option value="Catamarca">Catamarca</option>
          <option value="Chaco">Chaco</option>
          <option value="Chubut">Chubut</option>
          <option value="Córdoba">Córdoba</option>
          <option value="Corrientes">Corrientes</option>
          <option value="Entre Ríos">Entre Ríos</option>
          <option value="Formosa">Formosa</option>
          <option value="Jujuy">Jujuy</option>
          <option value="La Pampa">La Pampa</option>
          <option value="La Rioja">La Rioja</option>
          <option value="Mendoza">Mendoza</option>
          <option value="Misiones">Misiones</option>
          <option value="Neuquén">Neuquén</option>
          <option value="Río Negro">Río Negro</option>
          <option value="Salta">Salta</option>
          <option value="San Juan">San Juan</option>
          <option value="San Luis">San Luis</option>
          <option value="Santa Cruz">Santa Cruz</option>
          <option value="Santa Fe">Santa Fe</option>
          <option value="Santiago del Estero">Santiago del Estero</option>
          <option value="Tierra del Fuego">Tierra del Fuego</option>
          <option value="Tucumán">Tucumán</option>
        </select>
      </section>

      {/* Botón de Acción */}
      <button
        onClick={nextStep}
        disabled={!isStep1Valid}
        className="w-full bg-[#A186ED] text-white font-bold py-5 rounded-sm text-sm uppercase tracking-[0.2em] hover:bg-[#8e72e0] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        Continuar al pago
      </button>
    </div>
  );
};

export default Step1Datos;
