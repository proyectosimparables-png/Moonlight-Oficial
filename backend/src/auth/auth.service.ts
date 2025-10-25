// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUserWithDatabase(supabaseUser: any) {
    const { email } = supabaseUser;

    if (!email) {
      throw new Error('El usuario no tiene un email');
    }

    // Paso 1: Buscar si ya existe en la base de datos
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Paso 2: Si no existe, lo creamos
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          // 🔒 Como usamos Supabase, no guardamos password real
          password: 'supabase_auth', // placeholder
          name: supabaseUser.user_metadata?.full_name ?? null, // nombre opcional
        },
      });
    }

    return user;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
