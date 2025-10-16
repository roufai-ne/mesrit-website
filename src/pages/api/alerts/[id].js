// src/pages/api/alerts/[id].js
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// PUT - Mettre à jour une alerte (admin seulement)
const updateAlert = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    
    const updatedAlert = await Alert.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alerte non trouvée' });
    }
    
    return res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Erreur mise à jour alerte:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer une alerte (admin seulement)
const deleteAlert = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    
    const deletedAlert = await Alert.findByIdAndDelete(id);
    
    if (!deletedAlert) {
      return res.status(404).json({ error: 'Alerte non trouvée' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur suppression alerte:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default apiHandler(
  {
    PUT: updateAlert,
    DELETE: deleteAlert
  },
  {
    PUT: ROUTE_TYPES.PROTECTED,
    DELETE: ROUTE_TYPES.PROTECTED
  }
);