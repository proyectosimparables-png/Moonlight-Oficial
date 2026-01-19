import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service"; 
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

@Injectable()
export class LocalAuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Verifica el token JWT y recupera el usuario.
   */
  async getUserFromToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no definido en .env");

    try {
      const payload = jwt.verify(token, secret) as { sub: string };
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException("Usuario no encontrado");
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }

  /**
   * REGISTRO: Crea el usuario y envía el código de verificación.
   */
  async register(name: string, email: string, password: string, address: string) {
    // 1. Verificar si el email ya existe
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException("El email ya está registrado");
    }

    // 2. Preparar datos de seguridad
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generar código de 6 dígitos y expiración (15 min)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Crear usuario en la DB
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        address,
        password: hashedPassword,
        isVerified: false, // Importante: empieza sin verificar
        verificationCode,
        verificationCodeExpires: expires,
      },
    });

    // 4. Enviar el email (no bloqueante)
    this.mailService.sendVerificationCode(email, name, verificationCode).catch((err) =>
      console.error("Error enviando email de bienvenida:", err),
    );

    // 5. Generar token para que el usuario ya quede "logueado" pero falte verificar
    return this.generateToken(user.id);
  }

  /**
   * VERIFICACIÓN: Valida el código que el usuario recibió por mail.
   */
  async verifyCode(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new BadRequestException("Usuario no encontrado");
    if (user.isVerified) return { message: "El usuario ya está verificado" };

    // Validar coincidencia
    if (user.verificationCode !== code) {
      throw new BadRequestException("El código es incorrecto");
    }

    // Validar expiración
    if (new Date() > user.verificationCodeExpires !) {
      throw new BadRequestException("El código ha expirado. Pide uno nuevo.");
    }

    // Marcar como verificado
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return { success: true };
  }

  /**
   * LOGIN: Verifica credenciales.
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Credenciales inválidas");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException("Credenciales inválidas");

    // Retornamos el token y también si está verificado para que el front sepa a dónde mandarlo
    const { token } = this.generateToken(user.id);
    return { token, isVerified: user.isVerified };
  }

  /**
   * Generación de JWT.
   */
  generateToken(userId: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no definido en .env");

    const token = jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
    return { token };
  }

  /**
   * Actualizar dirección.
   */
  async updateAddress(userId: string, newAddress: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { address: newAddress },
    });
  }

  // En local.service.ts
async resendVerificationCode(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException("Usuario no encontrado");
  if (user.isVerified) throw new BadRequestException("El usuario ya está verificado");

  // Generar nuevo código
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpires = new Date(Date.now() + 15 * 60 * 1000);

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      verificationCode: newCode,
      verificationCodeExpires: newExpires,
    },
  });

  await this.mailService.sendVerificationCode(user.email, user.name || "Usuario", newCode);
  return { message: "Código reenviado con éxito" };
}


}