"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Heart, Clock, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";
import FavoritosList from "../home/Favoritos";

export const AuthButton = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  const router = useRouter();
  const [showFavoritos, setShowFavoritos] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        onClick={login}
        className="hover:bg-[#e6dff1] flex items-center gap-1 px-3 py-1 rounded"
        title="Iniciar sesión con Google"
      >
        <User className="h-7 w-7 text-[#7b5ca2]" />
        <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline">
          Ingresá
        </span>
      </Button>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente 👋", { position: "top-center" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-[#e6dff1] flex items-center gap-2 px-3 py-1 rounded"
          >
            <User className="h-7 w-7 text-[#7b5ca2]" />
            <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline">
              Hola, {user?.user_metadata?.name || user?.email?.split("@")[0]} 👋
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-center text-[#6c5b7b] font-semibold">
            {user?.user_metadata?.name || user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push("/cliente/favoritos")}
            className="cursor-pointer text-[#6c5b7b]"
          >
            <Heart className="h-4 w-4 mr-2 text-[#6c5b7b]" /> Favoritos
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/historial")}
            className="cursor-pointer text-[#6c5b7b]"
          >
            <Clock className="h-4 w-4 mr-2 text-[#6c5b7b]" /> Historial
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/perfil")}
            className="cursor-pointer text-[#6c5b7b]"
          >
            <UserCircle className="h-4 w-4 mr-2 text-[#6c5b7b]" /> Mi perfil
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2 text-red-500" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de favoritos (simple para ahora) */}
      {showFavoritos && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-lg relative">
            <button
              onClick={() => setShowFavoritos(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
            <FavoritosList userId={user?.id || ""} />
          </div>
        </div>
      )}
    </>
  );
};
