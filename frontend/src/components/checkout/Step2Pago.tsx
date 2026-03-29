"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCheckout, MetodoPago } from "@/context/CheckoutContext";
import toast from "react-hot-toast";
import {
  createOrder,
  createMPPreference,
  createGoCuotasPayment,
  OrderPayload,
} from "@/services/paymentService";
import {
  ChevronRight,
  Mail,
  MessageSquare,
  Wallet,
  ExternalLink,
  Store,
  FileText,
} from "lucide-react";

const Step2Pago: React.FC = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { formData, updateFormData, prevStep } = useCheckout();
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const subtotalProductos = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0,
  );

  const handlePaymentSelect = (metodo: MetodoPago) => {
    updateFormData({ metodoPago: metodo });
  };

  const finalizarCompra = async () => {
    if (!user?.id) return toast.error("Debes iniciar sesión");
    if (!formData.metodoPago) return toast.error("Seleccioná un medio de pago");

    setLoading(true);
    const toastId = toast.loading("Procesando pedido...");

    try {
      const orderPayload: OrderPayload = {
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
        piso: formData.piso || undefined,
        departamento: formData.depto || undefined,
        metodoPago: formData.metodoPago,
        notasEntrega: formData.notasEntrega,
        items: cart.map((item) => ({
          productoId: item.productoId,
          cantidad: item.quantity,
          precio: item.producto.precio,
        })),
      };

      // 1. Crear la orden en la base de datos
      const order = await createOrder(orderPayload);

      // 2. Procesar según el método de pago seleccionado
      if (formData.metodoPago === "MERCADO_PAGO") {
        const payment = await createMPPreference(order.id);
        toast.success("Redirigiendo a Mercado Pago...", { id: toastId });
        window.location.href = payment.init_point;
      } else if (formData.metodoPago === "GO_CUOTAS") {
        // 👈 Lógica de GoCuotas agregada
        const payment = await createGoCuotasPayment(order.id);
        toast.success("Redirigiendo a GoCuotas...", { id: toastId });
        window.location.href = payment.url;
      } else {
        // Caso Transferencia u otros manuales
        toast.success("¡Pedido realizado con éxito!", { id: toastId });
        await clearCart();
        // Aquí podrías redirigir a una página de éxito propia: router.push('/gracias')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al procesar el pedido";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const mediosDePago = [
    {
      id: "TRANSFERENCIA" as MetodoPago,
      label: "Transferencia Bancaria o Depósito",
      extra: `PAGÁS $${(subtotalProductos * 0.9 + formData.costoEnvio).toLocaleString("es-AR")}`,
      icon: <Wallet className="w-5 h-5 text-purple-500" />,
      extraColor: "bg-[#D9F99D]",
    },
    {
      id: "MERCADO_PAGO" as MetodoPago,
      label: "Mercado Pago",
      extra: "HASTA 3 CUOTAS SIN INTERÉS",
      icon: <ExternalLink className="w-5 h-5 text-blue-500" />,
    },
    {
      id: "GO_CUOTAS" as MetodoPago,
      label: "Cuotas con DÉBITO",
      extra: "HASTA 4 CUOTAS SIN INTERÉS",
      icon: (
        <div className="text-[10px] font-bold border border-pink-500 text-pink-500 px-1 rounded leading-none">
          GO
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-in fade-in duration-500 text-[#4A4A4A] font-sans pb-10">
      <div className="border border-gray-300 rounded-sm mb-8 bg-white overflow-hidden shadow-sm">
        {/* Email */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-200">
          <Mail className="w-5 h-5 text-gray-500 stroke-[1.5]" />
          <span className="text-[15px] text-gray-600">{formData.email}</span>
        </div>

        {/* Envío */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#fdfbf2]/30">
          <div className="flex items-center gap-4">
            <Store className="w-5 h-5 text-gray-500 stroke-[1.5]" />
            <span className="text-[15px] font-bold text-gray-700">
              {formData.metodoEnvio} ·{" "}
              {formData.costoEnvio === 0
                ? "Gratis"
                : `$${formData.costoEnvio.toLocaleString()}`}
            </span>
          </div>
          <button
            onClick={prevStep}
            className="text-[13px] text-gray-600 hover:underline font-medium"
          >
            Cambiar
          </button>
        </div>

        {/* Datos Facturación */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div className="flex gap-4">
            <FileText className="w-5 h-5 text-gray-500 stroke-[1.5] mt-0.5" />
            <div className="text-[14px] text-gray-500 leading-relaxed">
              <p className="font-bold text-gray-700 mb-1">
                Datos de facturación
              </p>
              <p className="capitalize">
                {formData.nombre} {formData.apellido}
              </p>
              <p>
                {formData.calle} {formData.numero} {formData.piso || ""}{" "}
                {formData.depto || ""}
              </p>
              <p>
                CP {formData.codigoPostal} - {formData.ciudad},{" "}
                {formData.provincia}
              </p>
              <p>{formData.telefono}</p>
            </div>
          </div>
          <button
            onClick={prevStep}
            className="text-[13px] text-gray-600 hover:underline font-medium"
          >
            Cambiar
          </button>
        </div>

        {/* Notas */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-5 h-5 text-gray-500 stroke-[1.5]" />
              <span className="text-[13px] font-bold uppercase tracking-wider text-gray-700">
                Aclaraciones
              </span>
            </div>
            {!showNotes && (
              <button
                onClick={() => setShowNotes(true)}
                className="text-[13px] text-gray-600 hover:underline font-medium"
              >
                {formData.notasEntrega ? "Editar" : "Agregar"}
              </button>
            )}
          </div>
          {showNotes && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea
                className="w-full p-4 border border-gray-200 text-[14px] focus:outline-none focus:border-gray-400 min-h-25 bg-[#fafafa] resize-none rounded-sm"
                placeholder="¿Algo que debamos saber?"
                autoFocus
                value={formData.notasEntrega}
                onChange={(e) =>
                  updateFormData({ notasEntrega: e.target.value })
                }
              />
              <button
                onClick={() => setShowNotes(false)}
                className="mt-2 text-[11px] text-gray-400 uppercase hover:text-gray-600 font-bold"
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-[12px] font-bold mb-4 uppercase tracking-[0.15em] text-gray-500">
        Medio de Pago
      </h3>
      <div className="border border-gray-300 rounded-sm bg-white overflow-hidden mb-8 shadow-sm">
        {mediosDePago.map((medio) => (
          <div
            key={medio.id}
            onClick={() => handlePaymentSelect(medio.id)}
            className={`flex items-center justify-between p-5 cursor-pointer border-b border-gray-200 last:border-b-0 transition-all ${
              formData.metodoPago === medio.id
                ? "bg-gray-50"
                : "hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.metodoPago === medio.id ? "border-black bg-black" : "border-gray-300"}`}
              >
                {formData.metodoPago === medio.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">{medio.icon}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[14px] text-gray-800 font-medium">
                    {medio.label}
                  </span>
                  {medio.extra && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${medio.extraColor || "bg-[#E5FFB3] text-black"}`}
                    >
                      {medio.extra}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>

      <button
        onClick={finalizarCompra}
        disabled={loading || !formData.metodoPago}
        className="w-full bg-[#A186ED] text-white py-5 rounded-sm font-bold text-sm uppercase tracking-[0.2em] hover:bg-[#8e72e0] transition-all disabled:bg-gray-300 shadow-md active:scale-[0.99]"
      >
        {loading ? "Procesando..." : "Realizar Pedido"}
      </button>
    </div>
  );
};

export default Step2Pago;
