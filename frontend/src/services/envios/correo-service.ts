// src/services/correo/correoService.ts
import { apiRequest } from "@/lib/apiClient";
import { CartItemInput, ShippingRateResult } from "@/types/shipping";

/**
 * Consulta las tarifas de correo en tiempo real basándose en el CP y los ítems del carrito
 */
export async function getShippingRates(cp: string, cartItems: CartItemInput[] = []): Promise<ShippingRateResult[]> {
    // Log para verificar qué contiene cartItems antes de mapear
    console.log("Cart items antes de mapear:", cartItems);

    // Verificar si cartItems tiene productos válidos
    if (cartItems.length === 0) {
        console.warn("El array cartItems está vacío, por favor revisa cómo se están añadiendo los productos.");
    }

    // Mapeamos de forma segura usando las propiedades de CartItemInput sin recurrir a 'any'
    const items = (cartItems || []).map(item => ({
        productoId: item.varianteId || item.productoId || String(item.id),
        cantidad: item.quantity
    }));

    console.log("Items corregidos enviados al backend:", items);

    // Verificar si algún item tiene un valor inválido o nulo para productoId o cantidad
    items.forEach((item, index) => {
        if (!item.productoId || item.cantidad === undefined || item.cantidad <= 0) {
            console.warn(`Item inválido en el índice ${index}:`, item);
        }
    });

    // Hacemos la solicitud POST limpia usando apiRequest
    return await apiRequest<ShippingRateResult[]>("/correo/rates", {
        method: "POST",
        body: JSON.stringify({ cpDestino: cp, items }),
    });
}