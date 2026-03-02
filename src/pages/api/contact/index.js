// pages/api/contact/index.js
import { rateLimiters } from '@/middleware/securityMiddleware';
import { createMessage } from '@/lib/strapiAdmin';
import { sendContactNotification } from '@/lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, turnstileToken } = req.body;

    // Rate Limiting — limiter dédié contact (3 req/min)
    if (!rateLimiters.contact.check(req, res)) {
      return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
    }

    // Validation
    const validationErrors = [];

    // Turnstile — obligatoire
    if (!turnstileToken) {
      validationErrors.push('Vérification de sécurité requise');
    } else {
      const turnstileSecret = process.env.CLOUDFLARE_SECRET_KEY;
      if (turnstileSecret) {
        try {
          const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken })
          });
          const turnstileData = await turnstileResponse.json();
          if (!turnstileData.success) {
            validationErrors.push('Échec de la vérification de sécurité');
          }
        } catch (e) {
          console.error('Turnstile verify error:', e.message);
          validationErrors.push('Erreur de vérification de sécurité');
        }
      }
    }

    if (!name || name.length < 2) validationErrors.push('Nom invalide');
    if (!email || !email.includes('@')) validationErrors.push('Email invalide');
    if (!message || message.length < 10) validationErrors.push('Message trop court');

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: 'Validation échouée', validationErrors });
    }

    // Envoyer l'email de notification (non-bloquant si SMTP absent)
    if (process.env.SMTP_HOST) {
      await sendContactNotification({ name, email, subject, message });
    }

    // Sauvegarder dans Strapi (non-bloquant si Strapi indisponible)
    try {
      await createMessage({ name, email, subject, message, status: 'new' });
    } catch (strapiError) {
      console.error('Failed to save message to Strapi:', strapiError.message);
    }

    return res.status(200).json({ success: true, message: 'Message envoyé' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
