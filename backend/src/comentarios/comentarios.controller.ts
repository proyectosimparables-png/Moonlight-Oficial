// src/comentarios/comentarios.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, UnauthorizedException, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';

import { Request } from 'express';
import { UnifiedAuthGuard } from 'src/auth/guards/supabase-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) { }

  // ✅ Crear un nuevo comentario (solo si está autenticado)
  @Post()
  @UseGuards(UnifiedAuthGuard)
  async crearComentario(
    @Req() req: AuthenticatedRequest,
    @Body('contenido') contenido: string,
    @Body('nombre') nombre?: string, // 👈 Captura el alias del body
  ) {
    const user = req['user'];
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Se lo pasa al servicio con los 3 argumentos correctos
    return this.comentariosService.crearComentario(user.id, contenido, nombre);
  }

  // ✅ Obtener todos los comentarios (público)
  @Get()
  async getComentarios(@Query('limit') limit?: string) {
    const lim = limit ? Number(limit) : undefined; // undefined = todos
    return this.comentariosService.obtenerUltimosComentarios(lim);
  }



  // DELETE /api/comentarios/:id
  @UseGuards(UnifiedAuthGuard)
  @Delete(':id')
  async deleteComentario(@Param('id') id: string) {
    await this.comentariosService.eliminarComentario(id);
    return { message: 'Comentario eliminado' };
  }

}
