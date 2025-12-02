import { Controller, Post, Delete, Get, Body, Query } from '@nestjs/common';
import { FavoritoService } from './favorito.service';

@Controller('favoritos')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) {}

  @Post('agregar')
  async agregar(@Body() body: { userId: string; productoId: string }) {
    return this.favoritoService.agregarFavorito(body.userId, body.productoId);
  }

  @Delete('eliminar')
  async eliminar(@Query() query: { userId: string; productoId: string }) {
    return this.favoritoService.eliminarFavorito(query.userId, query.productoId);
  }

  @Get('todos')
  async obtenerTodos(@Query() query: { userId: string }) {
    return this.favoritoService.obtenerFavoritos(query.userId);
  }
}
