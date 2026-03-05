import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden, MetodoPago } from '@prisma/client';
import { CreateOrdeneDto } from './dto/create-ordene.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdenesService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) { }

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

    // 2. Calculamos totales
    const totalProductos = carrito.items.reduce((acc, item) => {
      return acc + item.producto.precio * item.quantity;
    }, 0);

    let totalFinal = totalProductos + (dto.costoEnvio || 0);

    if (dto.metodoPago === MetodoPago.TRANSFERENCIA) {
      totalFinal = totalFinal * 0.90;
    }

    // 3. TRANSACCIÓN DE BASE DE DATOS (Solo para persistencia)
    const nuevaOrden = await this.prisma.$transaction(async (tx) => {
      const orden = await tx.orden.create({
        data: {
          userId: dto.userId,
          total: totalFinal,
          estado: EstadoOrden.PENDIENTE,
          metodoPago: dto.metodoPago,
          emailContacto: dto.emailContacto,
          nombreDestinatario: dto.nombreDestinatario,
          apellidoDestinatario: dto.apellidoDestinatario,
          dniDestinatario: dto.dniDestinatario,
          telefonoDestinatario: dto.telefonoDestinatario,
          metodoEnvio: dto.metodoEnvio,
          productType: dto.productType,
          deliveredType: dto.deliveredType,
          costoEnvio: dto.costoEnvio,
          codigoPostal: dto.codigoPostal,
          provincia: dto.provincia,
          localidad: dto.localidad,
          calle: dto.calle,
          numero: dto.numero,
          piso: dto.piso,
          departamento: dto.departamento,
          notasEntrega: dto.notasEntrega,
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

      // Vaciamos el carrito
      /* await tx.cartItem.deleteMany({
         where: { cartId: carrito.id },
       });
 */
      return orden;
    });

    // 4. LÓGICA DE MERCADO PAGO (FUERA DE LA TRANSACCIÓN)
    // Al estar fuera, la orden ya fue confirmada (commit) en la DB
    if (dto.metodoPago === MetodoPago.MERCADO_PAGO) {
      try {
        const preferencia = await this.paymentsService.createPreference(nuevaOrden.id);

        return {
          ...nuevaOrden,
          init_point: preferencia.init_point,
        };
      } catch (error) {
        console.error("ERROR DETALLADO DE MERCADO PAGO:", error);
        // Lanzamos el error con el mensaje real para debuggear
        throw new BadRequestException(`Error en Mercado Pago: ${error.message || 'Fallo al conectar'}`);
      }
    }

    // Retorno normal para otros métodos de pago
    return nuevaOrden;
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
      return await this.prisma.orden.update({
        where: { id },
        data: { estado: EstadoOrden.REEMBOLSADO },
      });
    } catch (error) {
      throw new BadRequestException('Error al procesar el reembolso');
    }
  }


  async cancelarOrden(id: string) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });
    if (!orden) throw new NotFoundException('La orden no existe');

    // Si quieres que al cancelar se devuelva el stock (opcional pero recomendado)
    // deberías iterar los items y sumarlos al producto.

    return this.prisma.orden.update({
      where: { id },
      data: { estado: EstadoOrden.CANCELADO },
    });
  }

  async findOne(id: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { id },
      include: {
        user: true,
        items: true, // Esto trae nombre, precio, cantidad e imagenUrl
      },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }
}