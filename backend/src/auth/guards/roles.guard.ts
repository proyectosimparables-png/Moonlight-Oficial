import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const supabaseUser = request['supabaseUser'];

    if (!supabaseUser?.email) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: supabaseUser.email },
    });

    if (!user) {
      throw new ForbiddenException('Usuario no encontrado en la base de datos');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta ruta'
      );
    }

    return true;
  }
}
