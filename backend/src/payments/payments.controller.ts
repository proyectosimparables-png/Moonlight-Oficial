import { Controller, Post, Param, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    // Genera el link de pago para el frontend
    @Post('create-preference/:orderId')
    async createPreference(@Param('orderId') orderId: string) {
        return await this.paymentsService.createPreference(orderId);
    }

    // Recibe la notificación de Mercado Pago cuando el pago cambia de estado
    @Post('webhook')
    async handleWebhook(@Body() body: any, @Query() query: any) {
        // Usamos el operador ?. para evitar el error de "undefined"
        const paymentId = body?.data?.id || query['data.id'] || body?.id;

        console.log('🔔 Webhook recibido. ID de pago:', paymentId);

        if (paymentId) {
            return await this.paymentsService.handleWebhook(paymentId);
        }

        return { received: true };
    }

    @Post('create-gocuotas/:orderId')
    async createGoCuotas(@Param('orderId') orderId: string) {
        return await this.paymentsService.createGoCuotasCheckout(orderId);
    }

    // El webhook de Go Cuotas (lo configuraremos en el siguiente paso)
    @Post('webhook-gocuotas')
    async handleGoCuotasWebhook(@Body() body: any) {
        console.log('🔔 Webhook Go Cuotas:', body);
        return await this.paymentsService.handleGoCuotasWebhook(body);
    }

}




