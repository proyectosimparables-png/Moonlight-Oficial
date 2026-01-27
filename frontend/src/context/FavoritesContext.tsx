'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { obtenerFavoritos, agregarFavorito, eliminarFavorito } from "@/services/favoritos";
import { Favorito } from "@/types/types-productos";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FavoritesContextType {
  favorites: Favorito[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user} = useAuth();
  const [favorites, setFavorites] = useState<Favorito[]>([]);
  const router = useRouter();

  // Cargar favoritos del usuario
  const loadFavorites = async () => {
    if (!user?.id) return;
    try {
      const data = await obtenerFavoritos(user.id);
      setFavorites(data);
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      toast.error("No se pudieron cargar tus favoritos");
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  // Verifica si un producto está en favoritos
  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.productoId === productId);
  };

  // Agregar o eliminar favorito
  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para favoritos ⭐");
      router.push("/login");
      return;
    }

    const userId = user.id;

    try {
      if (isFavorite(productId)) {
        // Eliminar favorito
        await eliminarFavorito(userId, productId);
        setFavorites(prev => prev.filter(fav => fav.productoId !== productId));
        toast("Eliminado de favoritos 💔");
      } else {
        // Agregar favorito
        const nuevoFav: Favorito = await agregarFavorito(userId, productId);
        // Asegúrate que el backend devuelva el objeto Favorito completo con producto incluido
        setFavorites(prev => [...prev, nuevoFav]);
        toast.success("Agregado a favoritos ⭐");
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      toast.error("Ocurrió un error al actualizar tus favoritos");
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites: loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook para usar el context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return context;
};
