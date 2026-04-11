// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { LocalAuthModule } from 'src/auth/local/local.module';
/*
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CartController],
  providers: [CartService],
})
  */

@Module({
  imports: [
    PrismaModule,
    LocalAuthModule,  // <-- IMPORTANTE
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }

