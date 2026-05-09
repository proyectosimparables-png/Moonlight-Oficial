import { Module } from '@nestjs/common';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';
import { ConfiguracionTiendaController } from './configuracion-tienda.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionTiendaController],
  providers: [ConfiguracionTiendaService],
})
export class ConfiguracionTiendaModule { }