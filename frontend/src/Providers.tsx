"use client";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/Auth-Context";
import { CartProvider } from "@/context/Cart-Context";
import { FavoritesProvider } from "@/context/Favorites-Context";
import { NightModeProvider } from "@/context/Night-Mode-Context";

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
