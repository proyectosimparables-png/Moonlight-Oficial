//frontend/src/components/cart/CartContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Navbar from "@/components/navbar/Navbar";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { AddedToCartModal } from "./AddedToCartModal";

/* ----------------------------------------------------
   MODAL MODERNO — integrado en este mismo archivo
------------------------------------------------------*/
function ModalConfirm({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-scale-in">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------*/
export default function CartContent() {
  const {
    cart,
    removeItem,
    updateItemQuantity,
    clearCart,
    loading,
    lastAddedItem,
    closeLastAddedModal,
  } = useCart();
  const router = useRouter();

  const [processingItems, setProcessingItems] = useState<
    Record<string, boolean>
  >({});
  const [postalCode, setPostalCode] = useState("");
  const [initialCartLoaded, setInitialCartLoaded] = useState(false);

  const [modalDeleteId, setModalDeleteId] = useState<string | null>(null);
  const [modalClearOpen, setModalClearOpen] = useState(false);

  useEffect(() => {
    if (!loading) setInitialCartLoaded(true);
  }, [loading]);

  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => {
        closeLastAddedModal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, closeLastAddedModal]);

  const setProcessing = (id: string, value: boolean) => {
    setProcessingItems((prev) => ({ ...prev, [id]: value }));
  };

  const requireAuth = async (action: () => Promise<void>) => {
    await action();
  };

  const increment = async (id: string) => {
    await requireAuth(async () => {
      setProcessing(id, true);
      try {
        const currentQty = cart.find((i) => i.id === id)?.quantity ?? 0;
        await updateItemQuantity(id, currentQty + 1);
        toast.success("Cantidad actualizada", { position: "top-center" });
      } catch {
        toast.error("No se pudo actualizar la cantidad", {
          position: "top-center",
        });
      } finally {
        setProcessing(id, false);
      }
    });
  };

  const decrement = async (id: string) => {
    await requireAuth(async () => {
      const item = cart.find((i) => i.id === id);
      if (!item) return;

      setProcessing(id, true);
      try {
        if (item.quantity <= 1) {
          setModalDeleteId(id);
        } else {
          await updateItemQuantity(id, item.quantity - 1);
          toast.success("Cantidad actualizada", { position: "top-center" });
        }
      } catch {
        toast.error("No se pudo actualizar la cantidad", {
          position: "top-center",
        });
      } finally {
        setProcessing(id, false);
      }
    });
  };

  const handleRemoveRequest = (id: string) => {
    setModalDeleteId(id);
  };

  const confirmRemove = async () => {
    if (!modalDeleteId) return;
    await removeItem(modalDeleteId);
    toast.success("Producto eliminado", { position: "top-center" });
    setModalDeleteId(null);
  };

  const openClearCartModal = () => {
    setModalClearOpen(true);
  };

  const confirmClearCart = async () => {
    await clearCart();
    toast.success("Carrito vacío", { position: "top-center" });
    setModalClearOpen(false);
  };

  const handleCheckout = async () => {
    await requireAuth(async () => {
      toast.success("Iniciando compra...", { position: "top-center" });
    });
  };

  if (loading && cart.length === 0 && !initialCartLoaded) {
    return (
      <>
        <Navbar />
        <p className="p-6 text-center text-gray-500 animate-pulse">
          Cargando tu carrito...
        </p>
      </>
    );
  }

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0
  );
  const shippingCost = postalCode ? 6836 : 0;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCEF] text-[#6c5b7b] relative">
      <Navbar />

      <div className="p-6 flex-1 max-w-4xl mx-auto">
        {/* Título con cruz al lado */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-1">
          <h2 className="text-2xl font-bold text-center flex-1">
            CARRITO DE COMPRAS
          </h2>

          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-800 text-3xl sm:text-4xl font-bold transition ml-4"
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500">
            No tienes productos en el carrito.
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  processing={processingItems[item.id] || false}
                  increment={increment}
                  decrement={decrement}
                  remove={handleRemoveRequest}
                />
              ))}
            </ul>

            <CartSummary
              totalPrice={totalPrice}
              finalTotal={finalTotal}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              handleCheckout={handleCheckout}
              router={router}
              openClearCartModal={openClearCartModal}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <ModalConfirm
        open={Boolean(modalDeleteId)}
        title="Eliminar producto"
        message="¿Seguro que deseas eliminar este producto del carrito?"
        confirmText="Eliminar"
        onConfirm={confirmRemove}
        onCancel={() => setModalDeleteId(null)}
      />

      <ModalConfirm
        open={modalClearOpen}
        title="Vaciar carrito"
        message="¿Seguro que deseas vaciar todo tu carrito?"
        confirmText="Vaciar"
        onConfirm={confirmClearCart}
        onCancel={() => setModalClearOpen(false)}
      />

      <AddedToCartModal />
    </div>
  );
}
