import { rateLimiters } from '@/middleware/securityMiddleware';
import { findSubscriberByToken, updateSubscriber } from '@/lib/strapiAdmin';
import { sendUnsubscribeConfirmation } from '@/lib/emailService';

const TOKEN_REGEX = /^[a-f0-9]{40}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit — protège contre l'énumération de tokens
  if (!rateLimiters.api.check(req, res)) {
    return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
  }

  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !TOKEN_REGEX.test(token)) {
      return res.status(400).json({ error: 'Token invalide' });
    }

    const searchData = await findSubscriberByToken('unsubscribeToken', token);
    const subscriber = searchData.data?.[0];

    if (!subscriber) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    const email = subscriber.attributes?.email;

    await updateSubscriber(subscriber.id, {
      status: 'unsubscribed',
      unsubscribeToken: null,
      unsubscribeTokenExpires: null,
    });

    // Email de confirmation de désinscription (non-bloquant)
    if (email && process.env.SMTP_HOST) {
      sendUnsubscribeConfirmation(email).catch((err) =>
        console.warn('Erreur email désinscription:', err.message)
      );
    }

    return res.status(200).json({ message: 'Désinscription réussie' });
  } catch (error) {
    console.error('Unsubscribe Newsletter Error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
