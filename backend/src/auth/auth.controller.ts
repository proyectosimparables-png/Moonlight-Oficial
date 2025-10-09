// src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { supabase } from 'src/lib/supabaseClient';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('protected')
  async getProtected(@Req() req: Request, @Res() res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Token ausente' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Token malformado' });
      }

      // ✅ Validamos el token con Supabase Auth
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Token inválido' });
      }

      // ✅ El token es válido, sincronizamos usuario en BD
      const dbUser = await this.authService.syncUserWithDatabase(data.user);

      // 🔐 Ocultamos el campo password antes de responder
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

      // 🔐 Ocultamos el campo password antes de responder
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
}
