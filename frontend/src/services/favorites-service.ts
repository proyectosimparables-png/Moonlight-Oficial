// src/services/favoritos.ts
import { apiRequest } from "@/lib/apiClient";
import { Favorito } from "@/types/products";

export const agregarFavorito = async (userId: string, productoId: number): Promise<Favorito> => {
  return await apiRequest<Favorito>("/favoritos/agregar", {
    method: "POST",
    body: JSON.stringify({ userId, productoId }),
  });
};

export const eliminarFavorito = async (userId: string, productoId: number): Promise<{ success: boolean; message?: string }> => {
  // Pasamos los parámetros de query de forma limpia en el endpoint corto
  return await apiRequest<{ success: boolean; message?: string }>(
    `/favoritos/eliminar?userId=${userId}&productoId=${productoId}`,
    {
      method: "DELETE",
    }
  );
};

export const obtenerFavoritos = async (userId: string): Promise<Favorito[]> => {
  try {
    return await apiRequest<Favorito[]>(`/favoritos/todos?userId=${userId}`);
  } catch {
    // Preservamos el mensaje de error original que lee tu FavoritesContext.tsx
    throw new Error("Error al obtener favoritos");
  }
};