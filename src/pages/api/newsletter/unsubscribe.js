import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import crypto from 'crypto';

export default async function handler(req, res) {
  await connectDB();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    const subscriber = await Newsletter.findOne({
      unsubscribeToken: token,
      unsubscribeTokenExpires: { $gt: new Date() },
    });

    if (!subscriber) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Mettre à jour le statut à 'unsubscribed'
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribeToken = undefined;
    subscriber.unsubscribeTokenExpires = undefined;
    await subscriber.save();

    return res.status(200).json({ message: 'Désinscription réussie' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}