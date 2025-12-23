import { Module } from '@nestjs/common';
import { PuntoEntregaService } from './punto-entrega.service';
import { PuntoEntregaController } from './punto-entrega.controller';

@Module({
  controllers: [PuntoEntregaController],
  providers: [PuntoEntregaService],
})
export class PuntoEntregaModule {}
