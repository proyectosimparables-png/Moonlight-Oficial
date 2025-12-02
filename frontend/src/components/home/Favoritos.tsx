'use client';

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Favorito } from "@/types/types-productos";
import toast from "react-hot-toast";
import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState } from "react";

export default function FavoritosList() {
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);

  // 🔄 Cargar favoritos solo al montar
  useEffect(() => {
    setLoading(false); // Ya que el contexto carga los favoritos
  }, []);

  const handleEliminarFavorito = async (productoId: string) => {
    try {
      await toggleFavorite(productoId); // Elimina si ya está en favoritos
      toast.success("Producto eliminado de favoritos 💔");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el producto 💜");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#7b5ca2] animate-pulse">
        <HeartBeat />
        <p className="text-sm text-gray-500 mt-4">
          💜 Cargando tus productos favoritos...
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#7b5ca2]">
        <HeartBeat />
        <p className="mt-4 text-lg font-medium">
          ¡Aún no tienes productos favoritos!
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Agrega productos a favoritos para verlos aquí 💜
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#6c5b7b] mb-6 text-center">
        Mis Favoritos 💜
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((fav: Favorito) => (
          <Card
            key={fav.id}
            className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-md transition-shadow rounded-lg relative"
          >
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={fav.producto?.imagenUrl ?? "/placeholder.png"}
                  alt={fav.producto?.nombre ?? "Producto favorito"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />

                {/* 🗑️ Botón eliminar favorito */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-white/70 hover:bg-[#f5e6ff] text-[#7b5ca2] shadow-md rounded-full"
                  onClick={() => handleEliminarFavorito(fav.productoId)}
                  aria-label="Eliminar de favoritos"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Info del producto */}
              <div className="p-4">
                <h3 className="text-[#6c5b7b] font-medium mb-2 text-sm md:text-base line-clamp-2 min-h-[40px]">
                  {fav.producto?.nombre ?? "Producto favorito"}
                </h3>

                <p className="text-[#7b5ca2] font-serif text-xl font-semibold">
                  ${(fav.producto?.precio ?? 0).toLocaleString("es-AR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** 💜 Animación para "esperando favoritos" */
function HeartBeat() {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-[#7b5ca2]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21s-8-6.2-8-11.5S7.5 2 12 7.1C16.5 2 20 3.5 20 9.5S12 21 12 21z" />
      </svg>
      <div className="absolute inset-0 rounded-full animate-ping bg-[#7b5ca2]/30"></div>
    </div>
  );
}
