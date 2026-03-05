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
    // Esto evita que entren al checkout por URL si no tienen nada que comprar
    if (!loading && cart.length === 0) {
      router.push("/");
    }
  }, [cart, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#faf5e5]">
        <p className="text-[#A186ED] animate-pulse font-medium tracking-widest uppercase text-xs">
          Cargando tu pedido...
        </p>
      </div>
    );
  }

  // Si no hay productos, no renderizamos nada mientras el useEffect hace el redirect
  if (cart.length === 0) return null;

  return <CheckoutWizard />;
}
