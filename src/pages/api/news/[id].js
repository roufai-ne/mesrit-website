import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import logger, { LOG_TYPES } from '@/lib/logger';
import { NewsAnalyticsServiceV2 } from '@/lib/newsAnalyticsV2';

// GET - Détail d'une actualité (public)
const getNewsById = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  try {
    // Permettre la récupération via slug ou ID
    const news = await (News.findBySlugOrId ? News.findBySlugOrId(id) : News.findById(id));
    
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
        .select('_id title slug'),
      News.findOne({ 
        date: { $gt: news.date }, 
        status: 'published' 
      })
        .sort({ date: 1 })
        .select('_id title slug')
    ]);

    // Tracking automatique des vues pour les articles publiés
    if (news.status === 'published') {
      try {
        const trackingData = {
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown',
          referrer: req.headers.referer || req.headers.referrer || '',
          sessionId: req.headers['x-session-id'] || null,
          userId: req.user?.id || null
        };
        
        // Enregistrer la vue de manière asynchrone (ne pas bloquer la réponse)
        NewsAnalyticsServiceV2.trackView(id, trackingData).catch(error => {
          console.error('Erreur tracking vue automatique:', error);
        });
      } catch (error) {
        // Ignorer les erreurs de tracking pour ne pas affecter l'affichage
        console.error('Erreur lors du tracking automatique:', error);
      }
    }

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

    // Logger la modification d'actualité
    await logger.success(
      LOG_TYPES.CONTENT_UPDATED,
      `Actualité modifiée: ${updatedNews.title}`,
      {
        newsId: id,
        title: updatedNews.title,
        category: updatedNews.category,
        status: updatedNews.status,
        updatedBy: req.user.username || req.user.id
      },
      req
    );
    
    // Logger spécifique pour publication
    if (restData.status === 'published' && updatedNews.status === 'published') {
      await logger.info(
        LOG_TYPES.CONTENT_PUBLISHED,
        `Actualité publiée: ${updatedNews.title}`,
        {
          newsId: id,
          title: updatedNews.title,
          category: updatedNews.category,
          publishedBy: req.user.username || req.user.id
        },
        req
      );

      // Envoyer newsletter automatique pour nouvelle publication
      try {
        const AutoNewsletterService = (await import('@/lib/autoNewsletterService')).default;
        
        // Vérifier si c'est une nouvelle publication (pas une re-publication)
        const originalNews = await News.findById(id);
        const isNewPublication = originalNews && originalNews.status !== 'published';
        
        if (isNewPublication) {
          // Envoyer la newsletter automatiquement (de manière asynchrone)
          AutoNewsletterService.notifyNewArticle(
            updatedNews, 
            req.user.username || req.user.id
          ).catch(error => {
            console.error('Erreur newsletter automatique:', error);
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi automatique de newsletter:', error);
        // Ne pas faire échouer la publication si la newsletter échoue
      }
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

    // Logger la suppression d'actualité
    await logger.warning(
      LOG_TYPES.CONTENT_DELETED,
      `Actualité supprimée: ${deletedNews.title}`,
      {
        newsId: id,
        title: deletedNews.title,
        category: deletedNews.category,
        status: deletedNews.status,
        deletedBy: req.user.username || req.user.id
      },
      req
    );

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