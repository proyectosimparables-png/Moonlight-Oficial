import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        // Usamos el nombre de tu marca y el correo que pediste
        from: `"Moonlight Estampas" <moonlightestampas@gmail.com>`,
        to,
        subject,
        html,
      });
      console.log(`Correo enviado a ${to}`);
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw error;
    }
  }
}