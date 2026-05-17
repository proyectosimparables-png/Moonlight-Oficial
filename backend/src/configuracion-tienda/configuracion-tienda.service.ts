import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracionTiendaService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    // 1. Inicializar Configuración de Envío
    const countEnvio = await this.prisma.configuracionEnvio.count();
    if (countEnvio === 0) {
      await this.prisma.configuracionEnvio.create({
        data: { montoMinimo: 50000, activo: true },
      });
      console.log('✅ Configuración de envío inicial creada.');
    }

    // 2. Inicializar Configuración de Mantenimiento (La nueva tabla)
    const countTienda = await this.prisma.configuracionTienda.count();
    if (countTienda === 0) {
      await this.prisma.configuracionTienda.create({
        data: {
          mantenimientoActivo: false,
          mantenimientoMensaje: 'Estamos renovando la tienda y está quedando increíble. ¡Volvé en unos días!',
          mantenimientoCodigo: 'MOONLIGHT_VIP',
        },
      });
      console.log('✅ Configuración de mantenimiento inicial creada.');
    }
  }

  // --- MÉTODOS DE MANTENIMIENTO (Para el escudo y el panel admin) ---

  async getFullConfig() {
    return this.prisma.configuracionTienda.findFirst();
  }

  async updateMantenimiento(id: string, data: {
    mantenimientoActivo?: boolean;
    mantenimientoMensaje?: string;
    mantenimientoCodigo?: string
  }) {
    return this.prisma.configuracionTienda.update({
      where: { id },
      data,
    });
  }

  // --- MÉTODOS DE ENVÍO (Los que ya tenías) ---

  async findEnvioConfig() {
    return this.prisma.configuracionEnvio.findFirst();
  }

  async updateEnvio(id: string, data: { montoMinimo?: number; activo?: boolean }) {
    return this.prisma.configuracionEnvio.update({
      where: { id },
      data,
    });
  }
}