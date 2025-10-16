import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Liste des services (public)
const getServices = async (req, res) => {
  await connectDB();
  
  try {
    const { category, search, popular, page = 1, limit = 50 } = req.query;
    
    // Construire les filtres
    let filters = { status: 'published' }; // Seuls les services publiés pour le public
    
    if (category) {
      filters.category = category;
    }
    
    if (search) {
      filters.$text = { $search: search };
    }
    
    if (popular === 'true') {
      filters.isPopular = true;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Récupérer les services avec tri par priorité et date de création
    const services = await Service.find(filters)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Compter le total pour la pagination
    const total = await Service.countDocuments(filters);
    
    res.status(200).json({
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// POST - Création d'un service (protégé)
const postService = async (req, res) => {
  await connectDB();
  
  try {
    const {
      title,
      description,
      longDescription,
      icon,
      category,
      status,
      url,
      features,
      image,
      priority,
      tags,
      isExternal,
      isPopular
    } = req.body;
    
    // Validation des champs requis
    if (!title || !description || !longDescription || !category) {
      return res.status(400).json({
        message: 'Les champs titre, description, description longue et catégorie sont requis'
      });
    }
    
    // Validation de la catégorie
    const validCategories = ['etudiants', 'etablissements', 'recherche', 'administration', 'formation'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Catégorie invalide'
      });
    }
    
    // Créer le nouveau service
    const newService = new Service({
      title: title.trim(),
      description: description.trim(),
      longDescription: longDescription.trim(),
      icon: icon || 'Settings',
      category,
      status: status || 'draft',
      url: url || '',
      features: features || [],
      image: image || '',
      priority: priority || 0,
      tags: tags || [],
      isExternal: isExternal || false,
      isPopular: isPopular || false,
      usageCount: 0
    });
    
    // Sauvegarder le service
    const savedService = await newService.save();
    
    res.status(201).json(savedService);
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getServices,
    POST: postService
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);
