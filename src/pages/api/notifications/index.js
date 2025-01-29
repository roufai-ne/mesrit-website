// pages/api/notifications/index.js
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        const notifications = await Notification.find({})
          .sort({ createdAt: -1 });
        return res.status(200).json(notifications);

        case 'POST':
          const notificationData = {
            ...req.body,
            createdAt: new Date(),
            sentAt: req.body.status === 'sent' ? new Date() : null
          };
          const newNotification = await Notification.create(notificationData);
          return res.status(201).json(newNotification);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}