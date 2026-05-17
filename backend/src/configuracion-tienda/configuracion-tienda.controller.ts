import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';
// import { Public } from 'src/auth/decorators/public.decorator'; // Descomenta si usas este decorador

@Controller('configuracion-tienda')
export class ConfiguracionTiendaController {
  constructor(private readonly configService: ConfiguracionTiendaService) { }

  // --- RUTAS DE MANTENIMIENTO ---

  // Endpoint público para que el Middleware de Next.js sepa si bloquear o no
  // @Public() 
  @Get('publico')
  getPublicConfig() {
    return this.configService.getFullConfig();
  }

  // Actualizar mensaje, código VIP o estado (Solo Admin)
  @Patch('mantenimiento/:id')
  updateMantenimiento(
    @Param('id') id: string,
    @Body() updateData: {
      mantenimientoActivo?: boolean;
      mantenimientoMensaje?: string;
      mantenimientoCodigo?: string
    }
  ) {
    return this.configService.updateMantenimiento(id, updateData);
  }

  // --- RUTAS DE ENVÍO (Las que ya tenías) ---

  @Get('envio')
  findEnvio() {
    return this.configService.findEnvioConfig();
  }

  @Patch('envio/:id')
  updateEnvio(
    @Param('id') id: string,
    @Body() updateData: { montoMinimo?: number; activo?: boolean }
  ) {
    return this.configService.updateEnvio(id, updateData);
  }
}