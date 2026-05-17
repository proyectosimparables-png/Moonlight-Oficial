// src/ordenes/ordenes.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden, MetodoPago, TipoPromocion } from '@prisma/client';
import { CreateOrdeneDto } from './dto/create-ordene.dto';
import { PaymentsService } from '../payments/payments.service';
import { PromocionService } from 'src/promocion/promocion.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrdenesService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private promocionService: PromocionService,
    private mailService: MailService,
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
            variante: {
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
          }
        }
      }
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

      const promosSecciones = p.secciones.flatMap(ps => ps.seccion.promociones || []);
      const todasLasPromos = [
        ...(p.promociones || []),
        ...(p.categoria?.promociones || []),
        ...promosSecciones
      ].sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));

      const promoPorcentaje = todasLasPromos.find(pr => pr.tipo === TipoPromocion.PORCENTAJE);
      let precioConDctoDirecto = precioBase;
      if (promoPorcentaje) {
        precioConDctoDirecto = precioBase * (1 - ((promoPorcentaje.valor || 0) / 100));
      }

      const nombreCompleto = `${p.nombre}${v.talle ? ' - ' + v.talle : ''}${v.color ? ' - ' + v.color : ''}`;

      const itemProcesado = {
        varianteId: v.id,
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

    // 3. Calcular descuentos por volumen
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
    let descuentoPorCupon = 0;

    if (dto.cuponCodigo) {
      const cupon = await this.promocionService.validarCupon(dto.cuponCodigo, totalProductos);
      if (cupon.tipo === 'PORCENTAJE') {
        descuentoPorCupon = totalProductos * (cupon.valor / 100);
      } else if (cupon.tipo === 'MONTO_FIJO') {
        descuentoPorCupon = cupon.valor;
      }
    }

    let totalFinal = (totalProductos - descuentoPorCupon) + (dto.costoEnvio || 0);

    if (dto.metodoPago === MetodoPago.TRANSFERENCIA) {
      totalFinal *= 0.9;
    }

    // 6. TRANSACCIÓN
    const nuevaOrden = await this.prisma.$transaction(async (tx) => {
      if (dto.cuponCodigo) {
        await tx.cupon.update({
          where: { codigo: dto.cuponCodigo.toUpperCase() },
          data: { usados: { increment: 1 } }
        });
      }

      for (const item of itemsOrden) {
        const varianteStock = await tx.variante.findUnique({
          where: { id: item.varianteId }
        });

        if (!varianteStock || (varianteStock.stock !== null && varianteStock.stock < item.cantidad)) {
          throw new BadRequestException(`Stock insuficiente para la variante ${item.nombre}`);
        }

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

  async cancelarOrden(id: string, dto: { motivo: string; restaurarStock: boolean; enviarEmail: boolean }) {
    const { motivo, restaurarStock, enviarEmail } = dto;

    const ordenActualizada = await this.prisma.$transaction(async (tx) => {
      // 1. Buscamos la orden con sus ítems
      const orden = await tx.orden.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!orden) throw new NotFoundException('La orden no existe');
      if (orden.estado === EstadoOrden.CANCELADO) {
        throw new BadRequestException('La orden ya se encuentra cancelada');
      }

      // 2. Restauración de Stock
      if (restaurarStock) {
        for (const item of orden.items) {
          if (item.varianteId) {
            const variante = await tx.variante.findUnique({
              where: { id: item.varianteId }
            });

            if (variante && variante.stock !== null) {
              await tx.variante.update({
                where: { id: item.varianteId },
                data: { stock: { increment: item.cantidad } }
              });
            }
          }
        }
      }

      // 3. Actualizamos estado
      return await tx.orden.update({
        where: { id },
        data: {
          estado: EstadoOrden.CANCELADO,
          notasAdmin: motivo,
        },
      });
    });

    // 4. Enviar Email (Fuera de la transacción por seguridad)
    if (enviarEmail && ordenActualizada.emailContacto) {
      try {
        await this.mailService.sendOrderCancelledNotification(
          ordenActualizada.emailContacto!,
          ordenActualizada.nombreDestinatario ?? 'Cliente',
          ordenActualizada.id,
          motivo
        );
      } catch (error) {
        console.error("Error al enviar email de cancelación:", error);
      }
    }

    return ordenActualizada;
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