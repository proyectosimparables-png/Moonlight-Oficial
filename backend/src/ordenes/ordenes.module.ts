import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PromocionModule } from 'src/promocion/promocion.module';
import { MailModule } from 'src/mail/mail.module'; // 👈 1. Importar el módulo

@Module({
  imports: [
    PromocionModule,
    PrismaModule,
    PaymentsModule,
    MailModule, // 👈 2. Agregar a la lista de imports
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
})
export class OrdenesModule { }