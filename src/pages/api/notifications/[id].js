// pages/api/notifications/[id].js
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'PUT':
  const updateData = {
    ...req.body,
    sentAt: req.body.status === 'sent' ? new Date() : null
  };
  const updatedNotification = await Notification.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  return res.status(200).json(updatedNotification);

      case 'DELETE':
        await Notification.findByIdAndDelete(id);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}