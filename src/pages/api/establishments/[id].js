// src/pages/api/establishments/[id].js
import { connectDB } from '@/lib/mongodb';
import Establishment from '@/models/Establishment';
import mongoose from 'mongoose';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// Handler GET (public)
const getEstablishment = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    const establishment = await Establishment.findById(id);
    
    if (!establishment) {
      return res.status(404).json({ 
        success: false,
        error: 'Établissement non trouvé' 
      });
    }

    return res.status(200).json({
      success: true,
      data: establishment
    });
  } catch (error) {
    console.error('Error fetching establishment:', error);
    throw error;
  }
};

// Handler PUT (protégé)
const updateEstablishment = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    // Validation de base
    const { nom, type, statut, region, ville } = req.body;
    if (!nom || !type || !statut || !region || !ville) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
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
    
    if (!updatedEstablishment) {
      return res.status(404).json({ 
        success: false,
        error: 'Établissement non trouvé' 
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedEstablishment
    });
  } catch (error) {
    console.error('Error updating establishment:', error);
    throw error;
  }
};

// Handler DELETE (protégé)
const deleteEstablishment = async (req, res) => {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID invalide' 
    });
  }

  try {
    const deletedEstablishment = await Establishment.findByIdAndDelete(id);
    
    if (!deletedEstablishment) {
      return res.status(404).json({ 
        success: false,
        error: 'Établissement non trouvé' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Établissement supprimé avec succès' 
    });
  } catch (error) {
    console.error('Error deleting establishment:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getEstablishment,
    PUT: updateEstablishment,
    DELETE: deleteEstablishment
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);