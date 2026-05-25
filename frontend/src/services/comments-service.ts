// src/services/comentarios.ts
import { apiRequest } from '@/lib/apiClient';

// getComentarios ahora exige que le pases el tipo esperado al llamarlo
export async function getComentarios<T>(limit = 15): Promise<T> {
  try {
    return await apiRequest<T>(`/comentarios?limit=${limit}`);
  } catch (error) {
    console.error("Error cargando comentarios:", error);
    throw error;
  }
}

// createComentario acepta el contenido y el alias opcional
export async function createComentario<T>(contenido: string, nombre?: string): Promise<T> {
  try {
    return await apiRequest<T>('/comentarios', {
      method: "POST",
      body: JSON.stringify({ contenido, nombre }), // Ya mandamos el alias al back
    });
  } catch (error) {
    console.error("Error creando comentario:", error);
    throw error;
  }
}

export const deleteComentario = async (id: string | number): Promise<void> => {
  try {
    return await apiRequest(`/comentarios/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error eliminando comentario:", error);
    throw error;
  }
};