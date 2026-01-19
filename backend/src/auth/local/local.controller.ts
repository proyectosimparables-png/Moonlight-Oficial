// src/auth/local/local-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
} from "@nestjs/common";
import { LocalAuthService } from "./local.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { Response } from "express";
import { UnifiedAuthGuard } from "../guards/supabase-auth.guard";

@Controller("auth/local")
export class LocalAuthController {
  constructor(
    private service: LocalAuthService,
    private prisma: PrismaService
  ) { }
  @UseGuards(UnifiedAuthGuard)
  @Get("me")
  async me(@Req() req) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });
    return { user: dbUser };

  }


  // 1. ✅ Método Register (Crear Cookie)
  @Post("register")
  async register(
    @Body() body: { name: string; email: string; password: string; address: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const { token } = await this.service.register(
      body.name,
      body.email,
      body.password,
      body.address
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // DOMAIN: 'localhost' ha sido ELIMINADO aquí
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: "Usuario registrado y autenticado", token };
  }

@UseGuards(UnifiedAuthGuard) // Necesitamos que esté logueado (acaba de registrarse)
  @Post("verify-email")
  async verifyEmail(
    @Body() body: { code: string },
    @Req() req
  ) {
    // req.user.id viene del UnifiedAuthGuard
    await this.service.verifyCode(req.user.id, body.code);
    
    return { message: "Email verificado con éxito" };
  }


  // para reenviar el código de verificación
@UseGuards(UnifiedAuthGuard)
@Post("resend-verification")
async resendCode(@Req() req) {
  return await this.service.resendVerificationCode(req.user.id);
}



  // 2. ✅ Método Login (Crear Cookie)
  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const { token } = await this.service.login(body.email, body.password);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: "Login exitoso", token };
  }

  // 3. ✅ Método Logout (Eliminar Cookie)
  @Post("logout")
  logout(@Res() res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: '/',
      maxAge: 0,

    });
    return res.json({ ok: true });
  }



  @UseGuards(UnifiedAuthGuard)
  @Post("update-address")
  async updateAddress(
    @Body() body: { address: string },
    @Req() req,
  ) {
    const token = req.cookies?.auth_token;
    if (!token) throw new UnauthorizedException("No autenticado");

    const user = await this.service.getUserFromToken(token);
    const updated = await this.service.updateAddress(user.id, body.address);

    return {
      message: "Domicilio actualizado",
      user: updated
    };
  }



}