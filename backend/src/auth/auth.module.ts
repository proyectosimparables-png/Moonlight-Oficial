import { Module } from '@nestjs/common';
import { LocalAuthModule } from './local/local.module';


import { PrismaModule } from 'src/prisma/prisma.module';
import { UnifiedAuthGuard } from './guards/supabase-auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';


@Module({
  imports: [
    PrismaModule,
    LocalAuthModule,   
  ],
   controllers: [AuthController],
  providers: [ UnifiedAuthGuard,AuthService],
 
})
export class AuthModule {}
