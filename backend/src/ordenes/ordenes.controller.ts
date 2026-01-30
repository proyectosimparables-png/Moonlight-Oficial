import { Controller, Get, Patch, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { UpdateOrdenStatusDto } from './dto/update-ordene.dto';
import { CreateOrdeneDto } from './dto/create-ordene.dto'; // Importación agregada

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) { }

  @Get()
  findAll() {
    return this.ordenesService.findAll();
  }

  @Post()
  async create(@Body() createOrdeneDto: CreateOrdeneDto) {
    return this.ordenesService.crearOrden(createOrdeneDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrdenStatusDto,
  ) {
    return this.ordenesService.cambiarEstado(id, updateStatusDto.nuevoEstado);
  }

  @Post(':id/refund')
  refund(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenesService.procesarReembolso(id);
  }
}