import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envío genérico
   */
  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Moonlight Estampas" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Correo enviado a: ${to}`);
      return info;
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      throw error;
    }
  }

  /**
   * Notificación de Cancelación (NUEVO)
   */
  async sendOrderCancelledNotification(to: string, name: string, orderId: string, motivo?: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d32f2f; text-align: center;">Tu pedido ha sido cancelado ❌</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Te informamos que tu orden <strong>#${orderId.split('-')[0].toUpperCase()}</strong> ha sido cancelada.</p>
        
        ${motivo ? `
        <div style="background-color: #fff4f4; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #555;"><strong>Motivo de la cancelación:</strong></p>
          <p style="margin: 5px 0 0 0; color: #d32f2f;">${motivo}</p>
        </div>
        ` : ''}

        <p>Si ya habías realizado el pago, nuestro equipo se pondrá en contacto para coordinar el reembolso.</p>
        <p style="font-size: 0.8em; color: #999; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px;">
          Atentamente, Equipo Moonlight Estampas 🌙
        </p>
      </div>
    `;
    return this.sendMail(to, `Actualización Orden #${orderId.split('-')[0].toUpperCase()} - Cancelada`, html);
  }

  /**
   * Código de Verificación
   */
  async sendVerificationCode(to: string, name: string, code: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #6a5acd; text-align: center;">¡Bienvenido! 🌙</h2>
        <p>Hola <strong>${name}</strong>, usa el siguiente código para verificar tu cuenta:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6a5acd; border: 2px dashed #6a5acd; padding: 10px 20px; border-radius: 5px;">
            ${code}
          </span>
        </div>
      </div>
    `;
    return this.sendMail(to, `${code} es tu código de verificación`, html);
  }

  /**
   * Notificación de Envío
   */
  async sendShippingNotification(to: string, name: string, orderId: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #6a5acd; text-align: center;">¡Tu pedido va en camino! 🚀</h2>
        <p>Hola <strong>${name}</strong>, tu orden <strong>#${orderId.split('-')[0].toUpperCase()}</strong> ha sido despachada.</p>
        <p>¡Gracias por confiar en nosotros! 🌙</p>
      </div>
    `;
    return this.sendMail(to, `¡Tu pedido #${orderId.split('-')[0].toUpperCase()} enviado! 🚀`, html);
  }
}