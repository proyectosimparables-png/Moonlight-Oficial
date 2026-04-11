import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden, MetodoPago, TipoPromocion } from '@prisma/client';
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
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async crearOrden(dto: CreateOrdeneDto) {
    // 1. BUSQUEDA AMPLIADA: Incluimos SECCIONES en la consulta
    const carrito = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
      include: {
        items: {
          include: {
            producto: {
              include: {
                promociones: { where: { activa: true } },
                categoria: {
                  include: { promociones: { where: { activa: true } } }
                },
                secciones: { // 👈 NUEVO: Buscamos las secciones del producto
                  include: {
                    seccion: {
                      include: { promociones: { where: { activa: true } } }
                    }
                  }
                }
              }
            },
          },
        },
      },
    });

    if (!carrito || carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío o no existe');
    }

    const unidadesParaCombos: Map<string, any[]> = new Map();
    const itemsOrden: any[] = [];

    // 2. Primer paso: Identificar promos (Producto, Categoría y SECCIÓN)
    carrito.items.forEach((item, index) => {
      const p = item.producto;
      const precioBase = Number(p.precio);

      // Extraemos las promociones de las secciones
      const promosSecciones = p.secciones.flatMap(ps => ps.seccion.promociones || []);

      // Combinamos todas las fuentes de promociones
      const todasLasPromos = [
        ...(p.promociones || []),
        ...(p.categoria?.promociones || []),
        ...promosSecciones // 👈 NUEVO: Sumamos las promos de sección
      ].sort((a, b) => b.prioridad - a.prioridad);

      // Aplicar descuento directo si existe (%)
      const promoPorcentaje = todasLasPromos.find(pr => pr.tipo === TipoPromocion.PORCENTAJE);
      let precioConDctoDirecto = precioBase;
      if (promoPorcentaje) {
        precioConDctoDirecto = precioBase * (1 - ((promoPorcentaje.valor || 0) / 100));
      }

      // Estructura inicial del item
      const itemProcesado = {
        productoId: p.id,
        nombre: p.nombre,
        precio: precioBase,
        precioFinal: precioConDctoDirecto,
        descuentoTotal: (precioBase - precioConDctoDirecto) * item.quantity,
        cantidad: item.quantity,
        imagenUrl: p.imagenUrl,
        peso: p.peso,
        itemIndex: index
      };
      itemsOrden.push(itemProcesado);

      // Identificar promos de volumen
      const promoVolumen = todasLasPromos.find(pr =>
        pr.tipo === TipoPromocion.CANTIDAD_X_CANTIDAD || pr.tipo === TipoPromocion.SEGUNDA_UNIDAD
      );

      if (promoVolumen) {
        const grupoId = promoVolumen.esCombinable ? promoVolumen.id : `${promoVolumen.id}-${p.id}`;
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

    // 3. Segundo paso: Calcular descuentos por cantidad (2x1, 3x2, etc.)
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

    // 4. Paso Final: Prorratear precios EXACTOS
    itemsOrden.forEach(item => {
      const subtotalConDcto = (item.precio * item.cantidad) - item.descuentoTotal;
      // Usamos un redondeo de 2 decimales para evitar problemas de coma flotante en MP
      item.precioFinal = Math.round((subtotalConDcto / item.cantidad) * 100) / 100;
    });

    // 5. Cálculos de Totales
    const totalProductos = itemsOrden.reduce((acc, i) => acc + (i.precioFinal * i.cantidad), 0);
    let totalFinal = totalProductos + (dto.costoEnvio || 0);

    // Descuento por método de pago
    if (dto.metodoPago === MetodoPago.TRANSFERENCIA) totalFinal *= 0.9;

    // 6. Transacción de Base de Datos
    const nuevaOrden = await this.prisma.$transaction(async (tx) => {
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

  // ... (Resto de métodos findOne, cambiarEstado, etc. quedan igual)
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
}