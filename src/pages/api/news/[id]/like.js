// src/pages/api/news/[id]/like.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import logger, { LOG_TYPES } from '@/lib/logger';

const likeHandler = async (req, res) => {
  const { id } = req.query;

  // GET - Récupérer les infos de like
  if (req.method === 'GET') {
    try {
      await connectDB();
      
      const news = await News.findById(id).select('likesCount likes');
      if (!news) {
        return res.status(404).json({ error: 'Article non trouvé' });
      }

      const hasLiked = req.user ? news.hasUserLiked(req.user._id) : false;

      return res.status(200).json({
        likesCount: news.likesCount,
        hasLiked
      });
    } catch (error) {
      console.error('Erreur récupération likes:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // POST - Liker/Unliker l'article
  if (req.method === 'POST') {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      await connectDB();

      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({ error: 'Article non trouvé' });
      }

      const result = news.toggleLike(req.user._id);
      await news.save();

      // Logger l'action
      await logger.info(
        LOG_TYPES.NEWS_ENGAGEMENT,
        `Article ${result.action}: ${news.title}`,
        {
          newsId: id,
          userId: req.user._id,
          action: result.action,
          likesCount: news.likesCount
        },
        req
      );

      return res.status(200).json({
        success: true,
        action: result.action,
        liked: result.liked,
        likesCount: news.likesCount
      });
    } catch (error) {
      console.error('Erreur like article:', error);
      
      await logger.error(
        LOG_TYPES.ERROR,
        'Erreur lors du like d\'un article',
        { newsId: id, error: error.message },
        req
      );

      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};

export default apiHandler(
  { GET: likeHandler, POST: likeHandler },
  { 
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED 
  }
);
