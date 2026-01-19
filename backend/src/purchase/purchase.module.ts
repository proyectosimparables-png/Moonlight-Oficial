import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { PurchaseController } from './purchase.controller';

@Module({
  imports: [MailModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
