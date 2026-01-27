"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { AddedToCartModal } from "./AddedToCartModal";

/* ----------------------------------------------------
   MODAL CONFIRMACIÓN (Se mantiene igual)
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
  const { user, isAuthenticated } = useAuth();
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

  // Estados locales
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
      const timer = setTimeout(() => closeLastAddedModal(), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, closeLastAddedModal]);

  const setProcessing = (id: string, value: boolean) => {
    setProcessingItems((prev) => ({ ...prev, [id]: value }));
  };

  const increment = async (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    setProcessing(id, true);
    try {
      await updateItemQuantity(id, item.quantity + 1);
      toast.success("Cantidad actualizada");
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setProcessing(id, false);
    }
  };

  const decrement = async (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity <= 1) {
      setModalDeleteId(id);
      return;
    }
    setProcessing(id, true);
    try {
      await updateItemQuantity(id, item.quantity - 1);
      toast.success("Cantidad actualizada");
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setProcessing(id, false);
    }
  };

  const confirmRemove = async () => {
    if (!modalDeleteId) return;
    await removeItem(modalDeleteId);
    toast.success("Producto eliminado");
    setModalDeleteId(null);
  };

  const confirmClearCart = async () => {
    await clearCart();
    toast.success("Carrito vacío");
    setModalClearOpen(false);
  };

  /* --- LÓGICA DE REDIRECCIÓN AL CHECKOUT ACTUALIZADA --- */
  const handleCheckout = () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para comprar");
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    // Ya no creamos la orden aquí. Redirigimos al flujo de pasos.
    toast.success("Iniciando proceso de Compra...");
    router.push("/checkout"); // Asegúrate de que esta ruta renderice el CheckoutWizard
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.quantity,
    0,
  );

  // El costo de envío ahora se manejará en el Step 2 del CheckoutWizard
  const finalTotal = totalPrice;

  if (loading && cart.length === 0 && !initialCartLoaded) {
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse">
        Cargando carrito...
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCEF] text-[#6c5b7b] relative">
      <div className="p-6 flex-1 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-1">
          <h2 className="text-2xl font-bold text-center flex-1 uppercase">
            Carrito de compras
          </h2>
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold transition ml-4"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No tienes productos en el carrito.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-purple-600 font-semibold underline"
            >
              Ir a la tienda
            </button>
          </div>
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
                  remove={(id) => setModalDeleteId(id)}
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
              openClearCartModal={() => setModalClearOpen(true)}
              isLoading={false} // Ya no cargamos aquí porque es solo un redirect
            />
          </>
        )}
      </div>

      <ModalConfirm
        open={Boolean(modalDeleteId)}
        title="Eliminar producto"
        message="¿Seguro que deseas eliminar este producto?"
        confirmText="Eliminar"
        onConfirm={confirmRemove}
        onCancel={() => setModalDeleteId(null)}
      />

      <ModalConfirm
        open={modalClearOpen}
        title="Vaciar carrito"
        message="¿Seguro que deseas vaciar todo el carrito?"
        confirmText="Vaciar"
        onConfirm={confirmClearCart}
        onCancel={() => setModalClearOpen(false)}
      />

      <AddedToCartModal />
    </div>
  );
}
