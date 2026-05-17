// src/comentarios/comentarios.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) { }

  // 🔹 Crear un comentario (Acepta el alias opcional 'nombre')
  async crearComentario(userId: string, contenido: string, nombre?: string) {
    if (!userId || !contenido) {
      throw new BadRequestException('Datos inválidos');
    }

    const comentario = await this.prisma.comentario.create({
      data: {
        userId,
        contenido,
        nombre: nombre?.trim() || null, // Guardamos el alias si el usuario lo ingresó
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

    // Mapeamos la respuesta para que el front reciba el alias directo en 'user.name'
    return this.formatearRespuesta(comentario);
  }

  // 🔹 Obtener los últimos comentarios (limit opcional)
  async obtenerUltimosComentarios(lim?: number) {
    const comentarios = await this.prisma.comentario.findMany({
      take: lim, // si lim es undefined, Prisma devuelve todos
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });

    // Retornamos la lista completa con los alias formateados
    return comentarios.map(c => this.formatearRespuesta(c));
  }

  // 🔹 Eliminar comentario
  async eliminarComentario(id: string) {
    const comentario = await this.prisma.comentario.findUnique({ where: { id } });
    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    return this.prisma.comentario.delete({ where: { id } });
  }

  // 🛠️ Función auxiliar privada para unificar el alias en la propiedad 'user.name'
  private formatearRespuesta(comentario: any) {
    return {
      ...comentario,
      user: {
        ...comentario.user,
        // Si se guardó un alias personalizado, priorizamos ese. 
        // Si no, recurrimos al name base de su cuenta o a su email si está vacío.
        name: comentario.nombre || comentario.user?.name || comentario.user?.email || "Anónimo"
      }
    };
  }
}