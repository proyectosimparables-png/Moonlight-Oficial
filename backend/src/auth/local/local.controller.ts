// src/auth/local/local-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  Get,
} from "@nestjs/common";
import { LocalAuthService } from "./local.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { Response } from "express";

@Controller("auth/local")
export class LocalAuthController {
  constructor(
    private service: LocalAuthService,
    private prisma: PrismaService
  ) { }

@Get("me")
async me(@Req() req) {
  const token = req.cookies?.auth_token;
  if (!token) throw new UnauthorizedException("No autenticado");

  const user = await this.service.getUserFromToken(token);
  return { user };
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




@Post("update-address")
async updateAddress(
  @Body() body: { address: string },
  @Req() req,
) {
  const token = req.cookies?.auth_token;
  if (!token) throw new UnauthorizedException("No autenticado");

  const user = await this.service.getUserFromToken(token);

  await this.service.updateAddress(user.id, body.address);

  return { message: "Domicilio actualizado" };
}


}