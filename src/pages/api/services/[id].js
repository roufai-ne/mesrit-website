import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer un service spécifique
const getService = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID du service requis' });
    }
    
    // Récupérer le service
    const service = await Service.findById(id).lean();
    
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    // Pour les utilisateurs non connectés, ne retourner que les services publiés
    if (!req.user && service.status !== 'published') {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    // Incrémenter le compteur d'utilisation si c'est un utilisateur public
    if (!req.user) {
      await Service.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
    }
    
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

// PUT - Modifier un service
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
    
    // Validation de la catégorie si elle est fournie
    if (updateData.category) {
      const validCategories = ['etudiants', 'etablissements', 'recherche', 'administration', 'formation'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({ error: 'Catégorie invalide' });
      }
    }
    
    // Mettre à jour le service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    // Logger la modification de service
    await logger.success(
      LOG_TYPES.CONTENT_UPDATED,
      `Service modifié: ${updatedService.name}`,
      {
        serviceId: id,
        serviceName: updatedService.name,
        category: updatedService.category,
        status: updatedService.status,
        updatedBy: req.user?.username || req.user?.id || 'system'
      },
      req
    );
    
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// DELETE - Supprimer un service
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
    const deletedService = await Service.findByIdAndDelete(id);
    
    // Logger la suppression de service
    await logger.warning(
      LOG_TYPES.CONTENT_DELETED,
      `Service supprimé: ${deletedService.name}`,
      {
        serviceId: id,
        serviceName: deletedService.name,
        category: deletedService.category,
        deletedBy: req.user?.username || req.user?.id || 'system'
      },
      req
    );
    
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
    GET: ROUTE_TYPES.PUBLIC,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);
