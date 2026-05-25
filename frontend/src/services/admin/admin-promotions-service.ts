// src/services/admin/promociones-service.ts
import { apiRequest } from "@/lib/apiClient";
import {
    PromocionResponse,
    PromocionPayload,
    CuponResponse,
    CuponPayload
} from "@/types/promotions";

export const promocionesService = {

    // ==========================================
    // 🔹 PROMOCIONES GENERALES
    // ==========================================

    async getPromociones(): Promise<PromocionResponse[]> {
        try {
            return await apiRequest<PromocionResponse[]>("/promociones", { cache: "no-store" });
        } catch (error) {
            console.error("Error al obtener promociones:", error);
            return [];
        }
    },

    async createPromocion(data: PromocionPayload): Promise<PromocionResponse> {
        return await apiRequest<PromocionResponse>("/promociones", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async deletePromocion(id: string): Promise<PromocionResponse> {
        return await apiRequest<PromocionResponse>(`/promociones/${id}`, {
            method: "DELETE",
        });
    },

    // ==========================================
    // 🔹 CUPONES DE DESCUENTO
    // ==========================================

    async getCupones(): Promise<CuponResponse[]> {
        try {
            return await apiRequest<CuponResponse[]>("/promociones/cupon", { cache: "no-store" });
        } catch (error) {
            console.error("Error al obtener cupones:", error);
            return [];
        }
    },

    async createCupon(data: CuponPayload): Promise<CuponResponse> {
        return await apiRequest<CuponResponse>("/promociones/cupon", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },



    async updateCupon(id: string, data: Partial<CuponPayload>): Promise<CuponResponse> {
        return await apiRequest<CuponResponse>(`/promociones/cupon/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    async deleteCupon(id: string): Promise<CuponResponse> {

        return await apiRequest<CuponResponse>(`/promociones/cupon/${id}`, {
            method: "DELETE",
        });
    },
};