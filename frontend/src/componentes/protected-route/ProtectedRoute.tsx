"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, authLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoaded) return; // Esperamos a que termine la carga inicial

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para acceder a esta página", {
        position: "top-center",
      });
      router.push("/login");
    }
  }, [isAuthenticated, authLoaded, router]);

  // Mientras no se haya cargado la auth, no renderizamos nada
  if (!authLoaded) return null;

  // Si cargó y no está autenticado, evitamos parpadeos
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
