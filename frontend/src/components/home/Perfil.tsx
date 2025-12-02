"use client";

import { useContext } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";

export default function UserProfile() {
  const auth = useContext(AuthContext);

  if (!auth) return <div>Error al cargar autenticación.</div>;

  const { user, isAuthenticated, logout } = auth;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-soft-beige text-color-dark">
        <p className="text-lg font-medium">
          No estás autenticado. Inicia sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  // Obtenemos nombre e imagen del usuario
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Sin nombre";

  const image =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=8b5cf6&color=fff&size=128`;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-soft-beige">
      <div className="relative w-full max-w-md bg-pastel-lilac text-color-dark rounded-2xl shadow-xl p-8 text-center animate-fadeIn border-2 border-lilac overflow-hidden group">
        {/* ✨ Animación de borde lila */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-color-lilac via-color-hover to-color-dark opacity-0 group-hover:opacity-100 blur-[3px] transition-opacity duration-700 animate-gradientMove"></div>

        {/* 🖼️ Imagen de perfil con efecto brillante */}
        <div className="relative flex justify-center mb-5 z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-color-lilac via-color-hover to-color-dark animate-gradientMove opacity-70 blur-md"></div>
            <Image
              src={image}
              alt={name}
              width={96}
              height={96}
              className="relative w-24 h-24 rounded-full border-4 border-soft-beige shadow-lg object-cover"
            />
          </div>
        </div>

        <h2 className="text-3xl font-semibold mb-6 z-10 relative">Mi Perfil</h2>

        <div className="space-y-3 text-left z-10 relative">
          <p>
            <span className="font-semibold">Nombre:</span> {name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="mt-8 bg-[#654a91] text-white px-5 py-2.5 rounded-lg hover:bg-color-dark transition-transform transform hover:scale-105 shadow-md z-10 relative"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
