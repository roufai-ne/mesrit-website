import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'PUT':
        const updatedAlert = await Alert.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updatedAlert);

      case 'DELETE':
        await Alert.findByIdAndDelete(id);
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