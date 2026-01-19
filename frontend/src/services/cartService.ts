// src/services/cartService.ts
import { CartItem } from '../context/CartContext';

interface CartResponse {
    id: string;
    userId: string;
    items: CartItem[];
}

export const CartService = {
    // 🔹 Obtener carrito
    async getCart(): Promise<CartResponse> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                credentials: 'include',
            });
            if (res.status === 401) {
                // Usuario no logueado → carrito vacío
                return { id: '', userId: '', items: [] };
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error fetching cart');
            return data;
        } catch (err) {
            console.error('Error fetching cart:', err);
            return { id: '', userId: '', items: [] };
        }
    },

    // 🔹 Agregar producto
    async addItem(productoId: string, quantity = 1): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productoId, quantity }),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
            console.error('Error desde backend:', data);
            throw new Error(data.message || 'Error adding item');
        }
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
    async clearCart(): Promise<CartResponse> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error clearing cart');
        return data;
    },

async syncWithBackend(userId: string, items: { productoId: string; cantidad: number }[]) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ordenes/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error sincronizando carrito');
        return data;
    },


};
