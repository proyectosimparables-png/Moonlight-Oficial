// src/services/configEnvioService.ts
import { apiRequest } from "@/lib/apiClient";
import { ConfigEnvio, UpdateConfigEnvioDTO } from "@/types/shipping";

/**
 * Obtiene la configuración actual de envíos de la tienda
 * Se conecta con: GET /configuracion-tienda/envio
 */
export async function getConfigEnvio(): Promise<ConfigEnvio | null> {
    try {
        return await apiRequest<ConfigEnvio>("/configuracion-tienda/envio");
    } catch (error) {
        console.error("Error al obtener la configuración de envíos:", error);
        return null;
    }
}

/**
 * Actualiza los parámetros de envío gratis (monto mínimo y estado)
 * Se conecta con: PATCH /configuracion-tienda/envio/:id
 */
export async function updateConfigEnvio(id: string, data: UpdateConfigEnvioDTO): Promise<boolean> {
    try {
        await apiRequest<ConfigEnvio>(`/configuracion-tienda/envio/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return true;
    } catch (error) {
        console.error("Error al actualizar la configuración de envíos:", error);
        return false;
    }
}