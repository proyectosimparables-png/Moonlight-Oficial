import { Controller, Post, Put, Param, Body, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateProductoAdminDto } from './dto/create-producto-admin.dto';
import { PublicarProductoDto } from './dto/publicar-producto.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('secciones')
  getSecciones() {
    return this.adminService.getSecciones();
  }

  @Post('productos')
  createProducto(@Body() dto: CreateProductoAdminDto) {
    return this.adminService.createProducto(dto);
  }

  @Put('productos/:id/publicar')
  publicarProducto(@Param('id') id: string, @Body() dto: PublicarProductoDto) {
    return this.adminService.publicarProducto(id, dto);
  }
}
