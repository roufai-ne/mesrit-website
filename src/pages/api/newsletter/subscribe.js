import crypto from 'crypto';
import nodemailer from 'nodemailer';
// import { rateLimiters } from '@/lib/rateLimit'; // Module removed

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN; // Use Admin token for writes

async function newsletterHandler(req, res) {
  try {
    switch (req.method) {
      case 'POST':
        const { email, token } = req.body;

        // Check Rate Limit
        const { rateLimiters } = require('@/middleware/securityMiddleware');
        if (!rateLimiters.newsletter.check(req, res)) {
          return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
        }

        // Validation standard
        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'Email requis' });
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Format d\'email invalide' });
        }

        if (!token) {
          return res.status(400).json({ error: 'Vérification de sécurité (Captcha) requise' });
        }

        // Verify Turnstile
        if (token) {
          const formData = new URLSearchParams();
          formData.append('secret', process.env.CLOUDFLARE_SECRET_KEY || process.env.DISABLED_CLOUDFLARE_SECRET_KEY);
          formData.append('response', token);

          const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
          });
          const verificationData = await verificationResponse.json();

          if (!verificationData.success) {
            return res.status(400).json({ error: 'Validation du captcha échouée' });
          }
        }

        // Check if exists in Strapi
        const searchRes = await fetch(`${STRAPI_URL}/api/subscribers?filters[email][$eq]=${email}`, {
          headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
        });
        const searchData = await searchRes.json();

        if (searchData.data && searchData.data.length > 0) {
          return res.status(400).json({ error: 'Cet email est déjà inscrit' });
        }

        // Create Subscriber
        const confirmationToken = crypto.randomBytes(20).toString('hex');
        const unsubscribeToken = crypto.randomBytes(20).toString('hex');

        const payload = {
          data: {
            email,
            subscribedAt: new Date().toISOString(),
            status: 'pending',
            confirmationToken,
            unsubscribeToken,
            confirmationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            unsubscribeTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        };

        const createRes = await fetch(`${STRAPI_URL}/api/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${STRAPI_TOKEN}`
          },
          body: JSON.stringify(payload)
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          throw new Error(errorData.error?.message || 'Erreur Strapi');
        }

        // Send Email
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const confirmationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirm-email?token=${confirmationToken}`;
        const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;

        await transporter.sendMail({
          from: `"MESRIT Niger" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Confirmez votre inscription à la newsletter MESRIT',
          html: `
            <h1>Confirmez votre inscription</h1>
            <p>Merci de vous être inscrit à notre newsletter ! Cliquez sur le lien suivant pour confirmer votre email :</p>
            <a href="${confirmationLink}" style="color: #007bff; text-decoration: underline;">Confirmer mon email</a>
            <p>Ce lien expire dans 24 heures.</p>
            <p>Si vous souhaitez vous désinscrire à tout moment, cliquez <a href="${unsubscribeLink}" style="color: #007bff; text-decoration: underline;">ici</a>. Ce lien est valide pendant 30 jours.</p>
          `,
        });

        return res.status(201).json({ message: 'Inscription réussie. Vérifiez votre email.' });

      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Newsletter Error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export default function handler(req, res) {
  // return rateLimiters.newsletter(req, res, () => {
  return newsletterHandler(req, res);
  // });
}