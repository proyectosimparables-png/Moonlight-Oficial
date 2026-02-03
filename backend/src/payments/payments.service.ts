import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOrden } from '@prisma/client';

@Injectable()
export class PaymentsService {
    private client: MercadoPagoConfig;

    constructor(private prisma: PrismaService) {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN!,
        });
    }

    async createPreference(ordenId: string) {
        const orden = await this.prisma.orden.findUnique({
            where: { id: ordenId },
            include: { items: true },
        });

        if (!orden) throw new NotFoundException('Orden no encontrada');

        const preference = new Preference(this.client);

        const body = {
            items: orden.items.map((item) => ({
                id: item.id,
                title: item.nombre,
                unit_price: Number(item.precio),
                quantity: item.cantidad,
                currency_id: 'ARS',
            })),
            payer: {
                email: 'test_user_6490245370322727351@testuser.com',
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/payment-success`,
                failure: `${process.env.FRONTEND_URL}/payment-failure`,
                pending: `${process.env.FRONTEND_URL}/payment-pending`,
            },
            notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
            external_reference: orden.id,
        };

        try {
            const response = await preference.create({ body });

            await this.prisma.orden.update({
                where: { id: orden.id },
                data: { preferenceId : response.id },
            });

            return {
                id: response.id,
                init_point: response.init_point,
            };
        } catch (error) {
            console.error('Error MP:', error);
            throw new BadRequestException('Error al conectar con Mercado Pago');
        }
    }

    async handleWebhook(paymentId: string) {
        try {
            const payment = await new Payment(this.client).get({ id: paymentId });
            const ordenId = payment.external_reference;

            if (!ordenId) return { success: false };

            if (payment.status === 'approved') {
                // 1. Buscamos la orden para saber de quién es
                const orden = await this.prisma.orden.findUnique({
                    where: { id: ordenId },
                });

                if (orden) {
                    // Usamos una transacción para asegurar que se actualice la orden Y se limpie el carrito
                    await this.prisma.$transaction(async (tx) => {
                        // 2. Marcamos la orden como PAGADA
                        await tx.orden.update({
                            where: { id: ordenId },
                            data: {
                                estado: EstadoOrden.PAGADO,
                                paymentId: String(paymentId),
                            },
                        });

                        // 3. Buscamos el carrito del usuario y borramos sus ítems
                        const userCart = await tx.cart.findUnique({
                            where: { userId: orden.userId },
                        });

                        if (userCart) {
                            await tx.cartItem.deleteMany({
                                where: { cartId: userCart.id },
                            });
                        }
                    });

                    console.log(`✅ Pago aprobado y carrito limpiado para usuario: ${orden.userId}`);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error Webhook:', error);
            throw new BadRequestException('Error procesando notificación');
        }
    }
}