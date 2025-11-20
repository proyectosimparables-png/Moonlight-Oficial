import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailTestService {
  private transporter;

  constructor() {
    // Configuración de nodemailer usando variables de entorno
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true si usas puerto 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Método para enviar correo de prueba
  async sendTestMail(to: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"NestJS Test" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Correo de prueba desde NestJS',
        html: `<h1>¡Hola!</h1><p>Este es un correo de prueba desde tu aplicación NestJS.</p>`,
      });

      console.log(`Correo enviado a ${to} - MessageId: ${info.messageId}`);
      return `Correo enviado a ${to}`;
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw error;
    }
  }
}
