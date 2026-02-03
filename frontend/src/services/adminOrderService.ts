const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminOrderService = {
  // Cambiar estado (Empaquetar, Enviar, etc)
  async updateStatus(orderId: string, status: string) {
  const res = await fetch(`${API_URL}/ordenes/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    // Cambia "status" por "nuevoEstado"
    body: JSON.stringify({ nuevoEstado: status }), 
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al actualizar');
  }
  
  return res.json();
},


  async getOrderById(orderId: string) {
    try {
      const res = await fetch(`${API_URL}/ordenes/${orderId}`, {
        cache: 'no-store' // Importante para ver cambios de estado al instante
      });
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      return null;
    }
  },

  // Reembolsar en Mercado Pago vía nuestro Backend
  async refundOrder(orderId: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/refund`, {
      method: 'POST',
    });
    return res.json();
  },


  async notifyShipment(orderId: string) {
    const res = await fetch(`${API_URL}/ordenes/${orderId}/despachar`, {
      method: 'PATCH',
    });
    return res.json();
  }

};



//async function getOrden(id: string) {
//  // 1. Asegurémonos de que la URL sea la correcta. 
//  // Si tu backend corre en el 3000, cámbialo aquí manualmente para probar.
//  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/'; 
//  const url = `${baseUrl}/ordenes/${id}`;
//  
//  console.log("--- INTENTANDO FETCH ---");
//  console.log("URL:", url);
//
//  try {
//    const res = await fetch(url, { 
//      cache: 'no-store',
//      headers: {
//        'Content-Type': 'application/json',
//      }
//    });
//
//    console.log("Status:", res.status);
//
//    if (!res.ok) {
//      const errorText = await res.text();
//      console.error("Error de la API:", errorText);
//      return null;
//    }
//
//    const data = await res.json();
//    console.log("Datos recibidos correctamente de la orden:", data.id);
//    return data;
//  } catch (error) {
//    console.error("Error de conexión (Fetch failed):", error);
//    return null;
//  }
//}