const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminOrderService = {
  // Cambiar estado (Empaquetar, Enviar, etc)
  async updateStatus(orderId: string, status: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Reembolsar en Mercado Pago vía nuestro Backend
  async refundOrder(orderId: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/refund`, {
      method: 'POST',
    });
    return res.json();
  }
};