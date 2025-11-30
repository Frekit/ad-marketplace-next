import { colors } from './colors';

// Intentar cargar SendGrid, si no está disponible, usar fallback
let sgMail: any = null;

try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (error) {
  console.warn('[Email] SendGrid not available, will use console logging');
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    // Si no hay API key o SendGrid no está disponible, solo loguear
    if (!process.env.SENDGRID_API_KEY || !sgMail) {
      console.warn('[Email] SendGrid not configured. Logging email instead.');
      console.log(`[Email Mock] To: ${options.to}`);
      console.log(`[Email Mock] Subject: ${options.subject}`);
      console.log(`[Email Mock] Preview: ${options.html.substring(0, 100)}...`);
      return true; // Retornar true para no bloquear el flujo
    }

    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@malt.com',
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    };

    const response = await sgMail.send(msg as any);
    console.log('[SendGrid] Email enviado:', {
      to: options.to,
      messageId: (response[0].headers as any)['x-message-id'],
    });
    return true;
  } catch (error) {
    console.error('[Email] Error enviando email:', error);
    // Retornar true de todas formas para no bloquear el flujo
    return true;
  }
}

// Templates de email
export const emailTemplates = {
  projectInvitation: (data: {
    freelancerName: string;
    companyName: string;
    projectTitle: string;
    duration: number;
    rate: number;
    total: number;
    linkToProposal: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${colors.secondary}; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { margin: 20px 0; }
          .terms { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${colors.primary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>¡Nueva invitación a proyecto!</h2>
          </div>

          <div class="content">
            <p>Hola ${data.freelancerName},</p>
            <p><strong>${data.companyName}</strong> te ha invitado a participar en:</p>
            <h3>${data.projectTitle}</h3>

            <div class="terms">
              <h4>Términos propuestos:</h4>
              <ul>
                <li><strong>Duración:</strong> ${data.duration} jornadas</li>
                <li><strong>Tarifa:</strong> €${data.rate}/jornada</li>
                <li><strong>Presupuesto total:</strong> €${data.total}</li>
              </ul>
            </div>

            <p>Puedes aceptar la propuesta, negociar los términos en el chat, o rechazarla.</p>

            <a href="${data.linkToProposal}" class="button">Ver propuesta y responder</a>
          </div>

          <div class="footer">
            <p>No responda a este email. Responda en la plataforma malt.</p>
            <p>&copy; 2025 malt - Ad Marketplace</p>
          </div>
        </div>
      </body>
    </html>
  `,

  proposalResponse: (data: {
    companyName: string;
    freelancerName: string;
    projectTitle: string;
    linkToOffers: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${colors.primary}; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${colors.secondary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Freelancer respondió a tu propuesta</h2>
          </div>

          <div class="content">
            <p>Hola ${data.companyName},</p>
            <p><strong>${data.freelancerName}</strong> ha respondido a tu invitación para:</p>
            <h3>${data.projectTitle}</h3>
            <p>Revisa su oferta, negocia si es necesario, o acepta los términos propuestos.</p>

            <a href="${data.linkToOffers}" class="button">Ver respuesta</a>
          </div>

          <div class="footer">
            <p>No responda a este email. Responda en la plataforma malt.</p>
            <p>&copy; 2025 malt - Ad Marketplace</p>
          </div>
        </div>
      </body>
    </html>
  `,

  offerAccepted: (data: {
    freelancerName: string;
    projectTitle: string;
    total: number;
    linkToProject: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${colors.success}; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { margin: 20px 0; }
          .amount { background-color: #f5f5f5; padding: 20px; border-left: 4px solid ${colors.success}; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${colors.success}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>¡Tu oferta fue aceptada!</h2>
          </div>

          <div class="content">
            <p>¡Felicidades ${data.freelancerName}!</p>
            <p>Tu oferta para <strong>${data.projectTitle}</strong> fue aceptada.</p>

            <div class="amount">
              <h3 style="margin-top: 0;">Presupuesto bloqueado: €${data.total}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">Los fondos están en escrow y se liberarán conforme completes los hitos.</p>
            </div>

            <p>El proyecto ya está activo. Puedes ver los hitos y empezar a trabajar.</p>

            <a href="${data.linkToProject}" class="button">Ver proyecto activo</a>
          </div>

          <div class="footer">
            <p>No responda a este email. Responda en la plataforma malt.</p>
            <p>&copy; 2025 malt - Ad Marketplace</p>
          </div>
        </div>
      </body>
    </html>
  `,

  chatMessage: (data: {
    senderName: string;
    projectTitle: string;
    message: string;
    linkToChat: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${colors.secondary}; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { margin: 20px 0; }
          .message { background-color: #f5f5f5; padding: 15px; border-left: 4px solid ${colors.secondary}; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${colors.primary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nuevo mensaje en el chat</h2>
          </div>

          <div class="content">
            <p><strong>${data.senderName}</strong> te envió un mensaje sobre <strong>${data.projectTitle}</strong>:</p>

            <div class="message">
              <p>${data.message}</p>
            </div>

            <p>Responde en la plataforma para continuar la negociación.</p>

            <a href="${data.linkToChat}" class="button">Ver conversación</a>
          </div>

          <div class="footer">
            <p>No responda a este email. Responda en la plataforma malt.</p>
            <p>&copy; 2025 malt - Ad Marketplace</p>
          </div>
        </div>
      </body>
    </html>
  `,
};
