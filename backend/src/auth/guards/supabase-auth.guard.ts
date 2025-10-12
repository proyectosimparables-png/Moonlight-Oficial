// src/auth/guards/supabase-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from 'src/lib/supabaseClient';
import { Request } from 'express';
import * as cookie from 'cookie';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // Leer cookies del header
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('Token no encontrado en cookies');
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Token inválido');
    }

    // Guardamos el usuario autenticado en la request
    req['supabaseUser'] = data.user;

    return true;
  }
}
