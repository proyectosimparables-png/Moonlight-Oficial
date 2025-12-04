import { Module } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HistorialController],
  providers: [HistorialService, PrismaService],
})
export class HistorialModule {}
