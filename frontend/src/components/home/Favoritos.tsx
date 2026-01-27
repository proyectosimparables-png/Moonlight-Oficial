'use client';

import { Trash2, Star } from "lucide-react"; // Cambiamos Heart por Star
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "../home/ProductCard";
import { Favorito } from "@/types/types-productos";

export default function FavoritosList() {
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleEliminarFavorito = async (e: React.MouseEvent, productoId: string) => {
    e.stopPropagation(); 
    try {
      await toggleFavorite(productoId);
      toast.success("Producto eliminado de favoritos ⭐");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el producto ⭐");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#7b5ca2] animate-pulse">
        <StarBeat />
        <p className="text-sm text-gray-500 mt-4">⭐ Cargando tus favoritos...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#7b5ca2]">
        <StarBeat />
        <p className="mt-4 text-lg font-medium">¡Aún no tienes favoritos! ⭐</p>
        <p className="text-sm text-gray-500 mt-1">Agrega productos con la estrella para verlos aquí 💫</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-semibold text-[#6c5b7b] mb-8 text-center flex items-center justify-center gap-2">
        Mis Favoritos ⭐
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((fav: Favorito) => (
          <div key={fav.id} className="relative group">
            {/* Card oficial con efecto hover e imagenHoverUrl corregido */}
            <ProductCard 
              id={fav.productoId}
              nombre={fav.producto?.nombre || ""}
              precio={fav.producto?.precio?.toString() || "0"}
              imagenUrl={fav.producto?.imagenUrl}
              // Usamos ?? undefined para evitar el error de TypeScript con el null del backend
              imagenHoverUrl={fav.producto?.imagenHoverUrl ?? undefined} 
            />

            {/* Botón de eliminar con el diseño de tu app */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-red-500 border-none shadow-sm rounded-full h-8 w-8"
              onClick={(e) => handleEliminarFavorito(e, fav.productoId)}
              aria-label="Eliminar de favoritos"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 🌟 Animación de carga con Estrella (Coherencia Moonlight) */
function StarBeat() {
  return (
    <div className="relative">
      <Star className="h-16 w-16 text-[#f5c518] fill-[#f5c518]" />
      <div className="absolute inset-0 rounded-full animate-ping bg-[#f5c518]/30"></div>
    </div>
  );
}