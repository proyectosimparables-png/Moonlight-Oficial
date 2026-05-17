// src/services/puntoEntregaService.ts
import { apiRequest } from "@/lib/apiClient";
import { PuntoEntrega, CreatePuntoEntregaDTO, UpdatePuntoEntregaDTO } from "@/types/envios";

// 1. Obtener todos los puntos de entrega
export async function getPuntosEntrega(): Promise<PuntoEntrega[]> {
  return await apiRequest<PuntoEntrega[]>("/punto-entrega");
}

// 2. Crear un nuevo punto de entrega
export async function createPuntoEntrega(data: CreatePuntoEntregaDTO): Promise<PuntoEntrega> {
  return await apiRequest<PuntoEntrega>("/punto-entrega", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 3. Eliminar un punto de entrega
export async function deletePuntoEntrega(id: string): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(`/punto-entrega/${id}`, {
    method: "DELETE",
  });
}

// 4. Actualizar un punto de entrega existente
export async function updatePuntoEntrega(id: string, data: UpdatePuntoEntregaDTO): Promise<PuntoEntrega> {
  return await apiRequest<PuntoEntrega>(`/punto-entrega/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}