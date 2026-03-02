// src/lib/emailService.js
/**
 * Service email centralisé — singleton Nodemailer
 * Utilise le circuit breaker 'sendgrid' pour la résilience
 */
import nodemailer from 'nodemailer';
import { breakers } from '@/lib/circuitBreaker';

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return _transporter;
}

const FROM = `"MESRIT Niger" <${process.env.SMTP_USER}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Envoyer un email de confirmation d'inscription newsletter
 */
export async function sendConfirmationEmail(email, confirmationToken, unsubscribeToken) {
  const confirmationLink = `${BASE_URL}/newsletter/confirm-email?token=${confirmationToken}`;
  const unsubscribeLink = `${BASE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  return breakers.sendgrid.execute(() =>
    getTransporter().sendMail({
      from: FROM,
      to: email,
      subject: 'Confirmez votre inscription à la newsletter MESRIT',
      html: `
        <h1>Confirmez votre inscription</h1>
        <p>Merci de vous être inscrit à notre newsletter ! Cliquez sur le lien suivant pour confirmer votre email :</p>
        <a href="${confirmationLink}" style="color: #007bff; text-decoration: underline;">Confirmer mon email</a>
        <p>Ce lien expire dans 24 heures.</p>
        <p>Si vous souhaitez vous désinscrire à tout moment, cliquez <a href="${unsubscribeLink}" style="color: #007bff; text-decoration: underline;">ici</a>. Ce lien est valide pendant 30 jours.</p>
      `,
    })
  );
}

/**
 * Envoyer une notification de contact au MESRIT
 */
export async function sendContactNotification({ name, email, subject, message }) {
  const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return breakers.sendgrid.execute(() =>
    getTransporter().sendMail({
      from: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
      to,
      replyTo: email,
      subject: `Contact MESRIT: ${escapeHtml(subject)}`,
      html: `
        <h2>Nouveau message</h2>
        <p><strong>De:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    })
  );
}

/**
 * Envoyer un email de confirmation de désinscription
 */
export async function sendUnsubscribeConfirmation(email) {
  return breakers.sendgrid.execute(() =>
    getTransporter().sendMail({
      from: FROM,
      to: email,
      subject: 'Désinscription confirmée — Newsletter MESRIT',
      html: `
        <h1>Désinscription confirmée</h1>
        <p>Vous avez bien été désinscrit de la newsletter MESRIT.</p>
        <p>Si c'était une erreur, vous pouvez vous réinscrire sur notre site.</p>
      `,
    })
  );
}
