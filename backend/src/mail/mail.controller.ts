import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Endpoint de prueba
  @Get('test')
  async sendTestMail(@Query('to') to: string) {
    if (!to) return { success: false, message: 'Debes enviar el parámetro "to"' };
    try {
      await this.mailService.sendMail(
        to,
        'Correo de prueba',
        `<p>Hola, este es un correo de prueba enviado desde NestJS</p>`
      );
      return { success: true, message: `Correo enviado a ${to}` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

 // NUEVO ENDPOINT
  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    if (!email) {
      return { success: false, message: "Email requerido" };
    }

    await this.mailService.sendMail(
      "russnataliav@gmail.com",
      "Nuevo suscriptor del Moonlight Club",
      `
        <h2>Nuevo suscriptor</h2>
        <p>Email: <strong>${email}</strong></p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
      `
    );

    return { success: true, message: "Suscripción enviada correctamente" };
  }

}
