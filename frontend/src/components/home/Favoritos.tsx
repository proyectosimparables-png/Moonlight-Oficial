'use client';

import { Trash2, Star } from "lucide-react";
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
            <ProductCard 
              id={fav.productoId}
              nombre={fav.producto?.nombre || ""}
              precio={fav.producto?.precio?.toString() || "0"}
              imagenUrl={fav.producto?.imagenUrl}
              imagenHoverUrl={fav.producto?.imagenHoverUrl ?? undefined} 
            />

            {/* BOTÓN ELIMINAR OPTIMIZADO: visible en móvil, hover en escritorio */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 left-2 z-20 
                         opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                         transition-opacity duration-300 
                         bg-white/90 hover:bg-red-50 text-red-500 
                         border border-red-100 shadow-md rounded-full h-9 w-9"
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

function StarBeat() {
  return (
    <div className="relative">
      <Star className="h-16 w-16 text-[#f5c518] fill-[#f5c518]" />
      <div className="absolute inset-0 rounded-full animate-ping bg-[#f5c518]/30"></div>
    </div>
  );
}