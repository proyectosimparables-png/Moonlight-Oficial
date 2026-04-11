import { Module } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { PromocionController } from './promocion.controller';
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
    imports: [PrismaModule], // Necesario para usar this.prisma en el servicio
    controllers: [PromocionController],
    providers: [PromocionService],
    exports: [PromocionService], // Por si después queremos usar promos en ProductoService
})
export class PromocionModule { }