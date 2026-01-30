// src/historial/historial.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistorialService {
  constructor(private prisma: PrismaService) { }

  /**
   * Obtiene el historial de compras consultando directamente la tabla de Ordenes.
   * Filtra las órdenes en estado 'CARRITO' para mostrar solo compras iniciadas o finalizadas.
   */
  async getUserHistorial(userId: string) {
    // 1. Buscamos las órdenes del usuario excluyendo el estado inicial 'CARRITO'
    const ordenes = await this.prisma.orden.findMany({
      where: {
        userId: userId,
        estado: {
          not: 'CARRITO' // Ignora órdenes que aún no avanzaron al checkout/pago
        }
      },
      include: {
        items: true // Trae los productos (buzos, etc.) para el front
      },
      orderBy: {
        createdAt: 'desc' // Lo más nuevo primero
      },
    });

    // 2. Calculamos el total acumulado solo de las órdenes visibles
    const totalGastado = ordenes.reduce((acc, orden) => acc + (Number(orden.total) || 0), 0);

    // 3. Cantidad de pedidos reales (sin contar carritos abandonados)
    const cantidadPedidos = ordenes.length;

    // Retornamos la data limpia para el componente del Front
    return {
      historial: ordenes,
      total: totalGastado,
      cantidad: cantidadPedidos
    };
  }
}