import { Module } from '@nestjs/common';
import { LocalAuthModule } from './local/local.module';


import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuardsModule } from './auth-guards.module';


@Module({
  imports: [
    PrismaModule,
    LocalAuthModule,
    AuthGuardsModule,  
  ],
   controllers: [AuthController],
  providers: [ AuthService],
 
})
export class AuthModule {}
