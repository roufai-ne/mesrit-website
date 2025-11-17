// src/pages/api/news/[id]/view.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import logger, { LOG_TYPES } from '@/lib/logger';

const viewHandler = async (req, res) => {
  const { id } = req.query;

  // POST - Enregistrer une vue
  if (req.method === 'POST') {
    try {
      await connectDB();

      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({ error: 'Article non trouvé' });
      }

      const viewData = {
        userId: req.user?.id || null,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        referrer: req.body?.referrer || req.headers['referer'] || '',
        scrollDepth: req.body?.scrollDepth || 0,
        readingTime: req.body?.readingTime || 0,
        sessionId: req.body?.sessionId || null
      };

      news.recordView(viewData);
      await news.save();

      // Logger les vues
      await logger.info(
        LOG_TYPES.NEWS_VIEW,
        `Vue enregistrée: ${news.title}`,
        {
          newsId: id,
          userId: viewData.userId,
          scrollDepth: viewData.scrollDepth,
          readingTime: viewData.readingTime,
          viewsCount: news.viewsCount
        },
        req
      );

      return res.status(200).json({
        success: true,
        viewsCount: news.viewsCount
      });
    } catch (error) {
      console.error('Erreur enregistrement vue:', error);
      
      await logger.error(
        LOG_TYPES.ERROR,
        'Erreur lors de l\'enregistrement d\'une vue',
        { newsId: id, error: error.message },
        req
      );

      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET - Récupérer les stats de vue
  if (req.method === 'GET') {
    try {
      await connectDB();

      const news = await News.findById(id).select('viewsCount views');
      if (!news) {
        return res.status(404).json({ error: 'Article non trouvé' });
      }

      // Calculer les stats
      const totalReadingTime = news.views.reduce((sum, v) => sum + (v.readingTime || 0), 0);
      const avgReadingTime = news.views.length > 0 ? Math.round(totalReadingTime / news.views.length) : 0;
      const avgScrollDepth = news.views.length > 0 
        ? Math.round(news.views.reduce((sum, v) => sum + (v.scrollDepth || 0), 0) / news.views.length)
        : 0;

      return res.status(200).json({
        viewsCount: news.viewsCount,
        stats: {
          totalViews: news.viewsCount,
          avgReadingTime,
          avgScrollDepth,
          uniqueVisitors: new Set(news.views.map(v => v.ip)).size
        }
      });
    } catch (error) {
      console.error('Erreur récupération stats vue:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};

export default apiHandler(
  { GET: viewHandler, POST: viewHandler },
  { 
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PUBLIC // Public pour tracker les vues anonymes
  }
);
