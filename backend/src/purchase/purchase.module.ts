import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [PurchaseService, PrismaService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
