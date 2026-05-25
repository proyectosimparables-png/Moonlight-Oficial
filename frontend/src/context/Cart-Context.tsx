"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo, // Importamos useMemo para cálculos eficientes
} from "react";
import { CartService } from "@/services/cart-service";
import { useAuth } from "@/context/Auth-Context";

// --- INTERFACES ---

export interface ConfigEnvio {
  id: string;
  montoMinimo: number;
  activo: boolean;
}

// (Tus otras interfaces se mantienen igual...)
export interface Variante {
  id: string;
  talle?: string;
  color?: string;
  stock?: number;
  precio?: number;
}

export interface CartItem {
  id: string;
  varianteId: string;
  quantity: number;
  variante: {
    id: string;
    talle?: string;
    color?: string;
    sku?: string;
    producto: {
      id: string;
      nombre: string;
      precio: number;
      imagenUrl?: string;
    };
  };
  precioOriginal: number;
  precioFinalUnitario: number;
  precioUnitarioVisual?: number;
  precioFinal: number;
  ahorroItem: number;
  subtotalItem: number;
  talle?: string;
  color?: string;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
}

interface ProductData {
  nombre: string;
  precio: number;
  imagenUrl?: string;
  talle?: string;
  color?: string;
  varianteId?: string;
}

// --- INTERFAZ DEL CONTEXTO ACTUALIZADA ---

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  loading: boolean;
  // Nuevos campos para envío gratis
  configEnvio: ConfigEnvio | null;
  esEnvioGratis: boolean;
  montoFaltante: number;
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

  // --- NUEVO: Estado para la configuración de envío ---
  const [configEnvio, setConfigEnvio] = useState<ConfigEnvio | null>(null);

  // --- NUEVO: Cargar configuración de envío desde el back (Puerto 3000) ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("http://localhost:3000/configuracion-tienda");
        if (res.ok) {
          const data = await res.json();
          setConfigEnvio(data);
        }
      } catch (err) {
        console.error("Error cargando configuración de envío:", err);
      }
    };
    fetchConfig();
  }, []);

  // --- NUEVO: Cálculos de envío gratis ---
  const { esEnvioGratis, montoFaltante } = useMemo(() => {
    if (!configEnvio || !configEnvio.activo) {
      return { esEnvioGratis: false, montoFaltante: 0 };
    }
    const gratis = cartData.subtotal >= configEnvio.montoMinimo;
    const faltante = configEnvio.montoMinimo - cartData.subtotal;
    return {
      esEnvioGratis: gratis,
      montoFaltante: faltante > 0 ? faltante : 0,
    };
  }, [cartData.subtotal, configEnvio]);

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

  // --- ACCIONES (addItem, removeItem, etc. se mantienen igual) ---
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
        setLastAddedItem({
          id: "temp-" + Date.now(),
          varianteId: productData.varianteId || "",
          quantity,
          variante: {
            id: productData.varianteId || "temp-var",
            talle: productData.talle,
            color: productData.color,
            producto: {
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
        configEnvio, // Exportamos la config
        esEnvioGratis, // Exportamos si es gratis
        montoFaltante, // Exportamos cuánto falta
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
