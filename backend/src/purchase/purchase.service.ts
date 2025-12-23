import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EstadoOrden, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // MÉTODO 1: Iniciar el carrito (Cuando el usuario agrega productos)
  async startCart(userId: string, items: { productoId: string; cantidad: number }[]) {
    let total = 0;
    
    // CORRECCIÓN: Definimos el tipo del array para que no sea 'never'
    const ordenItems: Prisma.OrdenItemCreateWithoutOrdenInput[] = [];

    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({ where: { id: item.productoId } });
      
      if (!producto) {
        throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
      }
      
      total += producto.precio * item.cantidad;
      
      ordenItems.push({
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        productoId: producto.id,
        imagenUrl: producto.imagenUrl ?? '',
      });
    }

    // Creamos la orden en estado CARRITO
    return await this.prisma.orden.create({
      data: {
        userId,
        estado: EstadoOrden.CARRITO,
        total,
        items: { 
            create: ordenItems 
        },
        carritoCreadoEn: new Date(),
      },
      include: { items: true }
    });
  }

  // MÉTODO 2: Tarea programada para carrito abandonado
@Cron(CronExpression.EVERY_MINUTE) // Revisamos cada minuto para que sea rápido
async checkAbandonedCarts() {
  const hace2M = new Date();
  hace2M.setMinutes(hace2M.getMinutes() - 2);

  const carritosAbandonados = await this.prisma.orden.findMany({
    where: {
      estado: 'CARRITO', 
      carritoAbandonadoEmail: false, 
      createdAt: { lte: hace2M }, 
    },
    include: { user: true, items: true },
    
  });
  console.log(`Carritos encontrados: ${carritosAbandonados.length}`);

    for (const orden of carritosAbandonados) {
      const listaProductos = orden.items
        .map(i => `<li>✨ ${i.nombre} (x${i.cantidad})</li>`)
        .join('');

      const htmlContent = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #6a5acd;">¡Tu carrito te extraña en Moonlight! 🌙</h2>
          <p>Hola <strong>${orden.user.name || 'enamorado del arte'}</strong>,</p>
          <p>Notamos que dejaste algunas cosas especiales en tu carrito. Pasábamos por aquí para recordarte que tus elegidos todavía te están esperando.</p>
          <p>Esto es lo que guardaste:</p>
          <ul style="list-style: none; padding: 0;">${listaProductos}</ul>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://tutienda.com/carrito" style="background-color: #6a5acd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Terminar mi compra ahora
            </a>
          </div>
          <p style="font-size: 0.9em; color: #777; margin-top: 30px;">
            Si tienes alguna duda, responde a este correo. ¡Estamos para ayudarte!<br>
            <strong>Equipo Moonlight Estampas</strong>
          </p>
        </div>
      `;

      try {
        await this.mailService.sendMail(
          orden.user.email, 
          '¿Te olvidaste de algo especial? ✨', 
          htmlContent
        );
        
        await this.prisma.orden.update({
          where: { id: orden.id },
          data: { carritoAbandonadoEmail: true },
        });
      } catch (error) {
        console.error(`Error enviando mail de abandono a ${orden.user.email}:`, error);
      }
    }
  }

  // MÉTODO 3: Finalizar compra
  async finalizeOrder(ordenId: string) {
    return await this.prisma.orden.update({
      where: { id: ordenId },
      data: { estado: EstadoOrden.PENDIENTE }
    });
  }




async sendOrderConfirmation(ordenId: string) {
  const orden = await this.prisma.orden.findUnique({
    where: { id: ordenId },
    include: { user: true, items: true }
  });

  if (!orden) return;

  const htmlSuccess = `
    <h1>¡Gracias por tu compra en Moonlight! 💜</h1>
    <p>Tu orden #${orden.id} ha sido procesada con éxito.</p>
    <p>Pronto prepararemos tus estampas.</p>
  `;

  await this.mailService.sendMail(
    orden.user.email,
    'Confirmación de Compra - Moonlight Estampas',
    htmlSuccess
  );
}
}