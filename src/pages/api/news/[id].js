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
      case 'GET':
        try {
          const news = await News.findById(id);
          
          if (!news) {
            return res.status(404).json({ error: 'Actualité non trouvée' });
          }

          // Récupérer les articles précédent et suivant
          const [previousNews, nextNews] = await Promise.all([
            News.findOne({ 
              date: { $lt: news.date }, 
              status: 'published' 
            })
              .sort({ date: -1 })
              .select('_id title'),
            News.findOne({ 
              date: { $gt: news.date }, 
              status: 'published' 
            })
              .sort({ date: 1 })
              .select('_id title')
          ]);

          return res.status(200).json({
            news,
            navigation: {
              previous: previousNews,
              next: nextNews
            }
          });
        } catch (error) {
          console.error('Erreur GET:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }

      case 'PUT':
        try {
          const updatedNews = await News.findByIdAndUpdate(
            id,
            { 
              ...req.body,
              updatedAt: new Date()
            },
            { 
              new: true, 
              runValidators: true 
            }
          );
          
          if (!updatedNews) {
            return res.status(404).json({ error: 'Actualité non trouvée' });
          }

          return res.status(200).json(updatedNews);
        } catch (error) {
          console.error('Erreur PUT:', error);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

      case 'DELETE':
        try {
          const deletedNews = await News.findByIdAndDelete(id);
          
          if (!deletedNews) {
            return res.status(404).json({ error: 'Actualité non trouvée' });
          }

          return res.status(200).json({ 
            success: true, 
            message: 'Actualité supprimée avec succès' 
          });
        } catch (error) {
          console.error('Erreur DELETE:', error);
          return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}