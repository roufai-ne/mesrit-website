import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Liste des services (admin - tous les services)
const getServices = async (req, res) => {
  await connectDB();
  
  try {
    const { category, search, status, page = 1, limit = 50 } = req.query;
    
    // Construire les filtres (pas de restriction de statut pour l'admin)
    let filters = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (search) {
      filters.$text = { $search: search };
    }
    
    if (status) {
      filters.status = status;
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

// POST - Création d'un service (admin)
const createService = async (req, res) => {
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
    
    // Validation des features
    const validFeatures = Array.isArray(features) 
      ? features.filter(f => f.title && f.title.trim() && f.description && f.description.trim())
      : [];
    
    // Validation des tags
    const validTags = Array.isArray(tags) 
      ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
      : [];
    
    // Créer le nouveau service
    const newService = new Service({
      title: title.trim(),
      description: description.trim(),
      longDescription: longDescription.trim(),
      icon: icon || 'Settings',
      category,
      status: status || 'draft',
      url: url || '',
      features: validFeatures,
      image: image || '',
      priority: priority || 0,
      tags: validTags,
      isExternal: isExternal || false,
      isPopular: isPopular || false,
      usageCount: 0
    });
    
    // Sauvegarder le service
    const savedService = await newService.save();
    
    res.status(201).json(savedService);
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Gestion d'erreur améliorée
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    throw error;
  }
};

export default apiHandler(
  {
    GET: getServices,
    POST: createService
  },
  {
    GET: ROUTE_TYPES.PROTECTED,
    POST: ROUTE_TYPES.PROTECTED
  }
);
