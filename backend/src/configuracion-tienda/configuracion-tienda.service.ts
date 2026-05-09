import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracionTiendaService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  // Esto crea la configuración por defecto apenas inicia el sistema si no existe
  async onModuleInit() {
    const count = await this.prisma.configuracionEnvio.count();
    if (count === 0) {
      await this.prisma.configuracionEnvio.create({
        data: {
          montoMinimo: 50000,
          activo: true,
        },
      });
      console.log('Configuración de envío inicial creada.');
    }
  }

  async findAll() {
    return this.prisma.configuracionEnvio.findFirst();
  }

  async update(id: string, data: { montoMinimo?: number; activo?: boolean }) {
    return this.prisma.configuracionEnvio.update({
      where: { id },
      data,
    });
  }
}