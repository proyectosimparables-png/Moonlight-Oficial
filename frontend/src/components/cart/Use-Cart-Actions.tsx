"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/Cart-Context";
import { useAuth } from "@/hooks/useAuth";

export function useCartActions() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ✅ Extraemos los nombres REALES del Context (descuentoTotal y total)
  const {
    cart,
    subtotal,
    descuentoTotal, // Antes era 'descuento'
    total, // Antes era 'totalFinal'
    removeItem,
    updateItemQuantity,
    clearCart,
    loading,
  } = useCart();

  // Estados locales para la UI
  const [processingItems, setProcessingItems] = useState<
    Record<string, boolean>
  >({});
  const [initialCartLoaded, setInitialCartLoaded] = useState(false);
  const [modalDeleteId, setModalDeleteId] = useState<string | null>(null);
  const [modalClearOpen, setModalClearOpen] = useState(false);
  const [postalCode, setPostalCode] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    nombre: "A convenir",
    costo: 0,
    type: null as "HOME_DELIVERY" | "PICKUP" | null,
  });

  useEffect(() => {
    if (!loading) setInitialCartLoaded(true);
  }, [loading]);

  // --- ACCIONES ---

  const increment = async (id: string) => {
    if (processingItems[id]) return;
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    setProcessingItems((prev) => ({ ...prev, [id]: true }));
    try {
      await updateItemQuantity(id, item.quantity + 1);
    } catch {
      toast.error("Error al actualizar la cantidad");
    } finally {
      setProcessingItems((prev) => ({ ...prev, [id]: false }));
    }
  };

  const decrement = async (id: string) => {
    if (processingItems[id]) return;
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity <= 1) {
      setModalDeleteId(id);
      return;
    }

    setProcessingItems((prev) => ({ ...prev, [id]: true }));
    try {
      await updateItemQuantity(id, item.quantity - 1);
    } catch {
      toast.error("Error al actualizar el producto");
    } finally {
      setProcessingItems((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Inicia sesión para continuar");
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("No tienes productos en el carrito");
      return;
    }

    // ✅ BLINDAJE ACTUALIZADO:
    const safeSubtotal = subtotal ?? 0;
    const safeDiscount = descuentoTotal ?? 0; // Usamos el nombre nuevo
    const safeTotal = total ?? 0; // Usamos el nombre nuevo
    const safeShippingCost = shippingInfo.costo ?? 0;

    const params = new URLSearchParams({
      subtotal: safeSubtotal.toString(),
      shippingCost: safeShippingCost.toString(),
      shippingName: shippingInfo.nombre || "A convenir",
      shippingType: shippingInfo.type || "",
      discount: safeDiscount.toString(),
      finalPrice: safeTotal.toString(),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return {
    state: {
      cart: cart || [],
      loading,
      initialCartLoaded,
      processingItems,
      postalCode,
      modalDeleteId,
      modalClearOpen,
      // ✅ Retornamos con los nombres que espera tu UI de Carrito
      subtotal: subtotal ?? 0,
      descuento: descuentoTotal ?? 0,
      totalPrice: total ?? 0,
      shippingInfo,
    },
    actions: {
      increment,
      decrement,
      setPostalCode,
      setModalDeleteId,
      setModalClearOpen,
      setShippingInfo: (
        nombre: string,
        costo: number,
        type: "HOME_DELIVERY" | "PICKUP",
      ) => setShippingInfo({ nombre, costo, type }),
      handleCheckout,
      removeItem,
      clearCart,
      router,
    },
  };
}
