import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // Configuración optimizada para Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Usamos el puerto seguro 465
      secure: true, // true para puerto 465
      auth: {
        // Asegúrate de que estas variables en tu .env sean moonlightestampas@gmail.com 
        // y tu contraseña de aplicación de 16 dígitos.
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envía un correo electrónico de forma genérica
   * @param to Destinatario
   * @param subject Asunto del correo
   * @param html Contenido en formato HTML
   */
  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        // El 'from' debe coincidir con el correo autenticado para evitar ir a SPAM
        from: `"Moonlight Estampas" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Correo enviado con éxito a: ${to} (ID: ${info.messageId})`);
      return info;
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      throw error;
    }
  }


  // Agrega esto dentro de tu clase MailService
async sendVerificationCode(to: string, name: string, code: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #6a5acd; text-align: center;">¡Bienvenido a Moonlight Estampas! 🌙</h2>
      <p>Hola <strong>${name}</strong>,</p>
      <p>Gracias por registrarte. Para completar tu registro y asegurar tu cuenta, por favor usa el siguiente código de verificación:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6a5acd; border: 2px dashed #6a5acd; padding: 10px 20px; border-radius: 5px;">
          ${code}
        </span>
      </div>
      <p style="font-size: 0.9em; color: #555;">Este código expirará en 15 minutos.</p>
      <p style="font-size: 0.8em; color: #999; border-top: 1px solid #eee; pt: 10px; margin-top: 20px;">
        Si no solicitaste este registro, puedes ignorar este correo.
      </p>
    </div>
  `;
  return this.sendMail(to, `${code} es tu código de verificación`, html);
}


async sendShippingNotification(to: string, name: string, orderId: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #6a5acd; text-align: center;">¡Tu pedido va en camino! 🚀</h2>
      <p>Hola <strong>${name}</strong>,</p>
      <p>¡Buenas noticias! Tu orden <strong>#${orderId.split('-')[0].toUpperCase()}</strong> ya ha sido despachada y está en manos del correo.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #555;">Muy pronto recibirás tus productos de Moonlight Estampas.</p>
      </div>

      <p>Gracias por confiar en nosotros. ¡Esperamos que disfrutes tu compra! 🌙</p>
      
      <p style="font-size: 0.8em; color: #999; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px;">
        Equipo Moonlight Estampas
      </p>
    </div>
  `;
  return this.sendMail(to, `¡Tu pedido #${orderId.split('-')[0].toUpperCase()} ha sido enviado! 🚀`, html);
}

}