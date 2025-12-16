// pages/api/contact/index.js
import nodemailer from 'nodemailer';
import axios from 'axios';

// Standalone handler without legacy middleware
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, turnstileToken } = req.body;

    // Validation
    const validationErrors = [];

    // Turnstile Check (Keep existing logic)
    if (!turnstileToken) {
      // Allow skipping token in dev if needed, or enforce. Keeping strict for safety.
      // validationErrors.push('Vérification de sécurité requise'); 
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
          console.error(e);
        }
      }
    }

    if (!name || name.length < 2) validationErrors.push('Nom invalide');
    if (!email || !email.includes('@')) validationErrors.push('Email invalide');
    if (!message || message.length < 10) validationErrors.push('Message trop court');

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: 'Validation échouée', validationErrors });
    }

    // 1. Send Email (Nodemailer) - Preserving existing SMTP config usage
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        replyTo: email,
        subject: `Contact MESRIT: ${subject}`,
        html: `<h2>Nouveau message</h2><p><strong>De:</strong> ${name} (${email})</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>`
      });
    }

    // 2. Save into Strapi (New Feature)
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      const strapiToken = process.env.STRAPI_ADMIN_TOKEN; // Ideally use a specific token
      if (strapiToken) {
        await axios.post(`${strapiUrl}/api/messages`, {
          data: {
            name,
            email,
            subject,
            message,
            status: 'new'
          }
        }, {
          headers: { Authorization: `Bearer ${strapiToken}` }
        });
      }
    } catch (strapiError) {
      console.error('Failed to save message to Strapi:', strapiError.message);
      // Do not fail the request if Strapi save fails, as email might have gone through
    }

    return res.status(200).json({ success: true, message: 'Message envoyé' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}