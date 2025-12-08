// src/comentarios/comentarios.service.ts
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) { }

  // 🔹 Crear un comentario
  async crearComentario(userId: string, contenido: string) {
    if (!userId || !contenido) {
      throw new BadRequestException('Datos inválidos');
    }

    return this.prisma.comentario.create({
      data: {
        userId,
        contenido,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  // 🔹 Obtener los últimos comentarios (limit opcional)
  async obtenerUltimosComentarios(lim?: number) {
    return this.prisma.comentario.findMany({
      take: lim, // si lim es undefined, Prisma devuelve todos
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });
  }

  // 🔹 Eliminar comentario
  async eliminarComentario(id: string, userId?: string) {
    const comentario = await this.prisma.comentario.findUnique({ where: { id } });
    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    // 🔒 Para limitar solo al autor, descomentar la siguiente línea
    // if (comentario.userId !== userId) throw new ForbiddenException('No puedes eliminar este comentario');

    return this.prisma.comentario.delete({ where: { id } });
  }
}
