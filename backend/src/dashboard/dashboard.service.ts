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
  const ahora = new Date();
  // Creamos el primer día del mes actual a las 00:00:00
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const result = await this.prisma.orden.aggregate({
    _sum: {
      total: true,
    },
    where: {
      // Ajuste de estados: Sumamos todo lo que ya es una venta real
      estado: {
        in: ['PAGADO', 'EMPAQUETADO', 'ENVIADO', 'ENTREGADO'],
      },
      createdAt: {
        gte: inicioMes,
      },
    },
  });

  return result._sum.total ?? 0;
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
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5,
  });

  return Promise.all(
    populares.map(async (p) => {
      // FIX 1: Validamos que productoId exista para evitar el error ts(2322)
      if (!p.productoId) return null;

      const producto = await this.prisma.producto.findUnique({
        where: { id: p.productoId },
        // FIX 2: Usamos include para traer la relación de la tabla Imagen
        include: {
          imagenes: {
            take: 1 // Solo necesitamos la primera imagen para el dashboard
          }
        }
      });

      return {
        productoId: p.productoId,
        nombre: p.nombre,
        vendidos: p._sum.cantidad ?? 0,
        // Si hay imágenes, enviamos la URL de la primera, si no, el campo imagenUrl plano, o null
        imagen: producto?.imagenes[0]?.url || producto?.imagenUrl || null,
      };
    })
  ).then(results => results.filter(item => item !== null)); // Limpiamos nulos por seguridad
}

// dashboard.service.ts
async getResumenGeneral() {
  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

  // Consultas en paralelo para mayor velocidad
  const [totalProd, ordenesAct, totalUsers, ventasAct, ventasAnt, usersAnt] = await Promise.all([
    this.prisma.producto.count(),
    this.prisma.orden.count({ where: { estado: 'PENDIENTE' } }),
    this.prisma.user.count(),
    this.prisma.orden.aggregate({
      _sum: { total: true },
      where: { estado: { in: ['PAGADO', 'ENTREGADO'] }, createdAt: { gte: inicioMesActual } }
    }),
    this.prisma.orden.aggregate({
      _sum: { total: true },
      where: { estado: { in: ['PAGADO', 'ENTREGADO'] }, createdAt: { gte: inicioMesAnterior, lte: finMesAnterior } }
    }),
    this.prisma.user.count({ where: { createdAt: { lt: inicioMesActual } } })
  ]);

  const calcCambio = (act: number, ant: number) => ant === 0 ? 100 : Math.round(((act - ant) / ant) * 100);

  return {
    totalProductos: totalProd,
    ordenesActivas: ordenesAct,
    usuariosRegistrados: totalUsers,
    ventasDelMes: ventasAct._sum.total ?? 0,
    cambioVentas: calcCambio(ventasAct._sum.total ?? 0, ventasAnt._sum.total ?? 0),
    cambioUsuarios: calcCambio(totalUsers - usersAnt, usersAnt)
  };
}
}
