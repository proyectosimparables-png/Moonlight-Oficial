// src/auth/guards/local.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['auth_token'];

    if (!token) throw new UnauthorizedException('Token local no encontrado');

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      req['localUser'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token local inválido');
    }
  }
}
