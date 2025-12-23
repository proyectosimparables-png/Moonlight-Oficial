import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Asegúrate de tener tu PrismaService inyectado
import { EstadoOrden } from '@prisma/client';

@Injectable()
export class OrdenesService {
  constructor(private prisma: PrismaService) {}

  // 1. Cambiar el estado de la orden
  async cambiarEstado(id: string, nuevoEstado: EstadoOrden) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });

    if (!orden) throw new NotFoundException('La orden no existe');

    return this.prisma.orden.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  }

  // 2. Lógica para Reembolso (Mercado Pago)
  async procesarReembolso(id: string) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });

    if (!orden) throw new NotFoundException('La orden no existe');
    if (!orden.paymentId) throw new BadRequestException('Esta orden no tiene un ID de pago asociado');

    try {
      // AQUÍ IRÍA LA LLAMADA AL SDK DE MERCADO PAGO
      // const refund = await mercadopago.payment.refund(orden.paymentId);
      
      // Si el reembolso en MP es exitoso, actualizamos nuestra base de datos
      return await this.prisma.orden.update({
        where: { id },
        data: { estado: EstadoOrden.REEMBOLSADO },
      });
    } catch (error) {
      throw new BadRequestException('Error al procesar el reembolso con Mercado Pago');
    }
  }

  // 3. Obtener todas las órdenes (para tu tabla de administración)
 async findAll() {
  return this.prisma.orden.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      items: true,
    },
    orderBy: {
      createdAt: 'desc', // Las más nuevas primero
    },
  });
}
}