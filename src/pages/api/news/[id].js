import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Détail d'une actualité (public)
const getNewsById = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }
    
    // Vérifier si l'article est publié ou si l'utilisateur est authentifié
    if (news.status !== 'published' && !req.user) {
      return res.status(403).json({ error: 'Accès non autorisé' });
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
    console.error('Error fetching news:', error);
    throw error;
  }
};

// PUT - Mise à jour d'une actualité (protégé)
const updateNews = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const { images, ...restData } = req.body;
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { 
        ...restData,
        images: images?.map(img => ({
          url: img.url,
          description: img.description || ''
        })) || [],
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedNews) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }

    return res.status(200).json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// DELETE - Suppression d'une actualité (protégé)
const deleteNews = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

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
    console.error('Error deleting news:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getNewsById,
    PUT: updateNews,
    DELETE: deleteNews
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);