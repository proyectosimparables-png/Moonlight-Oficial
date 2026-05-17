// src/services/orderService.ts
import { apiRequest } from "@/lib/apiClient";
import {
    OrderPayload,
    OrderResponse,
    MPPreferenceResponse,
    GoCuotasResponse
} from "@/types/ordenes";

/**
 * Crea la orden en la base de datos
 */
export async function createOrder(orderPayload: OrderPayload): Promise<OrderResponse> {
    return await apiRequest<OrderResponse>("/ordenes", {
        method: "POST",
        body: JSON.stringify(orderPayload),
    });
}

/**
 * Genera la preferencia de Mercado Pago para una orden existente
 */
export async function createMPPreference(orderId: string): Promise<MPPreferenceResponse> {
    return await apiRequest<MPPreferenceResponse>(`/payments/create-preference/${orderId}`, {
        method: "POST",
    });
}

/**
 * Genera la pasarela de pago en GoCuotas para una orden existente
 */
export async function createGoCuotasPayment(orderId: string): Promise<GoCuotasResponse> {
    return await apiRequest<GoCuotasResponse>(`/payments/create-gocuotas/${orderId}`, {
        method: "POST",
    });
}