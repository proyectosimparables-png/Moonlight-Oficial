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

  const { user, isAuthenticated, logout, authLoaded } = auth;

  if (!authLoaded)
    return (
      <div className="p-4 text-center text-gray-600">
        Cargando datos del usuario...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-soft-beige text-color-dark">
        <p className="text-lg font-medium">
          No estás autenticado. Inicia sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Sin nombre";

  const image =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=8b5cf6&color=fff&size=128`;

  // -----------------------------------------------------------
  //   FUNCION PARA GUARDAR EL DOMICILIO
  // -----------------------------------------------------------
  const handleSaveAddress = async () => {
    if (!addressInput.trim()) return alert("Ingresa un domicilio válido");

    try {
      setLoading(true);

      const res = await updateUserAddress(addressInput);

      // 🔥 Actualizamos el AuthContext con la nueva address
      auth.setUser((prev) => ({
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
    <div className="flex justify-center items-center min-h-[80vh] bg-soft-beige">
      <div className="relative w-full max-w-md bg-pastel-lilac text-color-dark rounded-2xl shadow-xl p-8 text-center animate-fadeIn border-2 border-lilac overflow-hidden group">
        
        {/* ✨ Imagen de perfil */}
        <div className="relative flex justify-center mb-5 z-10">
          <div className="relative">
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

        <div className="space-y-3 text-left z-10 relative mb-8">
          <p>
            <span className="font-semibold">Nombre:</span> {name}
          </p>

          <p>
            <span className="font-semibold">Email:</span> {user?.email}
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

        {/* 📌 FORMULARIO PARA AGREGAR / CAMBIAR DOMICILIO */}
        <div className="space-y-3 z-10 relative mb-4">
          <h3 className="text-xl font-semibold mb-2">Actualizar Domicilio</h3>
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder=" Ej:Calle falsa 5461"
            className="w-full p-3 rounded-lg border-2 border-lilac focus:border-color-dark focus:outline-none bg-white"
          />

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full  bg-[#654a91] text-white py-2 rounded-lg hover:bg-color-dark transition-transform transform hover:scale-105 shadow-md"
          >
            {loading ? "Guardando..." : "Guardar Domicilio"}
          </button>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-[#654a91] text-white px-5 py-2.5 rounded-lg hover:bg-color-dark transition-transform transform hover:scale-105 shadow-md"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
