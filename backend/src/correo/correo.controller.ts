import { Body, Controller, Get, Post } from '@nestjs/common';
import { CorreoService } from './correo.service';

@Controller('correo')
export class CorreoController {
    constructor(private readonly correoService: CorreoService) { }

    @Get('test-token')
    async testToken() {
        const token = await this.correoService.getToken();
        return { token };
    }

    @Post('rates')
    async getRates(@Body() body: { cpDestino: string, items: any[] }) {
        return this.correoService.getRates(body.cpDestino, body.items);
    }
}
