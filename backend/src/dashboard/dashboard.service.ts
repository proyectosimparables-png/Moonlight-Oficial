import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    return this.prisma.orden
      .aggregate({
        _sum: {
          total: true,
        },
        where: {
          estado: 'ENTREGADO', // solo ventas concretadas
          createdAt: {
            gte: inicioMes,
          },
        },
      })
      .then((result) => result._sum.total ?? 0);
  }

  async getVentasRecientes() {
    return this.prisma.orden.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        
      },
    });
  }

 async getProductosPopulares() {
  const populares = await this.prisma.ordenItem.groupBy({
    by: ['productoId', 'nombre'],
    where: {
      productoId: { not: null },
      orden: {
        estado: {
          in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'],
        },
      },
    },
    _sum: {
      cantidad: true,
    },
    orderBy: {
      _sum: {
        cantidad: 'desc',
      },
    },
    take: 5,
  });

  return populares.map((p) => ({
    productoId: p.productoId,
    nombre: p.nombre,
    vendidos: p._sum.cantidad ?? 0,
  }));
}

}
