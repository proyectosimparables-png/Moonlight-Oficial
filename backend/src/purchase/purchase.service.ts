import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EstadoOrden, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * MÉTODO 1: Sincronizar el carrito.
   * Recibe todos los productos que el usuario tiene actualmente en su sesión de frontend.
   */
  async startCart(userId: string, items: { productoId: string; cantidad: number }[]) {
    const carritoExistente = await this.prisma.orden.findFirst({
      where: { userId, estado: EstadoOrden.CARRITO },
    });

    let total = 0;
    const ordenItems: Prisma.OrdenItemCreateWithoutOrdenInput[] = [];

    // Validamos productos y calculamos total
    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({ where: { id: item.productoId } });
      if (!producto) throw new NotFoundException(`Producto ${item.productoId} no encontrado`);

      total += producto.precio * item.cantidad;
      ordenItems.push({
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        productoId: producto.id,
        imagenUrl: producto.imagenUrl ?? '',
      });
    }

    if (carritoExistente) {
      // Actualizamos: reseteamos el flag de email y actualizamos updatedAt
      return await this.prisma.orden.update({
        where: { id: carritoExistente.id },
        data: {
          total,
          carritoAbandonadoEmail: false, // Si agrega algo nuevo, vuelve a ser un carrito "activo"
          updatedAt: new Date(), // Esto reinicia el contador de 24hs
          items: {
            deleteMany: {}, // Limpiamos ítems anteriores para sincronizar
            create: ordenItems,
          },
        },
        include: { items: true },
      });
    }

    // Si no hay carrito, creamos uno nuevo
    return await this.prisma.orden.create({
      data: {
        userId,
        estado: EstadoOrden.CARRITO,
        total,
        items: { create: ordenItems },
      },
      include: { items: true },
    });
  }

  /**
   * MÉTODO 2: Tarea programada (Background Job).
   * Se ejecuta cada hora buscando carritos sin actividad por más de 24 horas.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAbandonedCarts() {
    const hace24h = new Date();
    hace24h.setHours(hace24h.getHours() - 24);

    this.logger.log(`Revisando carritos abandonados desde: ${hace24h.toISOString()}`);

    const carritosAbandonados = await this.prisma.orden.findMany({
      where: {
        estado: EstadoOrden.CARRITO,
        carritoAbandonadoEmail: false,
        updatedAt: { lte: hace24h }, // No modificado en las últimas 24hs
        items: { some: {} }, // Que tenga al menos un producto
      },
      include: { user: true, items: true },
      take: 50, // Procesamos en bloques para evitar sobrecarga
    });

    if (carritosAbandonados.length === 0) return;

    for (const orden of carritosAbandonados) {
      try {
        // 1. Marcamos como enviado PRIMERO para evitar duplicidad en caso de lag
        await this.prisma.orden.update({
          where: { id: orden.id },
          data: { carritoAbandonadoEmail: true },
        });

        // 2. Preparamos el contenido
        const listaProductos = orden.items
          .map((i) => `<li>✨ <strong>${i.nombre}</strong> (x${i.cantidad})</li>`)
          .join('');

        const htmlContent = this.getAbandonedCartTemplate(orden.user.name || 'enamorado del arte', listaProductos);

        // 3. Enviamos el mail
        await this.mailService.sendMail(
          orden.user.email,
          '¿Te olvidaste de algo especial? ✨',
          htmlContent,
        );

        this.logger.log(`Email de abandono enviado a: ${orden.user.email}`);
      } catch (error) {
        this.logger.error(`Error procesando carrito ${orden.id}:`, error);
      }
    }
  }

  /**
   * MÉTODO 3: Finalizar compra.
   */
  async finalizeOrder(ordenId: string) {
    const ordenFinalizada = await this.prisma.orden.update({
      where: { id: ordenId },
      data: { 
        estado: EstadoOrden.PENDIENTE,
        updatedAt: new Date()
      },
      include: { user: true },
    });

    // Limpieza de carritos viejos para evitar correos basura
    await this.prisma.orden.deleteMany({
      where: {
        userId: ordenFinalizada.userId,
        estado: EstadoOrden.CARRITO,
        id: { not: ordenId },
      },
    });

    await this.sendOrderConfirmation(ordenId);
    return ordenFinalizada;
  }

  private async sendOrderConfirmation(ordenId: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { id: ordenId },
      include: { user: true, items: true },
    });

    if (!orden) return;

    const htmlSuccess = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #6a5acd;">¡Gracias por tu compra en Moonlight! 💜</h1>
        <p>Tu orden <strong>#${orden.id.split('-')[0]}</strong> ha sido recibida.</p>
        <p>En breve nos pondremos en contacto para coordinar el envío.</p>
      </div>
    `;

    await this.mailService.sendMail(
      orden.user.email,
      'Confirmación de Compra - Moonlight Estampas',
      htmlSuccess,
    );
  }

  private getAbandonedCartTemplate(name: string, lista: string): string {
    return `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #6a5acd;">¡Tu carrito te extraña en Moonlight! 🌙</h2>
        <p>Hola <strong>${name || 'enamorado del arte'}</strong>,</p>
        <p>Notamos que dejaste algunas cosas especiales. Tus elegidos todavía te están esperando:</p>
        <ul style="list-style: none; padding: 0;">${lista}</ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://tutienda.com/carrito" style="background-color: #6a5acd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Terminar mi compra ahora
          </a>
        </div>
        <p style="font-size: 0.8em; color: #777; margin-top: 30px;">
          Equipo Moonlight Estampas
        </p>
      </div>
    `;
  }
}