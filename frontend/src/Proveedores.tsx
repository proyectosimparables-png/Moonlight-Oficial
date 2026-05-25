"use client";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { NightModeProvider } from "@/context/NightModeContext";

//Si es necesario un Nuevo Contexto (por ejemplo, para envíos), se haces aca en Providers.tsx y no tocas el Layout

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <NightModeProvider>{children}</NightModeProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
