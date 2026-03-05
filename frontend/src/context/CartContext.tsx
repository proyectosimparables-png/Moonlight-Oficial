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
  // ✅ Firma mejorada para recibir datos del producto y evitar el modal vacío
  addItem: (
    productoId: string,
    quantity?: number,
    productData?: { nombre: string; imagenUrl?: string },
  ) => Promise<void>;
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
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

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

  const optimisticUpdate = async (
    updateFn: () => void,
    apiCall: () => Promise<CartResponse>,
    rollbackFn?: () => void,
  ) => {
    try {
      updateFn();
      await apiCall();
    } catch (err) {
      console.error(err);
      rollbackFn?.();
    }
  };

  const addItem = async (
    productoId: string,
    quantity = 1,
    productData?: { nombre: string; imagenUrl?: string },
  ) => {
    console.log("Estado del carrito antes de agregar el producto:", cart);
    const existingItem = cart.find((i) => i.productoId === productoId);

    if (existingItem) {
      // 1️⃣ MOSTRAR EL MODAL INSTANTÁNEAMENTE
      setLastAddedItem({
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      });

      // 2️⃣ Actualización optimista
      const prevCart = [...cart];
      setCart((prev) =>
        prev.map((i) =>
          i.productoId === productoId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        ),
      );

      try {
        await CartService.addItem(productoId, quantity);
      } catch (err) {
        console.error(err);
        setCart(prevCart);
      }
    } else {
      // Item nuevo
      const tempId = `temp-${productoId}-${Date.now()}`;
      const tempItem: CartItem = {
        id: tempId,
        productoId,
        quantity,
        producto: {
          id: productoId,
          nombre: productData?.nombre || "Cargando...", // ✅ Usamos el nombre pasado por prop
          precio: 0,
          imagenUrl: productData?.imagenUrl, // ✅ Usamos la imagen pasada por prop
          loading: true,
        },
      };
      console.log(
        "Estado del carrito antes de agregar el producto temporal:",
        cart,
      );
      // 1️⃣ MOSTRAR MODAL INMEDIATAMENTE (Ya no estará vacío)
      setLastAddedItem(tempItem);

      // 2️⃣ Optimistic add instantáneo
      const prevCart = [...cart];
      setCart((prev) => [...prev, tempItem]);

      try {
        const response = await CartService.addItem(productoId, quantity);
        const addedItem =
          response.items.find((it) => it.productoId === productoId) ?? tempItem;

        setCart((prev) => prev.map((i) => (i.id === tempId ? addedItem : i)));
      } catch (err) {
        console.error(err);
        setCart(prevCart);
      }
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
      () => setCart(prevCart),
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
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        ),
      async () => {
        await CartService.updateItemQuantity(itemId, quantity);
        return { items: [] };
      },
      () => setCart(prevCart),
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
      () => setCart(prevCart),
    );
  };

  const closeLastAddedModal = () => setLastAddedItem(null);

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
