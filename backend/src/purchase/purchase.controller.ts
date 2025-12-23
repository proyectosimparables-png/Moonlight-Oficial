import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

@Controller('ordenes')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  // Cuando el usuario agrega cosas al carrito por primera vez
  @Post('carrito')
  async startCart(
    @Body() body: { userId: string; items: { productoId: string; cantidad: number }[] },
  ) {
    return this.purchaseService.startCart(body.userId, body.items);
  }

  // Cuando el usuario decide pagar (puedes llamar a esto desde tu webhook de pago)
  @Patch(':id/finalizar')
  async finalize(@Param('id') id: string) {
    return this.purchaseService.finalizeOrder(id);
  }
}