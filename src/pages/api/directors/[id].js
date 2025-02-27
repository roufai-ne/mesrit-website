import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';
import mongoose from 'mongoose';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// Handler pour GET (public)
const getDirector = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    const director = await Director.findById(id);
    
    if (!director) {
      return res.status(404).json({ 
        success: false,
        error: 'Direction non trouvée' 
      });
    }

    // Récupérer les sous-directions si c'est une direction principale
    let sousDirections = [];
    if (director.key) {
      sousDirections = await Director.find({ 
        direction: director.key 
      }).sort({ ordre: 1 });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...director.toObject(),
        sousDirections
      }
    });
  } catch (error) {
    console.error('Error fetching director:', error);
    throw error;
  }
};

// Handler pour PUT (protégé)
const updateDirector = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    // Validation des données
    const { titre, nom } = req.body;
    if (!titre || !nom) {
      return res.status(400).json({ 
        success: false,
        error: 'Le titre et le nom sont requis'
      });
    }

    const updatedDirector = await Director.findByIdAndUpdate(
      id,
      { 
        ...req.body,
        updatedBy: req.user?.id,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedDirector) {
      return res.status(404).json({ 
        success: false,
        error: 'Direction non trouvée' 
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedDirector
    });
  } catch (error) {
    console.error('Error updating director:', error);
    throw error;
  }
};

// Handler pour DELETE (protégé)
const deleteDirector = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    // Récupérer d'abord la direction
    const director = await Director.findById(id);
    
    if (!director) {
      return res.status(404).json({ 
        success: false,
        error: 'Direction non trouvée' 
      });
    }
    
    // Vérifier s'il y a des sous-directions
    if (director.key) {
      const hasSousDirections = await Director.exists({ direction: director.key });
      if (hasSousDirections) {
        return res.status(400).json({ 
          success: false,
          error: 'Impossible de supprimer une direction qui a des sous-directions' 
        });
      }
    }

    await Director.findByIdAndDelete(id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Direction supprimée avec succès' 
    });
  } catch (error) {
    console.error('Error deleting director:', error);
    throw error;
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