"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CartService } from "@/services/cartService";
import { useAuth } from "@/context/AuthContext";

// --- INTERFACES DE DATOS ACTUALIZADAS ---

export interface Variante {
  id: string;
  talle?: string;
  color?: string;
  stock?: number;
  precio?: number;
}

export interface CartItem {
  id: string;
  varianteId: string; // Es obligatorio según tu lógica de back
  quantity: number;

  // La Variante es el puente hacia el Producto
  variante: {
    id: string;
    talle?: string;
    color?: string;
    sku?: string;
    producto: {
      // ✅ El producto vive aquí adentro
      id: string;
      nombre: string;
      precio: number;
      imagenUrl?: string;
    };
  };

  // Campos calculados que vienen de tu calculatePromotions en el back
  precioOriginal: number;
  precioFinalUnitario: number;
  precioUnitarioVisual?: number;
  precioFinal: number;
  ahorroItem: number;
  subtotalItem: number;

  // Estos puedes mantenerlos como opcionales si el back los aplana,
  // pero lo ideal es usar siempre item.variante.talle
  talle?: string;
  color?: string;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
}

// Interfaz para los datos temporales que vienen del componente visual
interface ProductData {
  nombre: string;
  precio: number;
  imagenUrl?: string;
  talle?: string;
  color?: string;
  varianteId?: string;
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
    productData?: ProductData, // ✅ Ahora incluye info de variante
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

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // --- ACCIONES ---

  // --- Dentro de la función addItem en CartContext.tsx ---

  const addItem = async (
    productoId: string,
    quantity = 1,
    productData?: ProductData,
  ) => {
    try {
      const response = await CartService.addItem(
        productoId,
        quantity,
        productData?.varianteId,
      );
      setCartData(response);

      const added = response.items.find(
        (i) =>
          i.variante?.producto?.id === productoId &&
          i.varianteId === productData?.varianteId,
      );

      if (added) {
        setLastAddedItem(added);
      } else if (productData) {
        // ✅ Agregamos el objeto 'variante' aquí para que coincida con la interfaz
        setLastAddedItem({
          id: "temp-" + Date.now(),
          varianteId: productData.varianteId || "", // ✅ Aseguramos que sea string (no undefined)
          quantity,
          variante: {
            id: productData.varianteId || "temp-var",
            talle: productData.talle,
            color: productData.color,
            producto: {
              // ✅ Agregamos el objeto producto aquí adentro
              id: productoId,
              nombre: productData.nombre,
              precio: productData.precio,
              imagenUrl: productData.imagenUrl,
            },
          },
          precioOriginal: productData.precio,
          precioFinalUnitario: productData.precio,
          precioFinal: productData.precio * quantity,
          ahorroItem: 0,
          subtotalItem: productData.precio * quantity,
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
