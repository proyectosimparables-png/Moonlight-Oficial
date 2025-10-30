// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener carrito con productos y datos del usuario
  async getCartByUser(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Si no tiene carrito, crearlo vacío
    if (!cart) {
      return this.prisma.cart.create({
        data: { userId },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          items: {
            include: { producto: true },
          },
        },
      });
    }

    return cart;
  }

  // 🔹 Agregar producto al carrito
  async addItemToCart(userId: string, productoId: string, quantity = 1) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    // Verificar que el producto exista
    const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    // Buscar o crear carrito del usuario
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Verificar si ya existe el item en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productoId },
    });

    if (existingItem) {
      // Si ya existe, actualizamos la cantidad
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Si no existe, lo creamos
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productoId, quantity },
      });
    }

    // 👇 Devolver carrito actualizado
    return this.getCartByUser(userId);
  }

  // 🔹 Actualizar cantidad de un item
  async updateItemQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    // Retornar carrito actualizado (por userId, no por cartId)
    return this.getCartByUser(item.cart.userId);
  }

  // 🔹 Eliminar un item del carrito
  async removeItemFromCart(cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });

    return this.getCartByUser(item.cart.userId);
  }

  // 🔹 Vaciar carrito
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCartByUser(userId);
  }
}
