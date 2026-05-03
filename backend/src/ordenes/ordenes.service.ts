// src/ordenes/ordenes.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden, MetodoPago, TipoPromocion } from '@prisma/client';
import { CreateOrdeneDto } from './dto/create-ordene.dto';
import { PaymentsService } from '../payments/payments.service';
import { PromocionService } from 'src/promocion/promocion.service';

@Injectable()
export class OrdenesService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private promocionService: PromocionService,
  ) { }

  async findAll() {
    return this.prisma.orden.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async crearOrden(dto: CreateOrdeneDto) {
    // 1. BUSQUEDA AMPLIADA: Navegamos a través de Variantes
    const carrito = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
      include: {
        items: {
          include: {
            variante: { // 👈 CAMBIO: Entramos por variante
              include: {
                producto: {
                  include: {
                    promociones: { where: { activa: true } },
                    categoria: {
                      include: {
                        promociones: { where: { activa: true } },
                        seccion: { include: { promociones: { where: { activa: true } } } }
                      }
                    },
                    secciones: {
                      include: {
                        seccion: {
                          include: { promociones: { where: { activa: true } } }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        },
      },
    });

    if (!carrito || carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío o no existe');
    }

    const unidadesParaCombos: Map<string, any[]> = new Map();
    const itemsOrden: any[] = [];

    // 2. Procesar ítems y promociones
    carrito.items.forEach((item, index) => {
      const v = item.variante;
      const p = v.producto;
      const precioBase = Number(p.precio);

      // Unificamos promociones de Producto, Categoría y Secciones
      const promosSecciones = p.secciones.flatMap(ps => ps.seccion.promociones || []);
      const todasLasPromos = [
        ...(p.promociones || []),
        ...(p.categoria?.promociones || []),
        ...promosSecciones
      ].sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));

      // Promo de porcentaje directo
      const promoPorcentaje = todasLasPromos.find(pr => pr.tipo === TipoPromocion.PORCENTAJE);
      let precioConDctoDirecto = precioBase;
      if (promoPorcentaje) {
        precioConDctoDirecto = precioBase * (1 - ((promoPorcentaje.valor || 0) / 100));
      }

      // Nombre descriptivo para la orden (incluye talle/color si existen)
      const nombreCompleto = `${p.nombre}${v.talle ? ' - ' + v.talle : ''}${v.color ? ' - ' + v.color : ''}`;

      const itemProcesado = {
        varianteId: v.id, // Guardamos el ID de variante
        nombre: nombreCompleto,
        precio: precioBase,
        precioFinal: precioConDctoDirecto,
        descuentoTotal: (precioBase - precioConDctoDirecto) * item.quantity,
        cantidad: item.quantity,
        imagenUrl: p.imagenUrl,
        peso: p.peso,
        itemIndex: index
      };
      itemsOrden.push(itemProcesado);

      // Promos de volumen (2x1, etc.)
      const promoVolumen = todasLasPromos.find(pr =>
        pr.tipo === TipoPromocion.CANTIDAD_X_CANTIDAD || pr.tipo === TipoPromocion.SEGUNDA_UNIDAD
      );

      if (promoVolumen) {
        const grupoId = promoVolumen.esCombinable ? promoVolumen.id : `${promoVolumen.id}-${v.id}`;
        if (!unidadesParaCombos.has(grupoId)) unidadesParaCombos.set(grupoId, []);

        for (let i = 0; i < item.quantity; i++) {
          unidadesParaCombos.get(grupoId)?.push({
            precio: precioConDctoDirecto,
            itemIndex: index,
            config: promoVolumen
          });
        }
      }
    });

    // 3. Calcular descuentos por volumen (2x1, 3x2, etc.)
    unidadesParaCombos.forEach((unidades) => {
      const config = unidades[0].config;
      unidades.sort((a, b) => a.precio - b.precio);

      if (config.tipo === TipoPromocion.CANTIDAD_X_CANTIDAD) {
        const lleva = config.lleva || 1;
        const paga = config.paga || 1;
        const cantidadRegalos = Math.floor(unidades.length / lleva) * (lleva - paga);

        for (let i = 0; i < cantidadRegalos; i++) {
          const unidadRegalo = unidades[i];
          itemsOrden[unidadRegalo.itemIndex].descuentoTotal += unidadRegalo.precio;
        }
      }
      else if (config.tipo === TipoPromocion.SEGUNDA_UNIDAD) {
        const descuentoSegunda = (config.valor || 0) / 100;
        const parejas = Math.floor(unidades.length / 2);

        for (let i = 0; i < parejas; i++) {
          const unidadDcto = unidades[i];
          itemsOrden[unidadDcto.itemIndex].descuentoTotal += (unidadDcto.precio * descuentoSegunda);
        }
      }
    });

    // 4. Redondeo final
    itemsOrden.forEach(item => {
      const subtotalConDcto = (item.precio * item.cantidad) - item.descuentoTotal;
      item.precioFinal = Math.round((subtotalConDcto / item.cantidad) * 100) / 100;
    });

    // 5. Totales
    const totalProductos = itemsOrden.reduce((acc, i) => acc + (i.precioFinal * i.cantidad), 0);

    // --- LÓGICA DE CUPÓN ---
    let descuentoPorCupon = 0;

    if (dto.cuponCodigo) {
      // Validamos el cupón (ya verifica si existe, si está activo y el monto mínimo)
      const cupon = await this.promocionService.validarCupon(dto.cuponCodigo, totalProductos);

      if (cupon.tipo === 'PORCENTAJE') {
        descuentoPorCupon = totalProductos * (cupon.valor / 100);
      } else if (cupon.tipo === 'MONTO_FIJO') {
        descuentoPorCupon = cupon.valor;
      }
    }

    // Calculamos el total final: (Productos - Cupón) + Envío
    // Usamos "let" una sola vez aquí
    let totalFinal = (totalProductos - descuentoPorCupon) + (dto.costoEnvio || 0);

    // Descuento extra por transferencia (sobre el total ya rebajado por el cupón)
    if (dto.metodoPago === MetodoPago.TRANSFERENCIA) {
      totalFinal *= 0.9;
    }

    // 6. TRANSACCIÓN: Crear orden, descontar stock y limpiar carrito
    const nuevaOrden = await this.prisma.$transaction(async (tx) => {
      if (dto.cuponCodigo) {
        await tx.cupon.update({
          where: { codigo: dto.cuponCodigo.toUpperCase() },
          data: { usados: { increment: 1 } }
        });
      }
      // VALIDAR Y DESCONTAR STOCK
      for (const item of itemsOrden) {
        const varianteStock = await tx.variante.findUnique({
          where: { id: item.varianteId }
        });

        // 1. Verificamos que la variante exista
        // 2. Si el stock NO es null (es limitado), verificamos que alcance
        if (!varianteStock || (varianteStock.stock !== null && varianteStock.stock < item.cantidad)) {
          throw new BadRequestException(`Stock insuficiente para la variante ${item.nombre}`);
        }

        // 🔥 CORRECCIÓN AQUÍ: Solo descontamos si NO es infinito (null)
        if (varianteStock.stock !== null) {
          await tx.variante.update({
            where: { id: item.varianteId },
            data: { stock: { decrement: item.cantidad } }
          });
        }
      }

      const orden = await tx.orden.create({
        data: {
          userId: dto.userId,
          total: Number(totalFinal.toFixed(2)),
          estado: EstadoOrden.PENDIENTE,
          metodoPago: dto.metodoPago,
          emailContacto: dto.emailContacto,
          nombreDestinatario: dto.nombreDestinatario,
          apellidoDestinatario: dto.apellidoDestinatario,
          dniDestinatario: dto.dniDestinatario,
          telefonoDestinatario: dto.telefonoDestinatario,
          metodoEnvio: dto.metodoEnvio,
          costoEnvio: dto.costoEnvio,
          productType: dto.productType,
          deliveredType: dto.deliveredType,
          codigoPostal: dto.codigoPostal,
          provincia: dto.provincia,
          localidad: dto.localidad,
          calle: dto.calle,
          numero: dto.numero,
          piso: dto.piso,
          departamento: dto.departamento,
          notasEntrega: dto.notasEntrega,
          items: {
            create: itemsOrden.map(({ itemIndex, ...rest }) => rest),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: carrito.id } });
      return orden;
    });

    // 7. Integración con Pasarelas
    if (dto.metodoPago === MetodoPago.MERCADO_PAGO) {
      try {
        const preferencia = await this.paymentsService.createPreference(nuevaOrden.id);
        return { ...nuevaOrden, init_point: preferencia.init_point };
      } catch (error) {
        throw new BadRequestException('Error al generar pago con Mercado Pago');
      }
    }

    if (dto.metodoPago === MetodoPago.GO_CUOTAS) {
      try {
        const checkout = await this.paymentsService.createGoCuotasCheckout(nuevaOrden.id);
        return { ...nuevaOrden, init_point: checkout.url };
      } catch (error) {
        throw new BadRequestException('Error al generar pago con GoCuotas');
      }
    }

    return nuevaOrden;
  }

  async findOne(id: string) {
    const orden = await this.prisma.orden.findUnique({
      where: { id },
      include: { user: true, items: true },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  async cambiarEstado(id: string, nuevoEstado: EstadoOrden) {
    return this.prisma.orden.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  }

  async procesarReembolso(id: string) {
    const orden = await this.prisma.orden.findUnique({ where: { id } });
    if (!orden) throw new NotFoundException('La orden no existe');
    return this.prisma.orden.update({
      where: { id },
      data: { estado: EstadoOrden.REEMBOLSADO },
    });
  }

  async cancelarOrden(id: string) {
    return this.prisma.orden.update({
      where: { id },
      data: { estado: EstadoOrden.CANCELADO },
    });
  }

  async actualizarNotasAdmin(id: string, notasAdmin: string) {
    try {
      return await this.prisma.orden.update({
        where: { id },
        data: { notasAdmin },
      });
    } catch (error) {
      throw new BadRequestException('No se pudo actualizar la nota de la orden');
    }
  }
}