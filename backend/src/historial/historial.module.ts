import { Module } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { LocalAuthModule } from 'src/auth/local/local.module';

@Module({
    imports: [
      PrismaModule,
      AuthModule, 
      LocalAuthModule
    ],
  controllers: [HistorialController],
  providers: [HistorialService],
})
export class HistorialModule {}
