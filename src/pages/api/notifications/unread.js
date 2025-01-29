// pages/api/notifications/unread.js
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectDB();
  
  try {
    const notifications = await Notification.find({
      isRead: false,
      status: 'sent'
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}