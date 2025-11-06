// src/comentarios/comentarios.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, UnauthorizedException, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard'; 
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // ✅ Crear un nuevo comentario (solo si está autenticado)
@Post()
@UseGuards(SupabaseAuthGuard) // Asegúrate de usar el guard
async crearComentario(
  @Req() req: AuthenticatedRequest,
  @Body('contenido') contenido: string,
) {
  const user = req['supabaseUser']; // 🔹 aquí es supabaseUser
  if (!user) {
    throw new UnauthorizedException('Usuario no autenticado');
  }

  return this.comentariosService.crearComentario(user.id, contenido);
}

  // ✅ Obtener todos los comentarios (público)
  @Get()
  async getComentarios(@Query('limit') limit?: string) {
    const lim = limit ? Number(limit) : undefined; // undefined = todos
    return this.comentariosService.obtenerUltimosComentarios(lim);
  }



  // DELETE /api/comentarios/:id
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async deleteComentario(@Param('id') id: string) {
    await this.comentariosService.eliminarComentario(id);
    return { message: 'Comentario eliminado' };
  }

}
