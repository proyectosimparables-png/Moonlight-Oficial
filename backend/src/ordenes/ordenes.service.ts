import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden } from '@prisma/client';
import { CreateOrdeneDto } from './dto/create-ordene.dto';

@Injectable()
export class OrdenesService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.orden.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async crearOrden(dto: CreateOrdeneDto) {
    // 1. Buscamos el carrito del usuario
    const carrito = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
      include: { items: { include: { producto: true } } },
    });

    if (!carrito || carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío o no existe');
    }

    // 2. Calculamos el total basado en la DB
    const totalProductos = carrito.items.reduce((acc, item) => {
      return acc + item.producto.precio * item.quantity;
    }, 0);

    const totalFinal = totalProductos + (dto.costoEnvio || 0);

    // 3. Creamos la orden en una transacción
    return await this.prisma.$transaction(async (tx) => {
      const nuevaOrden = await tx.orden.create({
        data: {
          userId: dto.userId,
          total: totalFinal,
          estado: EstadoOrden.PENDIENTE, // Usando el Enum correctamente
          metodoEnvio: dto.metodoEnvio,
          costoEnvio: dto.costoEnvio,
          direccionEnvio: dto.direccionEnvio,
          items: {
            create: carrito.items.map((item) => ({
              nombre: item.producto.nombre,
              precio: item.producto.precio,
              cantidad: item.quantity,
              productoId: item.productoId,
              imagenUrl: item.producto.imagenUrl,
            })),
          },
        },
      });

      return nuevaOrden;
    });
  }

  async cambiarEstado(id: string, nuevoEstado: EstadoOrden) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });
    if (!orden) throw new NotFoundException('La orden no existe');

    return this.prisma.orden.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  }

  async procesarReembolso(id: string) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });

    if (!orden) throw new NotFoundException('La orden no existe');
    if (!orden.paymentId) throw new BadRequestException('Esta orden no tiene un ID de pago asociado');

    try {
      // Nota: Aquí se integrará el SDK de MP en el futuro
      return await this.prisma.orden.update({
        where: { id },
        data: { estado: EstadoOrden.REEMBOLSADO },
      });
    } catch (error) {
      throw new BadRequestException('Error al procesar el reembolso con Mercado Pago');
    }
  }
}