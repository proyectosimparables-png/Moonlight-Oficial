"use client";

import { CartService } from "@/services/cartService";
import { useAuth } from "@/hooks/useAuth";
import React, { createContext, useContext, useEffect, useState } from "react";

// Tipos
export interface CartItem {
  id: string;
  productoId: string;
  quantity: number;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl?: string;
    loading?: boolean; // Flag para item temporal
  };
}

export interface CartResponse {
  items: CartItem[];
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addItem: (productoId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  lastAddedItem: CartItem | null;
  closeLastAddedModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null); // Nuevo

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartData = await CartService.getCart();
      setCart(cartData?.items ?? []);
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  // 🔹 Optimistic UI helper
  const optimisticUpdate = async (
    updateFn: () => void,
    apiCall: () => Promise<CartResponse>,
    rollbackFn?: () => void
  ) => {
    try {
      updateFn(); // actualizar localmente
      await apiCall(); // enviar al backend
    } catch (err) {
      console.error(err);
      rollbackFn?.(); // revertir si falla
    }
  };

  const addItem = async (productoId: string, quantity = 1) => {
    const existingItem = cart.find((i) => i.productoId === productoId);

    if (existingItem) {
      // Actualizar cantidad optimista
      await optimisticUpdate(
        () =>
          setCart((prev) =>
            prev.map((i) =>
              i.productoId === productoId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          ),
        async () => {
          const response = await CartService.addItem(productoId, quantity);
          const updatedItem =
            response.items.find((it) => it.productoId === productoId) ??
            existingItem;

          setCart((prev) =>
            prev.map((i) => (i.productoId === productoId ? updatedItem : i))
          );

          setLastAddedItem(updatedItem); // Guardamos para el modal
          return response;
        },
        () =>
          setCart((prev) =>
            prev.map((i) =>
              i.productoId === productoId ? { ...i, quantity: i.quantity } : i
            )
          )
      );
    } else {
      const tempId = `temp-${productoId}-${Date.now()}`;
      const tempItem: CartItem = {
        id: tempId,
        productoId,
        quantity,
        producto: { id: productoId, nombre: "", precio: 0, loading: true },
      };

      await optimisticUpdate(
        () => setCart((prev) => [...prev, tempItem]),
        async () => {
          const response = await CartService.addItem(productoId, quantity);
          const addedItem =
            response.items.find((it) => it.productoId === productoId) ??
            tempItem;

          setCart((prev) => prev.map((i) => (i.id === tempId ? addedItem : i)));

          setLastAddedItem(addedItem); // Guardamos para el modal
          return response;
        },
        () => setCart((prev) => prev.filter((i) => i.id !== tempId))
      );
    }
  };

  const removeItem = async (itemId: string) => {
    const prevCart = [...cart];
    await optimisticUpdate(
      () => setCart((prev) => prev.filter((i) => i.id !== itemId)),
      async () => {
        await CartService.removeItem(itemId);
        return { items: [] };
      },
      () => setCart(prevCart)
    );
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    const prevCart = [...cart];

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    await optimisticUpdate(
      () =>
        setCart((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        ),
      async () => {
        await CartService.updateItemQuantity(itemId, quantity);
        return { items: [] };
      },
      () => setCart(prevCart)
    );
  };

  const clearCart = async () => {
    const prevCart = [...cart];
    await optimisticUpdate(
      () => setCart([]),
      async () => {
        await CartService.clearCart();
        return { items: [] };
      },
      () => setCart(prevCart)
    );
  };

  const closeLastAddedModal = () => setLastAddedItem(null); // Nuevo

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        refreshCart,
        setCart,
        lastAddedItem,
        closeLastAddedModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
