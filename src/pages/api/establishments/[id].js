// src/pages/api/establishments/[id].js
import { connectDB } from '@/lib/mongodb';
import Establishment from '@/models/Establishment';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import mongoose from 'mongoose';

// GET - Récupérer un établissement par ID (public)
const getEstablishmentById = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const establishment = await Establishment.findById(id);
    
    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    return res.status(200).json(establishment);
  } catch (error) {
    console.error('Erreur récupération établissement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Mettre à jour un établissement (admin seulement)
const updateEstablishment = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedEstablishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    return res.status(200).json(updatedEstablishment);
  } catch (error) {
    console.error('Erreur mise à jour établissement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer un établissement (admin seulement)
const deleteEstablishment = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const deletedEstablishment = await Establishment.findByIdAndDelete(id);
    
    if (!deletedEstablishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    return res.status(200).json({ success: true, message: 'Établissement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression établissement:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default apiHandler(
  {
    GET: getEstablishmentById,
    PUT: updateEstablishment,
    DELETE: deleteEstablishment
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);