import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// Handler pour GET (public)
const getDirector = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID du responsable requis',
        code: 'MISSING_ID'
      });
    }
    
    const director = await Director.findById(id);
    
    if (!director) {
      return res.status(404).json({ 
        success: false,
        error: 'Responsable non trouvé',
        code: 'NOT_FOUND'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: director
    });
    
  } catch (error) {
    console.error('Error fetching director:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
        code: 'INVALID_ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Handler pour PUT (protégé)
const updateDirector = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    const { titre, nom, key } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID du responsable requis',
        code: 'MISSING_ID'
      });
    }
    
    if (!titre || !nom) {
      return res.status(400).json({ 
        success: false,
        error: 'Le titre et le nom sont requis',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Vérifier si le responsable existe
    const existingDirector = await Director.findById(id);
    if (!existingDirector) {
      return res.status(404).json({ 
        success: false,
        error: 'Responsable non trouvé',
        code: 'NOT_FOUND'
      });
    }
    
    // Vérifier si la clé existe déjà (sauf pour le responsable actuel)
    if (key && key !== existingDirector.key) {
      const duplicateKey = await Director.findOne({ key, _id: { $ne: id } });
      if (duplicateKey) {
        return res.status(409).json({ 
          success: false,
          error: 'Une direction avec cette clé existe déjà',
          code: 'DUPLICATE_KEY',
          field: 'key',
          value: key,
          existing: {
            nom: duplicateKey.nom,
            id: duplicateKey._id
          }
        });
      }
    }

    // Vérifier si le titre existe déjà (sauf pour le responsable actuel)
    if (titre !== existingDirector.titre) {
      const duplicateTitre = await Director.findOne({ titre, _id: { $ne: id } });
      if (duplicateTitre) {
        return res.status(409).json({ 
          success: false,
          error: `Le poste "${titre}" est déjà occupé par ${duplicateTitre.nom}`,
          code: 'DUPLICATE_TITLE',
          field: 'titre',
          value: titre,
          existing: {
            nom: duplicateTitre.nom,
            id: duplicateTitre._id
          }
        });
      }
    }

    const updatedDirector = await Director.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: req.user?.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: updatedDirector,
      message: 'Responsable mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('Error updating director:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
        code: 'INVALID_ID'
      });
    }
    
    // Gestion des erreurs MongoDB spécifiques
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(409).json({
        success: false,
        error: `Cette valeur existe déjà pour le champ "${field}"`,
        code: 'MONGODB_DUPLICATE',
        field: field,
        value: value
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Erreur de validation des données',
        code: 'VALIDATION_ERROR',
        details: validationErrors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Handler pour DELETE (protégé)
const deleteDirector = async (req, res) => {
  await connectDB();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID du responsable requis',
        code: 'MISSING_ID'
      });
    }
    
    const director = await Director.findById(id);
    
    if (!director) {
      return res.status(404).json({ 
        success: false,
        error: 'Responsable non trouvé',
        code: 'NOT_FOUND'
      });
    }
    
    await Director.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Responsable supprimé avec succès',
      data: { id }
    });
    
  } catch (error) {
    console.error('Error deleting director:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
        code: 'INVALID_ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

export default apiHandler(
  {
    GET: getDirector,
    PUT: updateDirector,
    DELETE: deleteDirector
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);