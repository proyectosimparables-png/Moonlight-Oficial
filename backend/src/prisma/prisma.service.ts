import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    // Evita múltiples instancias en hot reload
    if (!global.prisma) {
      global.prisma = this;
    }
    return global.prisma;
  }
  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }


  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado');
  }

  async enableShutdownHooks() {
    await this.$disconnect();
    console.log('❌ Prisma desconectado');
  }

}



// @ts-ignore
declare global {
  // @ts-ignore
  var prisma: PrismaService;
}

