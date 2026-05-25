// src/services/cartService.ts
import { apiRequest } from '@/lib/apiClient';
import { CartResponse } from '../context/Cart-Context';

const DEFAULT_CART: CartResponse = { items: [], subtotal: 0, descuentoTotal: 0, total: 0 };

export const CartService = {
    // 🔹 Obtener carrito
    async getCart(): Promise<CartResponse> {
        try {
            return await apiRequest<CartResponse>('/cart');
        } catch (err: unknown) {
            // Verificamos de forma segura si el error es un objeto con la propiedad message
            if (err instanceof Error && err.message.includes('401')) {
                return DEFAULT_CART;
            }

            console.error('Error fetching cart:', err);
            return DEFAULT_CART;
        }
    },

    // 🔹 Agregar producto (Actualizado para variantes)
    async addItem(productoId: string, quantity = 1, varianteId?: string): Promise<CartResponse> {
        return await apiRequest<CartResponse>('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productoId, quantity, varianteId }),
        });
    },

    // 🔹 Actualizar cantidad
    async updateItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
        return await apiRequest<CartResponse>(`/cart/update/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
        });
    },

    // 🔹 Eliminar producto
    async removeItem(itemId: string): Promise<CartResponse> {
        return await apiRequest<CartResponse>(`/cart/remove/${itemId}`, {
            method: 'DELETE',
        });
    },

    // 🔹 Vaciar carrito
    async clearCart(): Promise<void> {
        return await apiRequest<void>('/cart/clear', {
            method: 'DELETE',
        });
    },

    // 🔹 Sincronizar
    async syncWithBackend(userId: string, items: { productoId: string; cantidad: number; varianteId?: string }[]): Promise<CartResponse> {
        return await apiRequest<CartResponse>('/ordenes/carrito', {
            method: 'POST',
            body: JSON.stringify({ userId, items }),
        });
    },
};