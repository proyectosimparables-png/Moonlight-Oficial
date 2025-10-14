import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGuard } from './guards/roles.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
