import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';

@Controller('configuracion-tienda')
export class ConfiguracionTiendaController {
  constructor(private readonly configuracionTiendaService: ConfiguracionTiendaService) { }

  @Get()
  findAll() {
    return this.configuracionTiendaService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: { montoMinimo?: number; activo?: boolean }) {
    return this.configuracionTiendaService.update(id, updateData);
  }
}