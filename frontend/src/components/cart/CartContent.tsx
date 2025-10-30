"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Navbar from "@/components/navbar/Navbar";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

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

  useEffect(() => {
    if (!loading) setInitialCartLoaded(true);
  }, [loading]);

  // Auto-cerrar modal después de 3 segundos
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
    await action(); // Ya protegido por ProtectedRoute
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
          await removeItem(id);
          toast.success("Producto eliminado", { position: "top-center" });
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

  const handleRemove = async (id: string) => {
    await requireAuth(async () => {
      setProcessing(id, true);
      try {
        await removeItem(id);
        toast.success("Producto eliminado", { position: "top-center" });
      } catch {
        toast.error("No se pudo eliminar el producto", {
          position: "top-center",
        });
      } finally {
        setProcessing(id, false);
      }
    });
  };

  const handleClearCart = async () => {
    await requireAuth(async () => {
      if (!confirm("¿Seguro que deseas vaciar el carrito?")) return;
      try {
        await clearCart();
        toast.success("Carrito vacío", { position: "top-center" });
      } catch {
        toast.error("No se pudo vaciar el carrito", { position: "top-center" });
      }
    });
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tu carrito</h2>
          {cart.length > 0 && (
            <button
              className="border px-3 py-1 rounded hover:bg-gray-200"
              onClick={handleClearCart}
            >
              Vaciar carrito
            </button>
          )}
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
                  remove={handleRemove}
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
            />
          </>
        )}
      </div>

      {/* Modal de producto agregado */}
      {lastAddedItem && (
        <div className="fixed bottom-5 right-5 bg-white shadow-lg border rounded p-4 flex items-center space-x-4 animate-fade-in">
          <img
            src={lastAddedItem.producto.imagenUrl || "/placeholder.png"}
            alt={lastAddedItem.producto.nombre}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <p className="font-semibold">{lastAddedItem.producto.nombre}</p>
            <p className="text-sm text-gray-500">
              Se agregó al carrito ({lastAddedItem.quantity})
            </p>
          </div>
          <button
            className="ml-auto text-gray-400 hover:text-gray-600"
            onClick={closeLastAddedModal}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
