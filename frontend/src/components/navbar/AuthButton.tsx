"use client";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const AuthButton = () => {
  const { isAuthenticated, login, logout, user } = useAuth();

  return (
    <Button
      variant="ghost"
      onClick={isAuthenticated ? logout : login}
      className="hover:bg-[#e6dff1] flex items-center gap-1 px-3 py-1 rounded"
      title={
        isAuthenticated
          ? `Cerrar sesión (${user?.email})`
          : "Iniciar sesión con Google"
      }
      aria-label={
        isAuthenticated ? `Cerrar sesión de ${user?.email}` : "Iniciar sesión"
      }
    >
      <User className="h-7 w-7 text-[#7b5ca2]" />
      <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline">
        {isAuthenticated ? "Cerrar sesión" : "Ingresá"}
      </span>
    </Button>
  );
};
