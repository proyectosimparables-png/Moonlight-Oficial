// src/favorito/favorito.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritoService {
  constructor(private prisma: PrismaService) { }

  // 🔹 Agregar un favorito (crea o mantiene existente)
  async agregarFavorito(userId: string, productoId: string) {
    return this.prisma.favorito.upsert({
      where: { userId_productoId: { userId, productoId } },
      update: {},
      create: { userId, productoId },
      include: { producto: true },
    });
  }

  // 🔹 Eliminar un favorito
  async eliminarFavorito(userId: string, productoId: string) {
    try {
      return await this.prisma.favorito.delete({
        where: { userId_productoId: { userId, productoId } },
      });
    } catch (e) {
      throw new NotFoundException('Favorito no encontrado');
    }
  }

  // 🔹 Obtener todos los favoritos de un usuario
  async obtenerFavoritos(userId: string) {
    return this.prisma.favorito.findMany({
      where: { userId },
      include: { producto: true },
    });
  }
}
