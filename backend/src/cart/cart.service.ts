// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  private calculatePromotions(items: any[]) {
    let subtotalGeneral = 0;
    let totalDescuentoGeneral = 0;

    const flatItems: any[] = [];

    // 1. Aplanamos ítems y unificamos promociones (vía Variante -> Producto)
    items.forEach(item => {
      // Importante: El precio y la info ahora vienen de item.variante.producto
      const producto = item.variante.producto;
      const precioBase = producto.precio;
      subtotalGeneral += precioBase * item.quantity;

      // Unificamos las promociones de todas las fuentes
      const promosDirectas = producto.promociones || [];
      const promosCategoria = producto.categoria?.promociones || [];
      const promosSeccion = producto.categoria?.seccion?.promociones || [];

      const todasLasPromos = [...promosDirectas, ...promosCategoria, ...promosSeccion].filter(
        (v, i, a) => v && a.findIndex(t => t.id === v.id) === i
      );

      for (let i = 0; i < item.quantity; i++) {
        flatItems.push({
          cartItemId: item.id,
          varianteId: item.varianteId, // Usamos varianteId para identificar el producto específico
          precio: precioBase,
          promociones: todasLasPromos
        });
      }
    });

    const unidadesConDescuento = new Set<number>();
    let descuentoAcumulado = 0;

    const sortedItems = [...flatItems].sort((a, b) => b.precio - a.precio);
    const promosAplicadas = new Map<string, any[]>();

    sortedItems.forEach((unit, index) => {
      if (unit.promociones && unit.promociones.length > 0) {
        const mejorPromo = [...unit.promociones].sort((a, b: any) => (b.prioridad || 0) - (a.prioridad || 0))[0];

        if (mejorPromo) {
          const groupId = mejorPromo.esCombinable
            ? mejorPromo.id
            : `${mejorPromo.id}-${unit.varianteId}`;

          if (!promosAplicadas.has(groupId)) {
            promosAplicadas.set(groupId, []);
          }

          const grupo = promosAplicadas.get(groupId);
          if (grupo) {
            grupo.push({ ...unit, indexInSorted: index, promoAsignada: mejorPromo });
          }
        }
      }
    });

    promosAplicadas.forEach((unidadesEnEstaPromo) => {
      const promoData = unidadesEnEstaPromo[0].promoAsignada;

      if (promoData.tipo === 'CANTIDAD_X_CANTIDAD') {
        if (unidadesEnEstaPromo.length >= promoData.lleva) {
          const numGrupos = Math.floor(unidadesEnEstaPromo.length / promoData.lleva);
          const cantADescontar = numGrupos * (promoData.lleva - promoData.paga);

          const aBonificar = unidadesEnEstaPromo.slice(-cantADescontar);
          aBonificar.forEach(u => {
            descuentoAcumulado += u.precio;
            unidadesConDescuento.add(u.indexInSorted);
          });
        }
      }

      else if (promoData.tipo === 'SEGUNDA_UNIDAD') {
        if (unidadesEnEstaPromo.length >= 2) {
          const numPares = Math.floor(unidadesEnEstaPromo.length / 2);
          const porcentaje = (promoData.valor || 0) / 100;

          const aBonificar = unidadesEnEstaPromo.slice(-numPares);
          aBonificar.forEach(u => {
            descuentoAcumulado += (u.precio * porcentaje);
            unidadesConDescuento.add(u.indexInSorted);
          });
        }
      }

      else if (promoData.tipo === 'PORCENTAJE') {
        const porcentaje = Math.min((promoData.valor || 0) / 100, 0.99);
        unidadesEnEstaPromo.forEach(u => {
          descuentoAcumulado += (u.precio * porcentaje);
          unidadesConDescuento.add(u.indexInSorted);
        });
      }
    });

    totalDescuentoGeneral = descuentoAcumulado;

    const itemsConCalculo = items.map(item => {
      const precioBase = item.variante.producto.precio;
      const totalItemBase = precioBase * item.quantity;

      const unidadesBonificadasDeEsteItem = Array.from(unidadesConDescuento).filter(index => {
        return sortedItems[index].cartItemId === item.id;
      });

      let ahorroRealItem = 0;
      unidadesBonificadasDeEsteItem.forEach(index => {
        const unit = sortedItems[index];
        const mejorPromo = [...unit.promociones].sort((a, b: any) => (b.prioridad || 0) - (a.prioridad || 0))[0];

        if (mejorPromo.tipo === 'CANTIDAD_X_CANTIDAD') {
          ahorroRealItem += unit.precio;
        } else if (mejorPromo.tipo === 'SEGUNDA_UNIDAD' || mejorPromo.tipo === 'PORCENTAJE') {
          ahorroRealItem += (unit.precio * ((mejorPromo.valor || 0) / 100));
        }
      });

      return {
        ...item,
        precioOriginal: precioBase,
        ahorroItem: Number(ahorroRealItem.toFixed(2)),
        subtotalItem: Number((totalItemBase - ahorroRealItem).toFixed(2)),
        precioUnitarioVisual: (ahorroRealItem > 0)
          ? Number(((totalItemBase - ahorroRealItem) / item.quantity).toFixed(2))
          : precioBase
      };
    });

    return {
      items: itemsConCalculo,
      resumen: {
        subtotal: Number(subtotalGeneral.toFixed(2)),
        descuentoTotal: Number(totalDescuentoGeneral.toFixed(2)),
        total: Number(Math.max(0, subtotalGeneral - totalDescuentoGeneral).toFixed(2))
      }
    };
  }

  // --- MÉTODOS PÚBLICOS ---

  async getCartByUser(userId: string) {
    const includeQuery = {
      items: {
        include: {
          variante: { // Accedemos a la variante
            include: {
              producto: { // De la variante al producto
                include: {
                  promociones: { where: { activa: true } },
                  categoria: {
                    include: {
                      promociones: { where: { activa: true } },
                      seccion: {
                        include: {
                          promociones: { where: { activa: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: includeQuery,
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: includeQuery,
      });
    }

    const calculos = this.calculatePromotions(cart.items);

    return {
      ...cart,
      items: calculos.items,
      ...calculos.resumen
    };
  }

  async addItemToCart(userId: string, varianteId: string, quantity = 1) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    // Validamos que exista la VARIANTE
    const variante = await this.prisma.variante.findUnique({
      where: { id: varianteId },
      include: { producto: true }
    });
    if (!variante) throw new NotFoundException('Variante de producto no encontrada');

    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });

    // Buscamos si ya existe esta variante en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, varianteId },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, varianteId, quantity },
      });
    }
    return this.getCartByUser(userId);
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    await this.prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    return this.getCartByUser(item.cart.userId);
  }

  async removeItemFromCart(cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCartByUser(item.cart.userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCartByUser(userId);
  }
}