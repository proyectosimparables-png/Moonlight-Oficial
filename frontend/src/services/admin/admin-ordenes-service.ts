// src/services/admin/admin-ordenes-service.ts

import { apiRequest } from "@/lib/apiClient";
import { OrderResponse as OrdenReal } from "@/types/ordenes";

export const adminOrderService = {
  /**
   * Obtener todas las órdenes de la tienda para el panel de administración
   */
  async getOrdenesAdmin(): Promise<OrdenReal[]> {
    try {
      return await apiRequest<OrdenReal[]>("/ordenes", {
        cache: "no-store",
      });
    } catch (error) {
      console.error("Error al obtener las órdenes en el panel admin:", error);
      return [];
    }
  },

  /**
   * Obtener una orden por ID
   */
  async getOrderById(orderId: string): Promise<OrdenReal | null> {
    try {
      return await apiRequest<OrdenReal>(`/ordenes/${orderId}`, {
        cache: "no-store",
      });
    } catch (error) {
      console.error(`Error al obtener la orden ${orderId}:`, error);
      return null;
    }
  },

  /**
   * Cambiar estado general (Empaquetar, Enviar, etc.)
   */
  async updateStatus(orderId: string, status: string): Promise<OrdenReal> {
    return await apiRequest<OrdenReal>(`/ordenes/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ nuevoEstado: status }),
    });
  },

  /**
   * Acción específica: Desempaquetar
   * Reutiliza el endpoint de status volviendo a "PAGADO"
   */
  async unpackOrder(orderId: string): Promise<OrdenReal> {
    return this.updateStatus(orderId, "PAGADO");
  },

  /**
   * Actualizar notas internas del administrador
   */
  async updateAdminNotes(orderId: string, notas: string): Promise<OrdenReal> {
    return await apiRequest<OrdenReal>(`/ordenes/${orderId}/notas-admin`, {
      method: "PATCH",
      body: JSON.stringify({ notasAdmin: notas }),
    });
  },

  /**
   * Reembolsar en Mercado Pago vía Backend
   */
  async refundOrder(orderId: string): Promise<{ success: boolean;[key: string]: unknown }> {
    return await apiRequest(`/ordenes/${orderId}/refund`, {
      method: "POST",
    });
  },

  /**
   * Notificar despacho / envío
   */
  async notifyShipment(orderId: string): Promise<OrdenReal> {
    return await apiRequest<OrdenReal>(`/ordenes/${orderId}/despachar`, {
      method: "PATCH",
    });
  },

  /**
   * Cancelación avanzada de orden
   */
  async cancelOrder(
    orderId: string,
    data: { motivo: string; restaurarStock: boolean; enviarEmail: boolean }
  ): Promise<OrdenReal> {
    return await apiRequest<OrdenReal>(`/ordenes/${orderId}/cancelar`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};