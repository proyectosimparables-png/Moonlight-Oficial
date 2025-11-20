import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

@Controller('ordenes')
export class PurchaseController {
  mailService: any;
  constructor(private purchaseService: PurchaseService) {}

  @Post()
  async create(
    @Body() body: { userId: string; items: { productoId: string; cantidad: number }[] },
  ) {
    return this.purchaseService.createOrder(body.userId, body.items);
  }

 

}
