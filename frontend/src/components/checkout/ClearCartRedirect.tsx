"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCartRedirect() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null; // No renderiza nada visualmente
}
