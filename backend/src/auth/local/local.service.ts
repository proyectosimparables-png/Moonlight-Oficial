import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

@Injectable()
export class LocalAuthService {
    constructor(private prisma: PrismaService) { }

    /**
     * @description Verifica el token JWT y recupera el objeto de usuario de la DB.
     * @param token El token JWT (generalmente extraído de la cookie).
     * @returns El objeto de usuario si es válido.
     */
    async getUserFromToken(token: string) {
        const secret = process.env.JWT_SECRET;
    

        if (!secret) throw new Error("JWT_SECRET no definido en .env");

        try {
            // 1. Verificar y decodificar el token
            // El payload tendrá la estructura { sub: userId }
            const payload = jwt.verify(token, secret) as { sub: string, iat: number, exp: number };
            const userId = payload.sub;

            // 2. Buscar el usuario en la base de datos
            const user = await this.prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                // Si el token es válido pero el usuario ya no existe
                throw new UnauthorizedException('Token válido, pero usuario no encontrado');
            }

            // 3. Devolver el usuario
            return user;

        } catch (error) {
            // Captura errores de JWT (ej: token expirado, token alterado)
            throw new UnauthorizedException('Token de autenticación inválido o expirado');
        }
    }

    // --- Métodos de Autenticación Existentes ---

    async register(name: string, email: string, password: string, address: string) {
        // 1. Verificar si el usuario YA existe en Prisma por email
        const exists = await this.prisma.user.findUnique({ where: { email } });

        if (exists) {
            throw new BadRequestException("El email ya está registrado");
        }

        // 2. Crear el ID del usuario manualmente (porque Prisma NO usa default)
        const userId = crypto.randomUUID();
        const hashed = await bcrypt.hash(password, 10);

        // 3. Crear usuario con UPSERT
        const user = await this.prisma.user.upsert({
            where: { id: userId },        // si no existe, lo crea
            update: {},                   // no se actualiza porque no existía
            create: {
                id: userId,               // 🔥 obligatorio en tu schema
                email,
                password: hashed,
                name,
                address,
            },
        });

        return this.generateToken(user.id);
    }


    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) throw new UnauthorizedException("Credenciales inválidas");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new UnauthorizedException("Credenciales inválidas");

        return this.generateToken(user.id);
    }

    generateToken(userId: string) {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET no definido en .env");

        const token = jwt.sign(
            { sub: userId }, // payload
            secret,          // clave secreta
            { expiresIn: "7d" } // duración del token
        );

        return { token };
    }


    async updateAddress(userId: string, newAddress: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { address: newAddress }
        });
    }


}