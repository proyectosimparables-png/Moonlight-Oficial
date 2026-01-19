import { Module } from '@nestjs/common';
import { LocalAuthController } from './local.controller';
import { LocalAuthService } from './local.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports: [PrismaModule,MailModule],      
  controllers: [LocalAuthController],
  providers: [LocalAuthService],
  exports: [LocalAuthService],
   
})
export class LocalAuthModule {}
