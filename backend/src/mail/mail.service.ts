import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // Configuración de nodemailer usando variables de entorno
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true si usas 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"Mi Tienda" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Correo enviado a ${to}`);
    } catch (error) {
      console.error('Error enviando correo:', error);
    }
  }


 // método de prueba opcional
  async sendTestMail(to: string) {
    return this.sendMail(to, 'Correo de prueba', '<p>Este es un correo de prueba.</p>');
  }

}
