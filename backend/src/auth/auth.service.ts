// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async syncUserWithDatabase(supabaseUser: any) {
  const { id, email } = supabaseUser;

  if (!email || !id) {
    throw new Error('El usuario no tiene email o id');
  }

  // Buscar si ya existe en la base de datos
  let user = await this.prisma.user.findUnique({
    where: { id }, // buscamos por el id de Supabase
  });

  // Si no existe, crearlo con el mismo id que Supabase
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        id, // 👈 usamos el mismo id
        email,
        password: 'supabase_auth',
        name: supabaseUser.user_metadata?.full_name ?? null,
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
