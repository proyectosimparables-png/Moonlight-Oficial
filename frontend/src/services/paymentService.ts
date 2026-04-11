import { getAuthHeaders } from "@/lib/authHelpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Interfaces para Tipado ---
interface OrderItem {
    productoId: string;
    cantidad: number;
}

export interface OrderPayload {
    userId: string;
    emailContacto: string;
    nombreDestinatario: string;
    apellidoDestinatario: string;
    dniDestinatario: string;
    telefonoDestinatario: string;
    metodoEnvio: string;
    productType?: string;      // 👈 agregar
    deliveredType?: string;    // 👈 agregar
    costoEnvio: number;
    codigoPostal: string;
    provincia: string;
    localidad: string;
    calle: string;
    numero: string;
    piso?: string;
    departamento?: string;
    metodoPago: string;
    notasEntrega?: string;
    items: OrderItem[];
}

export interface OrderResponse {
    id: string;
    total: number;
    estado: string;
}

interface MPPreferenceResponse {
    id: string;
    init_point: string;
}

// --- Servicio ---

/**
 * Crea la orden en la base de datos
 */
export async function createOrder(orderPayload: OrderPayload): Promise<OrderResponse> {
    try {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_URL}/ordenes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            credentials: "include",
            body: JSON.stringify(orderPayload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Error al crear la orden");
        }

        return res.json();
    } catch (error) {
        console.error("Error en createOrder:", error);
        throw error;
    }
}

/**
 * Genera la preferencia de Mercado Pago para una orden existente
 */
export async function createMPPreference(orderId: string): Promise<MPPreferenceResponse> {
    try {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_URL}/payments/create-preference/${orderId}`, {
            method: "POST",
            headers: {
                ...headers,
            },
            credentials: "include",
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Error al crear preferencia de Mercado Pago");
        }

        return res.json();
    } catch (error) {
        console.error("Error en createMPPreference:", error);
        throw error;
    }
}

export const createGoCuotasPayment = async (orderId: string) => { // Agregué el tipo string
    try {
        const headers = await getAuthHeaders(); // 👈 Importante: obtener headers

        const response = await fetch(`${API_URL}/payments/create-gocuotas/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers, // 👈 Agregado para que sea consistente con los demás
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al crear el pago en GoCuotas');
        }

        return await response.json();
    } catch (error) {
        console.error("Error GoCuotas:", error);
        throw error;
    }
};