import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export default async function handler(req, res) {
  await connectDB();
  try {
    switch (req.method) {
      case 'GET':
        const subscribers = await Newsletter.find({})
          .sort({ subscribedAt: -1 });
        return res.status(200).json(subscribers);

      case 'POST':
          console.log('Body reçu:', req.body); // Debug
          const { email } = req.body;
          
          if (!email) {
            return res.status(400).json({ error: 'Email requis' });
          }
        const existingEmail = await Newsletter.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ 
            error: 'Cet email est déjà inscrit' 
          });
        }
        const newSubscriber = await Newsletter.create({
          email,
          subscribedAt: new Date()
        });
        return res.status(201).json(newSubscriber);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}