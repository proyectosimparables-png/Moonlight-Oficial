//ProtectedRoute.tsx

"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para acceder a esta página", {
        position: "top-center",
      });
      login(); // abre modal de login o redirige
      // router.push("/auth/login"); // opcional si quieres redirigir a una ruta
    }
  }, [isAuthenticated, login, router]);

  // Mientras verificamos auth, no renderizamos nada
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
