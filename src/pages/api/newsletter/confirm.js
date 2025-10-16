import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

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
      confirmationToken: token,
      confirmationTokenExpires: { $gt: new Date() },
    });

    if (!subscriber) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Mettre à jour le statut à 'active'
    subscriber.status = 'active';
    subscriber.confirmationToken = undefined;
    subscriber.confirmationTokenExpires = undefined;
    await subscriber.save();

    return res.status(200).json({ message: 'Inscription confirmée avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}