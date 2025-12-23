// src/auth/auth-guards.module.ts
import { Module } from '@nestjs/common';
import { UnifiedAuthGuard } from './guards/supabase-auth.guard';
import { LocalAuthModule } from './local/local.module';

@Module({
  imports: [LocalAuthModule],
  providers: [UnifiedAuthGuard],
  exports: [UnifiedAuthGuard],
})
export class AuthGuardsModule {}
