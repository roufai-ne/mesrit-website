import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimiters } from '@/lib/rateLimit';

async function newsletterHandler(req, res) {
  await connectDB();
  try {
    switch (req.method) {
      case 'GET':
        const subscribers = await Newsletter.find({})
          .sort({ subscribedAt: -1 });
        return res.status(200).json(subscribers);

      case 'POST':
        console.log('Body reçu:', req.body); // Debug
        const { email, token } = req.body;

        // Validation plus stricte de l'email
        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'Email requis' });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Format d\'email invalide' });
        }

        // Validation de la longueur de l'email
        if (email.length > 254) { // RFC 5321
          return res.status(400).json({ error: 'Email trop long' });
        }

        if (!token) {
          return res.status(400).json({ error: 'Captcha requis' });
        }

        // Vérification du token Turnstile
        const formData = new URLSearchParams();
        formData.append('secret', process.env.CLOUDFLARE_SECRET_KEY || process.env.DISABLED_CLOUDFLARE_SECRET_KEY);
        formData.append('response', token);

        const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData,
        });

        const verificationData = await verificationResponse.json();

        if (!verificationData.success) {
          const errorMessage = verificationData['error-codes']?.length 
            ? `Erreur de validation: ${verificationData['error-codes'].join(', ')}` 
            : 'Validation du captcha échouée';
          return res.status(400).json({ error: errorMessage });
        }
        
        // Vérifier si le token a déjà été utilisé
        if (verificationData.cdata === 'token-already-used') {
          return res.status(400).json({ error: 'Ce captcha a déjà été utilisé. Veuillez réessayer.' });
        }

        const existingEmail = await Newsletter.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ 
            error: 'Cet email est déjà inscrit' 
          });
        }

        const confirmationToken = crypto.randomBytes(20).toString('hex');
        const unsubscribeToken = crypto.randomBytes(20).toString('hex'); // Nouveau token pour désinscription
        const newSubscriber = await Newsletter.create({
          email,
          subscribedAt: new Date(),
          status: 'pending',
          confirmationToken,
          confirmationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valide 24h
          unsubscribeToken, // Ajout du token de désinscription
          unsubscribeTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valide 30 jours
        });

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

        return res.status(201).json({ 
          message: 'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.', 
          subscriber: newSubscriber 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Appliquer rate limiting: 3 inscriptions max par 24h
export default function handler(req, res) {
  return rateLimiters.newsletter(req, res, () => {
    return newsletterHandler(req, res);
  });
}