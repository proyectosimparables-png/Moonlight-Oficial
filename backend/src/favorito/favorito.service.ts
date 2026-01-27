// src/favorito/favorito.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritoService {
  constructor(private prisma: PrismaService) { }

 private formatearProductoFavorito(fav: any) {
    if (!fav.producto) return fav;

    const imagenesUrls = fav.producto.imagenes?.map((img: any) => img.url) || [];
    
    return {
      ...fav,
      producto: {
        ...fav.producto,
        precio: Number(fav.producto.precio),
        imagenUrl: fav.producto.imagenUrl || imagenesUrls[0] || "/images/placeholder.png",
        imagenHoverUrl: imagenesUrls[1] || null, // AQUÍ SE AGREGA LA MAGIA
        imagenes: imagenesUrls,
      }
    };
  }

  async agregarFavorito(userId: string, productoId: string) {
    const favorito = await this.prisma.favorito.upsert({
      where: { userId_productoId: { userId, productoId } },
      update: {},
      create: { userId, productoId },
      include: { producto: { include: { imagenes: true } } }, // VITAL: Incluir imágenes
    });
    return this.formatearProductoFavorito(favorito);
  }

  async obtenerFavoritos(userId: string) {
    const favoritos = await this.prisma.favorito.findMany({
      where: { userId },
      include: { producto: { include: { imagenes: true } } }, // VITAL: Incluir imágenes
    });
    return favoritos.map(fav => this.formatearProductoFavorito(fav));
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

}
