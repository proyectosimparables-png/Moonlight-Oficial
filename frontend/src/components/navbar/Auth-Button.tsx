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
import { User, Clock, LogOut, UserCircle, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const AuthButton = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        onClick={() => router.push("/login")}
        className="hover:bg-[#e6dff1] flex items-center gap-1 px-3 py-1 rounded"
        title="Iniciar sesión"
      >
        <User className="h-7 w-7 text-[#7b5ca2]" />
        <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline">
          Ingresá
        </span>
      </Button>
    );
  }

  // ✅ Modificado para redirigir a Home siempre
  const handleLogout = async () => {
    try {
      await logout();

      // Primero mandamos al home para evitar que el middleware nos mande al login
      router.push("/");

      toast.success("Sesión cerrada correctamente 👋", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      toast.error("No se pudo cerrar la sesión");
    }
  };

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const image =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7b5ca2&color=fff&size=128`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-[#e6dff1] flex items-center gap-2 px-3 py-1 rounded transition-colors outline-none group">
          <div className="relative">
            <Image
              src={image}
              alt={name}
              width={36}
              height={36}
              className="rounded-full border-2 border-[#d8c4fa] object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <span className="text-[#7b5ca2] select-none text-sm hidden sm:inline font-medium">
            Hola, {name.split(" ")[0]} 👋
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-center text-[#6c5b7b] font-semibold overflow-hidden text-ellipsis">
          {user?.user_metadata?.name || user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/favoritos")}
          className="cursor-pointer text-[#6c5b7b] gap-2"
        >
          <Star className="h-4 w-4 fill-[#f5c518] text-[#f5c518]" />
          <span>Favoritos</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/historial")}
          className="cursor-pointer text-[#6c5b7b] gap-2"
        >
          <Clock className="h-4 w-4" /> Historial
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/perfil")}
          className="cursor-pointer text-[#6c5b7b] gap-2"
        >
          <UserCircle className="h-4 w-4" /> Mi perfil
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-500 gap-2 focus:text-red-500"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
