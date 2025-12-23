// src/historial/historial.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistorialService {
  constructor(private prisma: PrismaService) { }

  // 🔹 Obtener historial de compras de un usuario
  async getUserHistorial(userId: string) {
    const historial = await this.prisma.historial.findMany({
      where: { userId, accion: 'comprado' },
      orderBy: { fecha: 'desc' },
    });

    // 🔹 Calcular total y cantidad con seguridad
    const total = historial.reduce((acc, item) => acc + (item.precio ?? 0), 0);
    const cantidad = historial.length;

    return { historial, total, cantidad };
  }
}
