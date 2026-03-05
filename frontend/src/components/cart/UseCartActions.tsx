"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";

export function useCartActions() {
  const { user, isAuthenticated } = useAuth();
  const { cart, removeItem, updateItemQuantity, clearCart, loading } =
    useCart();
  const router = useRouter();

  const [processingItems, setProcessingItems] = useState<
    Record<string, boolean>
  >({});
  const [postalCode, setPostalCode] = useState("");
  const [initialCartLoaded, setInitialCartLoaded] = useState(false);
  const [modalDeleteId, setModalDeleteId] = useState<string | null>(null);
  const [modalClearOpen, setModalClearOpen] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    nombre: "A convenir",
    costo: 0,
    type: null as "HOME_DELIVERY" | "PICKUP" | null,
  });

  useEffect(() => {
    if (!loading) setInitialCartLoaded(true);
  }, [loading]);

  const increment = async (id: string) => {
    // PROTECCIÓN BACKEND: Si ya está procesando, no hacemos nada
    if (processingItems[id]) return;

    const item = cart.find((i) => i.id === id);
    if (!item) return;

    toast.dismiss();
    setProcessingItems((prev) => ({ ...prev, [id]: true }));
    try {
      await updateItemQuantity(id, item.quantity + 1);
    } catch {
      toast.error("Error de stock");
    } finally {
      setProcessingItems((prev) => ({ ...prev, [id]: false }));
    }
  };

  const decrement = async (id: string) => {
    // PROTECCIÓN BACKEND
    if (processingItems[id]) return;

    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity <= 1) {
      setModalDeleteId(id);
      return;
    }

    toast.dismiss();
    setProcessingItems((prev) => ({ ...prev, [id]: true }));
    try {
      await updateItemQuantity(id, item.quantity - 1);
    } catch {
      toast.error("Error al actualizar");
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
    if (cart.length === 0) return;

    const params = new URLSearchParams({
      shippingCost: shippingInfo.costo.toString(),
      shippingName: shippingInfo.nombre,
      shippingType: shippingInfo.type || "",
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0,
  );

  return {
    state: {
      cart,
      loading,
      initialCartLoaded,
      processingItems,
      postalCode,
      modalDeleteId,
      modalClearOpen,
      totalPrice,
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
