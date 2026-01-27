"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CheckoutWizard from "./CheckoutWizard";

export default function CheckoutContainer() {
  const { cart, loading } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Si el carrito está vacío y ya terminó de cargar, lo devolvemos al inicio
    if (!loading && cart.length === 0) {
      router.push("/");
    }
  }, [cart, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-purple-600 animate-pulse font-medium">Cargando...</p>
      </div>
    );
  }

  return <CheckoutWizard />;
}
