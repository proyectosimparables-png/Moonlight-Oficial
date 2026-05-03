// src/services/cartService.ts
import { CartResponse } from '../context/CartContext';

export const CartService = {
    // 🔹 Obtener carrito
    async getCart(): Promise<CartResponse> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                credentials: 'include',
            });

            if (res.status === 401) {
                return { items: [], subtotal: 0, descuentoTotal: 0, total: 0 };
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error fetching cart');
            return data;
        } catch (err) {
            console.error('Error fetching cart:', err);
            return { items: [], subtotal: 0, descuentoTotal: 0, total: 0 };
        }
    },

    // 🔹 Agregar producto (Actualizado para variantes)
    async addItem(productoId: string, quantity = 1, varianteId?: string): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Enviamos el varianteId al backend de NestJS
            body: JSON.stringify({ productoId, quantity, varianteId }),
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error adding item');
        return data;
    },

    // 🔹 Actualizar cantidad
    async updateItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/update/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error updating item');
        return data;
    },

    // 🔹 Eliminar producto
    async removeItem(itemId: string): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error removing item');
        return data;
    },

    // 🔹 Vaciar carrito
    async clearCart(): Promise<void> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Error clearing cart');
        }
    },

    // 🔹 Sincronizar (Actualizado para incluir varianteId en la lógica de items)
    async syncWithBackend(userId: string, items: { productoId: string; cantidad: number; varianteId?: string }[]): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ordenes/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items }),
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error sincronizando carrito');
        return data;
    },
};