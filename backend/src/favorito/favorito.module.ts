import { Module } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  controllers: [FavoritoController],
  providers: [FavoritoService, PrismaService],
})
export class FavoritoModule {}
