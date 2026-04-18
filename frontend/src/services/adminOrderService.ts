const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminOrderService = {
  /**
   * Obtener una orden por ID
   */
  async getOrderById(orderId: string) {
    try {
      const res = await fetch(`${API_URL}/ordenes/${orderId}`, {
        cache: 'no-store', // Para obtener siempre la info actualizada de la DB
      });
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error("Error al obtener la orden:", error);
      return null;
    }
  },

  /**
   * Cambiar estado general (Empaquetar, Enviar, etc.)
   */
  async updateStatus(orderId: string, status: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoEstado: status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al actualizar el estado');
    }

    return res.json();
  },

  /**
   * Acción específica: Desempaquetar
   * Reutiliza el endpoint de status volviendo a "PAGADO"
   */
  async unpackOrder(orderId: string) {
    return this.updateStatus(orderId, 'PAGADO');
  },

  /**
   * Actualizar notas internas del administrador
   * Impacta en el nuevo campo notasAdmin de la DB
   */
  async updateAdminNotes(orderId: string, notas: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/notas-admin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notasAdmin: notas }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al guardar las notas');
    }

    return res.json();
  },

  /**
   * Reembolsar en Mercado Pago vía Backend
   */
  async refundOrder(orderId: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/refund`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al procesar el reembolso');
    }

    return res.json();
  },

  /**
   * Notificar despacho / envío
   */
  async notifyShipment(orderId: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/despachar`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al notificar envío');
    }

    return res.json();
  }
};