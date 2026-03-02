import crypto from 'crypto';
import { rateLimiters } from '@/middleware/securityMiddleware';
import { findSubscriberByEmail, createSubscriber } from '@/lib/strapiAdmin';
import { sendConfirmationEmail } from '@/lib/emailService';

async function newsletterHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, token } = req.body;

    // Rate Limit
    if (!rateLimiters.newsletter.check(req, res)) {
      return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
    }

    // Validation email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email requis' });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    // Turnstile — obligatoire
    if (!token) {
      return res.status(400).json({ error: 'Vérification de sécurité (Captcha) requise' });
    }
    const formData = new URLSearchParams();
    formData.append('secret', process.env.CLOUDFLARE_SECRET_KEY || '');
    formData.append('response', token);
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const verificationData = await verificationResponse.json();
    if (!verificationData.success) {
      return res.status(400).json({ error: 'Validation du captcha échouée' });
    }

    // Vérifier si l'email existe déjà
    const searchData = await findSubscriberByEmail(email);
    if (searchData.data && searchData.data.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà inscrit' });
    }

    // Créer le subscriber
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    const unsubscribeToken = crypto.randomBytes(20).toString('hex');

    await createSubscriber({
      email,
      subscribedAt: new Date().toISOString(),
      status: 'pending',
      confirmationToken,
      unsubscribeToken,
      confirmationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      unsubscribeTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Envoyer l'email de confirmation
    await sendConfirmationEmail(email, confirmationToken, unsubscribeToken);

    return res.status(201).json({ message: 'Inscription réussie. Vérifiez votre email.' });

  } catch (error) {
    console.error('Newsletter Error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export default newsletterHandler;
