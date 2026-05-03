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

    // =========================
    // MERCADO PAGO - CORREGIDO
    // =========================
    async createPreference(ordenId: string) {
        const orden = await this.prisma.orden.findUnique({
            where: { id: ordenId },
            // Ya no necesitamos 'include: { items: true }' porque usamos el total directo
        });

        if (!orden) throw new NotFoundException('Orden no encontrada');

        const preference = new Preference(this.client);

        // Creamos un ítem único que represente el valor final de la orden.
        // Esto garantiza que se cobre el monto exacto (ej. $18.000) 
        // que tu OrdersService calculó con el cupón aplicado.
        const itemsMP = [
            {
                id: orden.id,
                title: `Pedido #${orden.id.slice(-6).toUpperCase()}`,
                unit_price: Number(orden.total),
                quantity: 1,
                currency_id: 'ARS',
            },
        ];

        console.log("DEBUG BACK_URL SUCCESS:", `${process.env.FRONTEND_URL}/payment-success`);

        const body = {
            items: itemsMP,
            payer: {
                email: orden.emailContacto || 'test_user_6490245370322727351@testuser.com'
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/payment-success`,
                failure: `${process.env.FRONTEND_URL}/checkout`,
                pending: `${process.env.FRONTEND_URL}/payment-pending`,
            },
            // auto_return: 'approved', 
            notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
            external_reference: orden.id,
        };

        try {
            const response = await preference.create({ body });

            await this.prisma.orden.update({
                where: { id: orden.id },
                data: { preferenceId: response.id },
            });

            return { id: response.id, init_point: response.init_point };
        } catch (error) {
            console.error('Error MP:', error);
            throw new BadRequestException('Error al conectar con Mercado Pago');
        }
    }

    async handleWebhook(paymentId: string) {
        try {
            const payment = await new Payment(this.client).get({ id: paymentId });
            const ordenId = payment.external_reference;

            if (!ordenId || payment.status !== 'approved') return { success: false };

            const orden = await this.prisma.orden.findUnique({ where: { id: ordenId } });

            if (orden && orden.estado !== EstadoOrden.PAGADO) {
                await this.prisma.$transaction(async (tx) => {
                    await tx.orden.update({
                        where: { id: ordenId },
                        data: {
                            estado: EstadoOrden.PAGADO,
                            paymentId: String(paymentId),
                        },
                    });

                    const userCart = await tx.cart.findUnique({ where: { userId: orden.userId } });
                    if (userCart) {
                        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
                    }
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error Webhook MP:', error);
            throw new BadRequestException('Error procesando notificación');
        }
    }

    // =========================
    // GO CUOTAS
    // =========================

    private async getGoCuotasToken(): Promise<string> {
        const response = await fetch(`${process.env.GOCUOTAS_BASE_URL}/authentication`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.GOCUOTAS_EMAIL,
                password: process.env.GOCUOTAS_PASSWORD,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new BadRequestException('Error de autenticación con GoCuotas');
        return data.token;
    }

    async createGoCuotasCheckout(ordenId: string) {
        const orden = await this.prisma.orden.findUnique({
            where: { id: ordenId },
            include: { user: true },
        });

        if (!orden) throw new NotFoundException('Orden no encontrada');

        const token = await this.getGoCuotasToken();
        const totalFinal = Number(orden.total);

        const body = {
            amount_in_cents: Math.round(totalFinal * 100),
            currency: 'ARS',
            order_reference_id: orden.id,
            email: orden.emailContacto || orden.user?.email,
            phone_number: (orden.telefonoDestinatario || "1100000000").replace(/\D/g, ""),
            url_success: `${process.env.FRONTEND_URL}/payment-success`,
            url_failure: `${process.env.FRONTEND_URL}/payment-failure`,
            webhook_url: `${process.env.BACKEND_URL}/payments/webhook-gocuotas`,
        };

        try {
            const response = await fetch(`${process.env.GOCUOTAS_BASE_URL}/checkouts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new BadRequestException(data?.errors || 'Error al crear checkout');

            return { url: data.url_init };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error con Go Cuotas';
            throw new BadRequestException(errorMessage);
        }
    }

    async handleGoCuotasWebhook(body: any) {
        const { status, order_reference_id, order_id } = body;
        if (status !== 'approved') return { success: true };

        const orden = await this.prisma.orden.findUnique({
            where: { id: order_reference_id },
        });

        if (!orden || orden.estado === EstadoOrden.PAGADO) return { success: true };

        await this.prisma.$transaction(async (tx) => {
            await tx.orden.update({
                where: { id: order_reference_id },
                data: {
                    estado: EstadoOrden.PAGADO,
                    paymentId: String(order_id),
                },
            });

            const cart = await tx.cart.findUnique({ where: { userId: orden.userId } });
            if (cart) {
                await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
        });

        return { success: true };
    }
}