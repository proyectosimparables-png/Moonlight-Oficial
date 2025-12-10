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
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";
import FavoritosList from "../home/Favoritos";

export const AuthButton = () => {
  const { isAuthenticated,  logout, user } = useAuth();
  const router = useRouter();
  const [showFavoritos, setShowFavoritos] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
       onClick={() => router.push("/login")}
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

   const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const image =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=7b5ca2&color=fff&size=128`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-[#e6dff1] flex items-center gap-2 px-3 py-1 rounded transition-colors"
          >
            <div className="relative">
              <Image
                src={image}
                alt={name}
                width={36}
                height={36}
                className="rounded-full border-2 border-[#d8c4fa] object-cover shadow-sm hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#d8c4fa] via-[#e6dff1] to-[#7b5ca2] opacity-0 hover:opacity-60 blur-[4px] transition-opacity duration-500"></div>
            </div>
            <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline">
              Hola, {name.split(" ")[0]} 👋
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
            onClick={() => router.push("/cliente/historial")}
            className="cursor-pointer text-[#6c5b7b]"
          >
            <Clock className="h-4 w-4 mr-2 text-[#6c5b7b]" /> Historial
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/cliente/perfil")}
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
            <FavoritosList/>
          </div>
        </div>
      )}
    </>
  );
};
