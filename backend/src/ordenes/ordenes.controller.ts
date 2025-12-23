import { Controller, Get, Patch, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { UpdateOrdenStatusDto } from './dto/update-ordene.dto';


@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  // Obtener todas las órdenes
  @Get()
  findAll() {
    return this.ordenesService.findAll();
  }

  // PATCH /ordenes/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrdenStatusDto,
  ) {
    return this.ordenesService.cambiarEstado(id, updateStatusDto.nuevoEstado);
  }

  // POST /ordenes/:id/refund
  @Post(':id/refund')
  refund(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.procesarReembolso(id);
  }
}