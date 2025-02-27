import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Liste des actualités (public)
const getNews = async (req, res) => {
  await connectDB();
  
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Construire la requête avec les filtres
    const query = {};
    
    // Si une catégorie est spécifiée
    if (category) {
      query.category = category;
    }
    
    // Si une recherche est spécifiée
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pour les requêtes publiques, ne retourner que les articles publiés
    if (!req.user) {
      query.status = 'published';
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