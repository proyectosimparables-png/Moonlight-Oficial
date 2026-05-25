"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCheckout, MetodoPago } from "@/context/CheckoutContext";
import toast from "react-hot-toast";
import {
  createOrder,
  createMPPreference,
  createGoCuotasPayment,
  OrderPayload,
  OrderResponse,
} from "@/services/pagos-service";
import {
  ChevronRight,
  Mail,
  MessageSquare,
  Wallet,
  ExternalLink,
  Store,
  FileText,
  Loader2,
} from "lucide-react";

const Step2Pago: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { formData, updateFormData, prevStep, totalFinal } = useCheckout();

  const [loading, setLoading] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // --- ESTADOS PARA EL VIGILANTE (POLLING) ---
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- EFECTO DE VIGILANCIA ---
  useEffect(() => {
    if (isCheckingPayment && activeOrderId) {
      intervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/ordenes/${activeOrderId}`,
          );
          if (!response.ok) return;

          const orderData = await response.json();

          // Si el Webhook del backend ya procesó el pago...
          if (orderData.estado === "PAGADO") {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsCheckingPayment(false);

            toast.success("¡Pago confirmado con éxito!");
            await clearCart(); // Limpiamos el carrito local
            router.push(`/payment-success?orderId=${activeOrderId}`);
          }
        } catch (error) {
          console.error("Error vigilando pago:", error);
        }
      }, 3000); // Checkea cada 3 segundos
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCheckingPayment, activeOrderId, router, clearCart]);

  const handlePaymentSelect = (metodo: MetodoPago): void => {
    updateFormData({ metodoPago: metodo });
  };

  const finalizarCompra = async (): Promise<void> => {
    if (!user?.id) {
      toast.error("Debes iniciar sesión para finalizar la compra");
      return;
    }

    if (!formData.metodoPago) {
      toast.error("Por favor, selecciona un medio de pago");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Procesando tu pedido...");

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
        notasEntrega: formData.notasEntrega || "",
        cuponCodigo: formData.cuponCodigo || undefined,
        items: cart.map((item) => ({
          productoId: item.productoId,
          cantidad: item.quantity,
          precio: item.precioFinal / item.quantity,
        })),
      };

      const order: OrderResponse = await createOrder(orderPayload);
      setActiveOrderId(order.id);

      if (formData.metodoPago === "MERCADO_PAGO") {
        const payment = await createMPPreference(order.id);
        toast.success("Abriendo Mercado Pago...", { id: toastId });

        const mpWindow = window.open(
          payment.init_point,
          "_blank",
          "noopener,noreferrer",
        );

        if (!mpWindow) {
          toast.error("Ventana emergente bloqueada. Por favor, habilitala.");
        }
        setIsCheckingPayment(true);
      } else if (formData.metodoPago === "GO_CUOTAS") {
        const payment = await createGoCuotasPayment(order.id);
        toast.success("Abriendo GoCuotas...", { id: toastId });

        const goWindow = window.open(
          payment.url,
          "_blank",
          "noopener,noreferrer",
        );

        if (!goWindow) {
          toast.error("Ventana emergente bloqueada.");
        }
        setIsCheckingPayment(true);
      } else {
        toast.success("¡Pedido realizado con éxito!", { id: toastId });

        // Primero navegamos para que el usuario ya esté en la ruta nueva
        router.push(`/order-success/${order.id}`);

        // Y después limpiamos el carrito (sin el await para que no bloquee)
        clearCart();
      }
      // 2. Redirigimos a la nueva página que creamos en app/(cliente)/order-success/[id]
      // Usamos order.id porque es el ID real que devuelve tu backend
      console.log("Redirigiendo a ID:", order.id);
      router.push(`/order-success/${order.id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error inesperado";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val: number): string =>
    val.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });

  const mediosDePago = [
    {
      id: "TRANSFERENCIA" as MetodoPago,
      label: "Transferencia / Depósito",
      extra: `PAGÁS ${formatPrice(totalFinal * 0.9 + (formData.costoEnvio || 0))}`,
      icon: <Wallet className="w-5 h-5 text-[#A186ED]" />,
      badgeClass: "bg-green-100 text-green-700",
    },
    {
      id: "MERCADO_PAGO" as MetodoPago,
      label: "Mercado Pago",
      extra: "3 CUOTAS SIN INTERÉS",
      icon: <ExternalLink className="w-5 h-5 text-blue-500" />,
      badgeClass: "bg-blue-100 text-blue-700",
    },
    {
      id: "GO_CUOTAS" as MetodoPago,
      label: "Cuotas con Débito",
      extra: "4 CUOTAS SIN INTERÉS",
      icon: (
        <div className="text-[9px] font-black border-2 border-pink-500 text-pink-500 px-1 rounded leading-tight">
          GO
        </div>
      ),
      badgeClass: "bg-pink-100 text-pink-700",
    },
  ];

  return (
    <div className="w-full animate-in fade-in duration-500 text-[#4A4A4A] pb-10">
      {/* Resumen de Datos */}
      <div className="border border-gray-200 rounded-sm mb-8 bg-white divide-y divide-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Mail className="w-4 h-4 text-[#A186ED]" /> {formData.email}
          </div>
        </div>

        <div className="p-4 flex items-start justify-between">
          <div className="flex gap-4">
            <Store className="w-4 h-4 text-gray-400 mt-1" />
            <div className="text-sm">
              <p className="font-bold text-gray-700">{formData.metodoEnvio}</p>
              <p className="text-[#A186ED] font-semibold">
                {formData.costoEnvio === 0
                  ? "Gratis"
                  : formatPrice(formData.costoEnvio || 0)}
              </p>
            </div>
          </div>
          <button
            onClick={prevStep}
            className="text-[10px] font-black uppercase text-gray-400 hover:text-[#A186ED]"
          >
            Editar
          </button>
        </div>

        <div className="p-4 flex items-start justify-between">
          <div className="flex gap-4">
            <FileText className="w-4 h-4 text-gray-400 mt-1" />
            <div className="text-[13px] text-gray-500">
              <p className="font-bold text-gray-700 uppercase text-[9px] tracking-widest mb-1">
                Entrega en:
              </p>
              <p className="font-medium text-gray-800 capitalize">
                {formData.nombre} {formData.apellido}
              </p>
              <p>
                {formData.calle} {formData.numero} {formData.piso || ""}{" "}
                {formData.depto || ""}
              </p>
              <p>
                {formData.ciudad}, {formData.provincia}
              </p>
            </div>
          </div>
          <button
            onClick={prevStep}
            className="text-[10px] font-black uppercase text-gray-400 hover:text-[#A186ED]"
          >
            Editar
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-4 w-full text-left"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-[13px] text-gray-500 font-medium">
              {formData.notasEntrega
                ? "Ver aclaraciones"
                : "Agregar nota al pedido"}
            </span>
          </button>
          {showNotes && (
            <textarea
              className="w-full mt-3 p-3 border border-gray-100 text-sm focus:outline-none focus:border-[#A186ED] bg-gray-50 rounded-sm resize-none"
              placeholder="¿Algo para el repartidor?"
              value={formData.notasEntrega || ""}
              onChange={(e) => updateFormData({ notasEntrega: e.target.value })}
              rows={3}
            />
          )}
        </div>
      </div>

      {isCheckingPayment ? (
        <div className="bg-purple-50 border border-[#A186ED] rounded-sm p-8 text-center mb-10 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-[#A186ED] mx-auto mb-4" />
          <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">
            Esperando Pago...
          </h4>
          <p className="text-[13px] text-gray-500 mt-2">
            Completá la operación en la ventana emergente.
            <br />
            Esta pantalla se actualizará automáticamente al terminar.
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-[11px] font-bold mb-4 uppercase tracking-[0.2em] text-gray-400">
            Seleccioná un medio de pago
          </h3>
          <div className="space-y-3 mb-10">
            {mediosDePago.map((medio) => {
              const active = formData.metodoPago === medio.id;
              return (
                <div
                  key={medio.id}
                  onClick={() => handlePaymentSelect(medio.id)}
                  className={`p-5 cursor-pointer border rounded-sm transition-all flex items-center justify-between ${
                    active
                      ? "border-[#A186ED] bg-purple-50/40"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? "border-[#A186ED]" : "border-gray-300"}`}
                    >
                      {active && (
                        <div className="w-2 h-2 bg-[#A186ED] rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {medio.icon}
                        <span className="text-sm font-bold text-gray-700">
                          {medio.label}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${medio.badgeClass}`}
                      >
                        {medio.extra}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${active ? "text-[#A186ED]" : "text-gray-200"}`}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      <button
        onClick={finalizarCompra}
        disabled={loading || isCheckingPayment || !formData.metodoPago}
        className="w-full bg-[#A186ED] text-white py-6 rounded-sm font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#8e72e0] transition-all disabled:bg-gray-200 shadow-xl active:scale-[0.98] flex justify-center items-center gap-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
          </>
        ) : isCheckingPayment ? (
          "Esperando Confirmación..."
        ) : (
          "Finalizar Compra"
        )}
      </button>
    </div>
  );
};

export default Step2Pago;
