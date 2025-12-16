// src/cart/cart.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UnifiedAuthGuard } from 'src/auth/guards/supabase-auth.guard';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
@UseGuards(UnifiedAuthGuard )
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // 🧾 Obtener carrito del usuario
  @Get()
async getCart(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.getCartByUser(userId);
}


    // ➕ Agregar producto
   @Post('add')
async addItem(@Req() req: any, @Body() body: AddItemDto) {
    const userId = req.user.id;
    return this.cartService.addItemToCart(
        userId,
        body.productoId,
        body.quantity
    );
}


    // 🔁 Actualizar cantidad
    @Patch('update/:id')
    async updateQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
        return this.cartService.updateItemQuantity(id, quantity);
    }

    // ❌ Eliminar un ítem
    @Delete('remove/:id')
    async removeItem(@Param('id') id: string) {
        return this.cartService.removeItemFromCart(id);
    }

    // 🧹 Vaciar carrito
  @Delete('clear')
async clear(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
}

}
