import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getTotalProductos(): Promise<number> {
    return this.prisma.producto.count();
  }

  async getOrdenesActivas(): Promise<number> {
    return this.prisma.orden.count({
      where: {
        estado: 'PENDIENTE',
      },
    });
  }

  async getUsuariosRegistrados(): Promise<number> {
    return this.prisma.user.count();
  }

  async getVentasDelMes(): Promise<number> {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const result = await this.prisma.orden.aggregate({
      _sum: { total: true },
      where: {
        estado: { in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'] },
        createdAt: { gte: inicioMes },
      },
    });

    return result._sum.total ?? 0;
  }

  async getVentasRecientes() {
    return this.prisma.orden.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
      },
    });
  }

  async getProductosPopulares() {
    const itemsVendidos = await this.prisma.ordenItem.findMany({
      where: {
        varianteId: { not: null },
        orden: {
          estado: { in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'] },
        },
      },
      include: {
        variante: {
          include: {
            producto: {
              include: { imagenes: { take: 1 } }
            }
          }
        }
      }
    });

    const agrupado = itemsVendidos.reduce((acc: any, item) => {
      if (!item.variante || !item.variante.producto) return acc;

      const pId = item.variante.productoId;

      if (!acc[pId]) {
        acc[pId] = {
          productoId: pId,
          nombre: item.variante.producto.nombre,
          vendidos: 0,
          imagen: item.variante.producto.imagenes[0]?.url || item.variante.producto.imagenUrl || null,
        };
      }

      acc[pId].vendidos += item.cantidad;
      return acc;
    }, {});

    return Object.values(agrupado)
      .sort((a: any, b: any) => b.vendidos - a.vendidos)
      .slice(0, 5);
  }

  async getResumenGeneral() {
    const ahora = new Date();
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

    const [
      totalProd,
      ordenesAct,
      totalUsers,
      ventasAct,
      ventasAnt,
      usersAnt,
      populares,
      recientes
    ] = await Promise.all([
      this.prisma.producto.count(),
      this.prisma.orden.count({ where: { estado: 'PENDIENTE' } }),
      this.prisma.user.count(),
      this.prisma.orden.aggregate({
        _sum: { total: true },
        where: {
          estado: { in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'] },
          createdAt: { gte: inicioMesActual }
        }
      }),
      this.prisma.orden.aggregate({
        _sum: { total: true },
        where: {
          estado: { in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'] },
          createdAt: { gte: inicioMesAnterior, lte: finMesAnterior }
        }
      }),
      this.prisma.user.count({ where: { createdAt: { lt: inicioMesActual } } }),
      this.getProductosPopulares(),
      this.getVentasRecientes()
    ]);

    // Función interna robusta para evitar el "undefined"
    const calcCambio = (act: any, ant: any) => {
      const actual = Number(act) || 0;
      const anterior = Number(ant) || 0;
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100);
    };

    return {
      totalProductos: totalProd,
      ordenesActivas: ordenesAct,
      usuariosRegistrados: totalUsers,
      ventasDelMes: Number(ventasAct._sum.total ?? 0),
      cambioVentas: calcCambio(ventasAct._sum.total ?? 0, ventasAnt._sum.total ?? 0),
      cambioUsuarios: calcCambio(totalUsers - usersAnt, usersAnt),
      productosPopulares: populares,
      ventasRecientes: recientes
    };
  }
}