// src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  Body,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { supabase } from 'src/lib/supabaseClient';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('set-cookie')
  async setAuthCookie(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: { token: string }
  ) {
    const { token } = body;

    if (!token) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Token ausente' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Token inválido' });
    }

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 días en milisegundos
    });

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Token guardado en cookie segura' });
  }

  @Get('protected')
  async getProtected(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.cookies?.access_token;

      if (!token) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Token ausente en cookie' });
      }
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Token inválido' });
      }

      const dbUser = await this.authService.syncUserWithDatabase(data.user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = dbUser;

      return res.status(HttpStatus.OK).json({
        message: 'Token válido. Usuario sincronizado 🎉',
        user: safeUser,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        error: message,
      });
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    try {
      const supabaseUser = req['supabaseUser'];

      if (!supabaseUser.email) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'El usuario no tiene email asociado',
        });
      }

      const dbUser = await this.authService.findUserByEmail(supabaseUser.email);

      if (!dbUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Usuario no encontrado en la base de datos',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = dbUser;

      return res.status(HttpStatus.OK).json({
        message: 'Usuario autenticado con guard',
        user: safeUser,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        error: message,
      });
    }
  }

  // ✅ Obtener todos los usuarios (solo para admin)
  @UseGuards(SupabaseAuthGuard)
  @Get('usuarios')
  async getAllUsers() {
    try {
      const users = await this.authService.findAllUsers();
      return {
        message: 'Usuarios obtenidos correctamente',
        users,
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error interno del servidor');
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return res.status(HttpStatus.OK).json({ message: 'Sesión cerrada' });
  }
@UseGuards(SupabaseAuthGuard)
@Post('update-address')
async updateAddress(
  @Req() req: Request,
  @Body() body: { address: string }
) {
  const supabaseUser = req['supabaseUser'];

  if (!body.address) {
    return { message: 'La dirección es requerida' };
  }

  const updated = await this.authService.updateAddress(
    supabaseUser.id,
    body.address
  );

  return {
    message: 'Dirección actualizada correctamente',
    user: updated,
  };
}
@UseGuards(SupabaseAuthGuard)
@Post('edit-address')
async editAddress(
  @Req() req: Request,
  @Body() body: { address: string }
) {
  const supabaseUser = req['supabaseUser'];

  if (!body.address) {
    return { message: 'La dirección es requerida' };
  }

  const updated = await this.authService.updateAddress(
    supabaseUser.id,
    body.address
  );

  return {
    message: 'Dirección editada correctamente',
    user: updated,
  };
}


  // Endpoint solo para admins
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  getAdminOnlyData(@Req() req: Request, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Este contenido es solo para usuarios ADMIN',
    });
  }
}
