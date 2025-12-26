import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
<<<<<<< HEAD
export class PrismaService extends PrismaClient implements OnModuleInit {
=======
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    // Evita múltiples instancias en hot reload
    if (!global.prisma) {
      global.prisma = this;
    }
    return global.prisma;
  }

>>>>>>> e08fc9411680f479c42991371d840a767ab19d9e
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado');
  }

  async enableShutdownHooks() {
    await this.$disconnect();
    console.log('❌ Prisma desconectado');
  }
<<<<<<< HEAD
}
=======
}

// @ts-ignore
declare global {
  // @ts-ignore
  var prisma: PrismaService;
}
>>>>>>> e08fc9411680f479c42991371d840a767ab19d9e
