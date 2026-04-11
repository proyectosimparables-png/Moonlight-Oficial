"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import { Info } from "lucide-react"; // Opcional para un iconito de ayuda

const Step1Datos: React.FC = () => {
  const { user } = useAuth();
  const { formData, updateFormData, nextStep, isStep1Valid } = useCheckout();

  useEffect(() => {
    if (user) {
      updateFormData({
        // Si el usuario ya escribió algo, lo respetamos, sino usamos lo de la cuenta
        email: formData.email || user.email || "",
        nombre: formData.nombre || user.name?.split(" ")[0] || "",
        apellido:
          formData.apellido || user.name?.split(" ").slice(1).join(" ") || "",
        calle: formData.calle || user.address || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const inputStyle =
    "w-full p-4 border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:border-[#A186ED] focus:ring-1 focus:ring-[#A186ED] transition-all placeholder-gray-300 rounded-sm";
  const sectionTitleStyle =
    "text-[11px] font-bold mb-4 uppercase text-gray-400 tracking-[0.2em]";

  return (
    <div className="space-y-10 font-sans animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Sección: Contacto e Identificación */}
      <section>
        <h3 className={sectionTitleStyle}>1. Identificación</h3>
        <div className="p-4 border border-[#A186ED]/20 bg-[#A186ED]/5 rounded-sm">
          <p className="text-[10px] text-[#A186ED] uppercase font-bold mb-1 tracking-wider">
            E-mail para confirmación
          </p>
          <p className="text-sm font-medium text-gray-700">
            {formData.email || user?.email || "Invitado"}
          </p>
        </div>
      </section>

      {/* Sección: Medio de Envío */}
      <section>
        <h3 className={sectionTitleStyle}>2. Método de Envío</h3>
        <ShippingSelector />
      </section>

      {/* Sección: Entrega */}
      <section className="space-y-4">
        <h3 className={sectionTitleStyle}>3. Datos de Entrega</h3>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="dni"
            placeholder="DNI / CUIL (para factura)"
            className={inputStyle}
            value={formData.dni}
            onChange={handleChange}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono (WhatsApp)"
            className={inputStyle}
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              name="calle"
              placeholder="Dirección / Calle"
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

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="codigoPostal"
            placeholder="C.P."
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
          {/* ... resto de provincias ... */}
        </select>
      </section>

      {/* Botón de Acción con validación visual */}
      <div className="pt-4">
        {!isStep1Valid && (
          <p className="text-[10px] text-gray-400 text-center mb-4 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Completa todos los campos para
            continuar
          </p>
        )}
        <button
          onClick={nextStep}
          disabled={!isStep1Valid}
          className="w-full bg-[#A186ED] text-white font-bold py-5 rounded-sm text-xs uppercase tracking-[0.3em] hover:bg-[#8e72e0] active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
        >
          Continuar al pago
        </button>
      </div>
    </div>
  );
};

export default Step1Datos;
