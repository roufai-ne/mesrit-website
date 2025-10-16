import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Liste des actualités (public)
const getNews = async (req, res) => {
  await connectDB();
  
  try {
  const { category, search, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Construire la requête avec les filtres
    const query = {};
    
    // Si une catégorie est spécifiée
    if (category) {
      query.category = category;
    }
    
    // Si une recherche est spécifiée - avec validation de longueur pour éviter ReDoS
    if (search) {
      const maxSearchLength = 50;
      const safeSearch = search.length > maxSearchLength ? search.slice(0, maxSearchLength) : search;
      query.$or = [
        { title: { $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { content: { $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { summary: { $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ];
    }
    
    // Filtrage par statut si demandé
    if (status && status !== 'all') {
      if (status === 'archived') {
        query.archived = true;
      } else if (status === 'deleted' || status === 'corbeille') {
        query.status = 'deleted';
      } else {
        query.status = status;
      }
    } else if (!req.user) {
      // Si pas d'utilisateur authentifié, ne montrer que les articles publiés
      if (!query.$or) {
        query.status = 'published';
      } else {
        // Ajouter la condition de statut à la recherche existante
        query.$and = [
          { $or: query.$or },
          { status: 'published' }
        ];
        delete query.$or;
      }
    }
    
    const news = await News.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
      
    res.status(200).json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// POST - Création d'une actualité (protégé)
const postNews = async (req, res) => {
  await connectDB();
  
  try {
    // Ajouter les informations sur l'utilisateur
    const { images, ...restData } = req.body;
    
    const news = new News({
      ...restData,
      images: images?.map(img => ({
        url: img.url,
        description: img.description || ''
      })) || [],
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await news.save();
    
    // Logger la création d'actualité
    await logger.success(
      LOG_TYPES.CONTENT_CREATED,
      `Nouvelle actualité créée: ${news.title}`,
      {
        newsId: news._id,
        title: news.title,
        category: news.category,
        status: news.status,
        createdBy: req.user.username || req.user.id
      },
      req
    );

    // Si l'actualité est créée directement en statut "published", envoyer newsletter
    if (news.status === 'published') {
      try {
        const AutoNewsletterService = (await import('@/lib/autoNewsletterService')).default;
        
        // Envoyer la newsletter automatiquement (de manière asynchrone)
        AutoNewsletterService.notifyNewArticle(
          news, 
          req.user.username || req.user.id
        ).catch(error => {
          console.error('Erreur newsletter automatique lors de la création:', error);
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi automatique de newsletter:', error);
        // Ne pas faire échouer la création si la newsletter échoue
      }
    }
    
    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getNews,
    POST: postNews
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);