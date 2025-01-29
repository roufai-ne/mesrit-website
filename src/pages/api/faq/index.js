import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        const faqs = await FAQ.find({ 
          isActive: true 
        }).sort({ order: 1 });
        return res.status(200).json(faqs);

      case 'POST':
        const newFaq = await FAQ.create(req.body);
        return res.status(201).json(newFaq);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}