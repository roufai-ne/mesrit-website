// src/pages/api/documents/[id].js
import { connectDB } from '@/lib/mongodb';
import Document from '@/models/Document';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  // Vérifier si l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    switch (req.method) {
      case 'GET':
        try {
          const document = await Document.findById(
            new mongoose.Types.ObjectId(id)
          );
          
          if (!document) {
            return res.status(404).json({ error: 'Document non trouvé' });
          }
          return res.status(200).json(document);
        } catch (error) {
          console.error('Erreur de récupération:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }

      case 'DELETE':
        try {
          const deletedDocument = await Document.findByIdAndDelete(
            new mongoose.Types.ObjectId(id)
          );
          
          if (!deletedDocument) {
            return res.status(404).json({ error: 'Document non trouvé' });
          }
          return res.status(200).json({ success: true, message: 'Document supprimé' });
        } catch (error) {
          console.error('Erreur de suppression:', error);
          return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }

      case 'PUT':
        try {
          const updatedDocument = await Document.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            req.body,
            { new: true, runValidators: true }
          );
          
          if (!updatedDocument) {
            return res.status(404).json({ error: 'Document non trouvé' });
          }
          return res.status(200).json(updatedDocument);
        } catch (error) {
          console.error('Erreur de mise à jour:', error);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}