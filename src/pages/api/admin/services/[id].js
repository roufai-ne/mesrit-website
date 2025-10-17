import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Récupérer un service spécifique (admin)
const getService = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID du service requis' });
    }
    
    // Récupérer le service (pas de restriction de statut pour l'admin)
    const service = await Service.findById(id).lean();
    
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

// PUT - Modifier un service (admin)
const updateService = async (req, res) => {
  await connectDB();

  try {
    const { id } = req.query;
    const updateData = req.body;


    if (!id) {
      return res.status(400).json({ error: 'ID du service requis' });
    }

    // Vérifier que le service existe
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }


    // Validation des features
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features.filter(f => f.title && f.title.trim() && f.description && f.description.trim())
        : [];
    }


    // Validation des tags
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
        : [];
    }

    // Validation de la catégorie si elle est fournie
    if (updateData.category) {
      const validCategories = ['etudiants', 'etablissements', 'recherche', 'administration', 'formation'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({ error: 'Catégorie invalide' });
      }
    }


    // Préparer les données de mise à jour en excluant les valeurs undefined/null
    const cleanUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Ajouter la date de mise à jour
    cleanUpdateData.updatedAt = new Date();

    console.log('Clean update data:', JSON.stringify(cleanUpdateData, null, 2));

    // Mettre à jour le service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      cleanUpdateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);

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

// DELETE - Supprimer un service (admin)
const deleteService = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID du service requis' });
    }
    
    // Vérifier que le service existe
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    // Supprimer le service
    await Service.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getService,
    PUT: updateService,
    DELETE: deleteService
  },
  {
    GET: ROUTE_TYPES.PROTECTED,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);
