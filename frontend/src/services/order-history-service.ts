// src/services/historialService.ts
import { apiRequest } from "@/lib/apiClient";

/**
 * Obtiene el historial de compras del usuario autenticado
 * Se le pasa la interfaz esperada por parámetro genérico <T>
 */
export async function getUserHistorial<T>(): Promise<T> {
  return await apiRequest<T>("/historial/mi-historial");
}