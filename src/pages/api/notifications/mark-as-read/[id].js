// pages/api/notifications/mark-as-read/[id].js
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}