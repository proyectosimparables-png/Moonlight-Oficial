import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class FavoritoService {
  constructor(private prisma: PrismaService) {}

  async agregarFavorito(userId: string, productoId: string) {
    return this.prisma.favorito.upsert({
      where: { userId_productoId: { userId, productoId } },
      update: {},
      create: { userId, productoId },
    });
  }

  async eliminarFavorito(userId: string, productoId: string) {
    return this.prisma.favorito.delete({
      where: { userId_productoId: { userId, productoId } },
    });
  }

  async obtenerFavoritos(userId: string) {
    return this.prisma.favorito.findMany({
      where: { userId },
      include: {
        producto: true,
      },
    });
  }
}
