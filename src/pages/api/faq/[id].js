import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'PUT':
        const updatedFaq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updatedFaq);

      case 'DELETE':
        await FAQ.findByIdAndDelete(id);
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