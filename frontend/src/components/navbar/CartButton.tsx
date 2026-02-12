"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const CartButton = () => {
  const { cart = [] } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Cálculo optimizado del total de items
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity ?? 0), 0);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para ver el carrito", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }
    router.push("/cart");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-[#e6dff1] transition-colors"
      onClick={handleClick}
      aria-label={`Carrito con ${cartCount} productos`}
    >
      <ShoppingCart className="h-6 w-6 text-[#7b5ca2]" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#665ca2] text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white animate-in zoom-in">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Button>
  );
};
