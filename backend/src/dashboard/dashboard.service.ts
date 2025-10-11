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
        estado: 'pendiente', // ajustá según el estado que consideres activo
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

    return this.prisma.orden.aggregate({
      _sum: {
        total: true,
      },
      where: {
        estado: 'entregado', // solo ventas concretadas
        createdAt: {
          gte: inicioMes,
        },
      },
    }).then(result => result._sum.total ?? 0);
  }

  async getVentasRecientes() {
    return this.prisma.orden.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        producto: true,
      },
    });
  }

  async getProductosPopulares() {
    const populares = await this.prisma.producto.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: { ordenes: true },
        },
      },
      orderBy: {
        ordenes: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return populares.map(p => ({
      nombre: p.nombre,
      vendidos: p._count.ordenes,
    }));
  }
}
