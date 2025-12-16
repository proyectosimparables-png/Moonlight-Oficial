import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as cookie from 'cookie';
import { supabase } from 'src/lib/supabaseClient';
import { LocalAuthService } from '../local/local.service';

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  constructor(private localService: LocalAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const cookies = cookie.parse(req.headers.cookie || '');

    // 1. Tokens posibles
    const supabaseToken = cookies['access_token'];
    const localToken = cookies['auth_token'];

    // 2. Intentar Supabase
    if (supabaseToken) {
      const { data, error } = await supabase.auth.getUser(supabaseToken);

      if (!error && data?.user) {
        req['user'] = {
          id: data.user.id,
          email: data.user.email,
          provider: 'supabase',
        };
        return true;
      }
    }

    // 3. Intentar autenticación local
    if (localToken) {
      try {
        const user = await this.localService.getUserFromToken(localToken);
        req['user'] = {
          id: user.id,
          email: user.email,
          provider: 'local',
        };
        return true;
      } catch (e) {
        throw new UnauthorizedException('Token local inválido');
      }
    }

    // 4. Si no hay ningún token válido
    throw new UnauthorizedException('No autenticado');
  }
}
