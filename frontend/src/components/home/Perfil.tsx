"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import { updateUserAddress } from "@/services/userService";
import toast from "react-hot-toast";

export default function UserProfile() {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  if (!auth) return <div>Error al cargar autenticación.</div>;

  const { user, provider, isAuthenticated, logout, authLoaded, setUser } = auth;

  if (!authLoaded)
    return <div className="p-4 text-center text-gray-600">Cargando datos del usuario...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-soft-beige text-color-dark">
        <p className="text-lg font-medium">
          No estás autenticado. Inicia sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  // -------------------------------
  // 1) Nombre del usuario (Google o Local)
  // -------------------------------
 const name = String(
  user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.name ??
    user?.email?.split("@")[0] ??
    "Sin nombre"
);

  // -------------------------------
  // 2) Imagen (Google o Local)
  // -------------------------------
 const image: string =
  user?.user_metadata?.avatar_url ??
  user?.user_metadata?.picture ??
  user?.image ??
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=128`;

  // -------------------------------
  // 3) Guardar domicilio (Local o Google)
  // -------------------------------
  const handleSaveAddress = async () => {
    if (!addressInput.trim()) return toast.error("Ingresa un domicilio válido");

    try {
      setLoading(true);

      const res = await updateUserAddress(addressInput);

      // Actualizar contexto
      setUser((prev) => ({
        ...prev!,
        address: res.user.address,
      }));

      setAddressInput("");
      toast.success("Domicilio actualizado correctamente 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el domicilio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-transparent">
      <div className="relative w-full max-w-md bg-pastel-lilac text-color-dark rounded-2xl shadow-xl p-8 text-center animate-fadeIn border-2 border-lilac overflow-hidden group">

        {/* 🌟 Imagen */}
        <div className="relative flex justify-center mb-5 z-10">
          <Image
            src={image}
            alt={name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-4 border-soft-beige shadow-lg object-cover"
          />
        </div>

        <h2 className="text-3xl font-semibold mb-6 z-10">Mi Perfil</h2>

        <div className="space-y-3 text-left mb-8 z-10">
          <p>
            <span className="font-semibold">Nombre:</span> {name}
          </p>

          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>

          <p>
            <span className="font-semibold">Autenticado con:</span>{" "}
            {provider === "supabase" ? (
              <span className="text-blue-700 font-medium">Google (Supabase)</span>
            ) : (
              <span className="text-purple-700 font-medium">Cuenta Local</span>
            )}
          </p>

          <p>
            <span className="font-semibold">Domicilio:</span>{" "}
            {user?.address ? (
              <span className="text-green-700 font-medium">{user.address}</span>
            ) : (
              <span className="text-red-600">No has agregado tu domicilio</span>
            )}
          </p>
        </div>

        {/* 👉 Form de domicilio */}
        <div className="space-y-3 mb-4 z-10">
          <h3 className="text-xl font-semibold mb-2">Actualizar Domicilio</h3>

          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Ej: Calle falsa 5461"
            className="w-full p-3 rounded-lg border-2 border-lilac focus:border-color-dark bg-white"
          />

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full bg-[#654a91] text-white py-2 rounded-lg hover:bg-color-dark transition-transform hover:scale-105 shadow-md"
          >
            {loading ? "Guardando..." : "Guardar domicilio"}
          </button>
        </div>

        {/* 🔥 Logout */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-[#654a91] text-white px-5 py-2.5 rounded-lg hover:bg-color-dark transition-transform hover:scale-105 shadow-md"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
