"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback, // ✅ Importado para corregir el warning de dependencias
  ReactNode,
} from "react";
import { CartService } from "@/services/cartService";
import { useAuth } from "@/context/AuthContext";

// --- INTERFACES DE DATOS (Sincronizadas con NestJS) ---

export interface CartItem {
  id: string;
  productoId: string;
  quantity: number;
  precioOriginal: number;
  precioFinalUnitario: number;
  precioUnitarioVisual?: number;
  precioFinal: number;
  ahorroItem: number;
  subtotalItem: number;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl?: string;
  };
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
}

interface ProductData {
  nombre: string;
  imagenUrl?: string;
}

// --- INTERFAZ DEL CONTEXTO ---

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  loading: boolean;
  addItem: (
    productoId: string,
    quantity?: number,
    productData?: ProductData,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  lastAddedItem: CartItem | null;
  closeLastAddedModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- PROVIDER ---

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, authLoaded } = useAuth();

  const [cartData, setCartData] = useState<CartResponse>({
    items: [],
    subtotal: 0,
    descuentoTotal: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  /**
   * ✅ CORRECCIÓN ESLINT:
   * Envolvemos refreshCart en useCallback para que sea estable y
   * pueda ser usada como dependencia en el useEffect sin causar loops.
   */
  const refreshCart = useCallback(async () => {
    if (!authLoaded) return;

    if (!isAuthenticated) {
      setCartData({ items: [], subtotal: 0, descuentoTotal: 0, total: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await CartService.getCart();
      if (data) {
        setCartData(data);
      }
    } catch (err) {
      console.error("Error al cargar carrito:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoaded]);

  /**
   * ✅ PROTECCIÓN CRÍTICA:
   * Solo disparamos el refresh cuando la autenticación terminó de cargar.
   */
  useEffect(() => {
    refreshCart();
  }, [refreshCart]); // ✅ Ahora usamos refreshCart como dependencia estable

  // --- ACCIONES ---

  const addItem = async (
    productoId: string,
    quantity = 1,
    productData?: ProductData,
  ) => {
    try {
      const response = await CartService.addItem(productoId, quantity);
      setCartData(response);

      const added = response.items.find((i) => i.productoId === productoId);
      if (added) {
        setLastAddedItem(added);
      } else if (productData) {
        setLastAddedItem({
          id: "temp",
          productoId,
          quantity,
          precioOriginal: 0,
          precioFinalUnitario: 0,
          precioFinal: 0,
          ahorroItem: 0,
          subtotalItem: 0,
          producto: { id: productoId, ...productData, precio: 0 },
        });
      }
    } catch (err) {
      console.error("Error al agregar producto:", err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await CartService.removeItem(itemId);
      setCartData(response);
    } catch (err) {
      console.error("Error al eliminar item:", err);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(itemId);
    try {
      const response = await CartService.updateItemQuantity(itemId, quantity);
      setCartData(response);
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
    }
  };

  const clearCart = async () => {
    try {
      await CartService.clearCart();
      setCartData({ items: [], subtotal: 0, descuentoTotal: 0, total: 0 });
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: cartData.items,
        subtotal: cartData.subtotal,
        descuentoTotal: cartData.descuentoTotal,
        total: cartData.total,
        loading,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        refreshCart,
        lastAddedItem,
        closeLastAddedModal: () => setLastAddedItem(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};
