import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PuntoEntregaService } from './punto-entrega.service';
import { CreatePuntoEntregaDto } from './dto/create-punto-entrega.dto';


@Controller('punto-entrega')
export class PuntoEntregaController {
  puntoService: any;
  constructor(private readonly puntoEntregaService: PuntoEntregaService) {}

  
  @Post()
crear(@Body() createDto: CreatePuntoEntregaDto) {
  return this.puntoEntregaService.crear(createDto);
}

@Patch(':id') // O Put
actualizar(@Param('id') id: string, @Body() updateDto: CreatePuntoEntregaDto) {
  return this.puntoEntregaService.actualizar(id, updateDto);
} 

  @Get()
  obtenerTodos() {
    return this.puntoEntregaService.findAll();
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.puntoEntregaService.eliminar(id);
  }
}