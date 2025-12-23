// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUserWithDatabase(supabaseUser: any) {
    const { id, email } = supabaseUser;

    if (!email || !id) {
      throw new Error('El usuario no tiene email o id');
    }

    const fullName =
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      email.split('@')[0];

    const avatarUrl = supabaseUser.user_metadata?.avatar_url ?? null;

    // Buscar si ya existe en la base de datos
   let user = await this.prisma.user.findUnique({
  where: {  email },
});
    if (!user) {
      // Crear nuevo usuario con avatar
      user = await this.prisma.user.create({
        data: {
          id,
          email,
          password: 'supabase_auth',
          name: fullName,
          image: avatarUrl, // 👈 guardamos la imagen
        } as any,
      });
    } else {
      // Si ya existe, actualizamos su nombre o avatar si cambió
      user = await this.prisma.user.update({
        where: { id },
        data: {
          name: fullName,
          image: avatarUrl,
        } as any,
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
        image: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

async updateAddress(userId: string, address: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { address },
  });
}


}
