import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseService {
  transporter: any;
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Crear orden (compra)
  async createOrder(
    userId: string,
    items: { productoId: string; cantidad: number }[],
  ) {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Construir ordenItems y calcular total
    let total = 0;

    const ordenItems: Prisma.OrdenItemCreateWithoutOrdenInput[] = [];

    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!producto) {
        throw new Error(`Producto con id ${item.productoId} no encontrado`);
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

    // Crear la orden con items relacionados
    const orden = await this.prisma.orden.create({
      data: {
        userId,
        estado: 'pendiente',
        total,
        items: { create: ordenItems },
      },
      include: { items: true },
    });

    // Enviar correo de confirmación
    await this.mailService.sendMail(
      user.email,
      'Compra realizada con éxito',
      `
      <h2>Hola ${user.name || 'cliente'}!</h2>
      <p>Tu orden ha sido registrada correctamente.</p>
      <p>Total: $${total}</p>
      <h3>Productos:</h3>
      <ul>
        ${orden.items
          .map(
            (i) => `<li>${i.nombre} x${i.cantidad} - $${i.precio}</li>`,
          )
          .join('')}
      </ul>
      <p>Gracias por tu compra!</p>
      `,
    );

    // Marcar correo enviado
    await this.prisma.orden.update({
      where: { id: orden.id },
      data: { correoEnviado: true },
    });

    return orden;
  }

}
