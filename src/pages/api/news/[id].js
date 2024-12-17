// src/pages/api/news/[id].js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    switch (req.method) {
      case 'DELETE':
        try {
          const deletedNews = await News.findByIdAndDelete(
            new mongoose.Types.ObjectId(id)
          );
          
          if (!deletedNews) {
            return res.status(404).json({ error: 'Actualité non trouvée' });
          }
          return res.status(200).json({ success: true, message: 'Actualité supprimée' });
        } catch (error) {
          console.error('Erreur de suppression:', error);
          return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }

      case 'PUT':
        try {
          const updatedNews = await News.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            req.body,
            { new: true, runValidators: true }
          );
          
          if (!updatedNews) {
            return res.status(404).json({ error: 'Actualité non trouvée' });
          }
          return res.status(200).json(updatedNews);
        } catch (error) {
          console.error('Erreur de mise à jour:', error);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}