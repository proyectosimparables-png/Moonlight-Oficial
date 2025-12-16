import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { LocalAuthModule } from 'src/auth/local/local.module';

@Module({
    imports: [
      PrismaModule,
      AuthModule, 
      LocalAuthModule
    ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
