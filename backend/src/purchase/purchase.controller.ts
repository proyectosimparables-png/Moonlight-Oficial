/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

@Controller('ordenes')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }

  /**
   * Sincroniza el carrito del usuario.
   * Acepta 'varianteId' (nuevo modelo) o 'productoId' (compatibilidad)
   */
  @Post('carrito')
  async startCart(
    @Body() body: { userId: string; items: any[] },
  ) {
    // Mapeamos los items para asegurarnos de enviar 'varianteId' al service
    const itemsProcesados = body.items.map(item => ({
      varianteId: item.varianteId || item.productoId,
      cantidad: item.cantidad
    }));

    return this.purchaseService.startCart(body.userId, itemsProcesados);
  }

  /**
   * Cambia el estado de la orden a PENDIENTE (esperando pago/envío)
   */
  @Patch(':id/finalizar')
  async finalize(@Param('id') id: string) {
    return this.purchaseService.finalizeOrder(id);
  }

  /**
   * Notifica al usuario que su pedido fue despachado
   */
  @Patch(':id/despachar')
  async notifyShipment(@Param('id') id: string) {
    return this.purchaseService.notifyShipment(id);
  }
}