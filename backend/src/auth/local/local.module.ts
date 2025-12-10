import { Module } from '@nestjs/common';
import { LocalAuthController} from './local.controller';
import { LocalAuthService} from './local.service';

@Module({
  controllers: [LocalAuthController],
  providers: [LocalAuthService]
})
export class LocalAuthModule {}
