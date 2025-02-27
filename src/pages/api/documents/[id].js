// pages/api/documents/[id].js
import { connectDB } from '@/lib/mongodb';
import Document from '@/models/Document';
import mongoose from 'mongoose';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { validateDocument } from '@/lib/validators';

// Handler pour GET (public)
const getDocument = async (req, res) => {
  const { id } = req.query;
  
  // Vérifier la validité de l'ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  
  await connectDB();
  const document = await Document.findById(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document non trouvé' });
  }
  
  return res.status(200).json(document);
};

// Handler pour PUT (protégé)
const updateDocument = async (req, res) => {
  const { id } = req.query;
  
  // Vérifier la validité de l'ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  
  // Valider les données
  const validation = validateDocument(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.errors });
  }
  
  await connectDB();
  
  // Ajouter des détails d'audit
  const updatedData = {
    ...req.body,
    updatedBy: req.user.id, // Ajouté par le middleware
  };
  
  const document = await Document.findByIdAndUpdate(
    id,
    updatedData,
    { new: true, runValidators: true }
  );
  
  if (!document) {
    return res.status(404).json({ error: 'Document non trouvé' });
  }
  
  return res.status(200).json(document);
};

// Handler pour DELETE (protégé)
const deleteDocument = async (req, res) => {
  const { id } = req.query;
  
  // Vérifier la validité de l'ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  
  await connectDB();
  const document = await Document.findByIdAndDelete(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document non trouvé' });
  }
  
  return res.status(200).json({ success: true });
};

// Export avec apiHandler
export default apiHandler({
  GET: getDocument,     // Route publique
  PUT: updateDocument,  // Route protégée
  DELETE: deleteDocument // Route protégée
}, {
  GET: ROUTE_TYPES.PUBLIC,
  PUT: ROUTE_TYPES.PROTECTED,
  DELETE: ROUTE_TYPES.PROTECTED
});