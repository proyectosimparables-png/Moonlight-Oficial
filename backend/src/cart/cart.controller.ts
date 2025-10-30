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
import { SupabaseAuthGuard } from 'src/auth/guards/supabase-auth.guard';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
@UseGuards(SupabaseAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // 🧾 Obtener carrito del usuario
    @Get()
    async getCart(@Req() req: any) {
        const userId = req.supabaseUser.id; // 🔹 usar supabaseUser
        return this.cartService.getCartByUser(userId);
    }

    // ➕ Agregar producto
    @Post('add')
    async addItem(@Req() req: any, @Body() body: AddItemDto) {
        console.log('=== PETICIÓN /cart/add ===');
        console.log('Body recibido:', body);
        console.log('Supabase User:', req.supabaseUser);

        try {
            const userId = req.supabaseUser.id;
            const result = await this.cartService.addItemToCart(
                userId,
                body.productoId,
                body.quantity
            );
            console.log('Producto agregado:', result);
            return result;
        } catch (error) {
            console.error('💥 Error agregando item al carrito:', error);
            throw error; // importante para que el cliente vea el error
        }
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
        const userId = req.supabaseUser.id; // 🔹 usar supabaseUser
        return this.cartService.clearCart(userId);
    }
}
