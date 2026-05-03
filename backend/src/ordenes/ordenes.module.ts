import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PromocionModule } from 'src/promocion/promocion.module';

@Module({
  imports: [
    PromocionModule,
    PrismaModule,
    PaymentsModule,
  ],

  controllers: [OrdenesController],
  providers: [OrdenesService],
})
export class OrdenesModule { }
