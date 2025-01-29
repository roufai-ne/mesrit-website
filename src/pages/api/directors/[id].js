// src/pages/api/directors/[id].js
import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    switch (req.method) {
      case 'GET':
        try {
          // Récupérer la direction principale
          const director = await Director.findById(id);
          
          if (!director) {
            return res.status(404).json({ error: 'Direction non trouvée' });
          }

          // Récupérer les sous-directions si c'est une direction principale
          let sousDirections = [];
          if (director.key) {
            sousDirections = await Director.find({ 
              direction: director.key 
            }).sort({ ordre: 1 });
          }

          // Retourner la réponse
          return res.status(200).json({
            ...director.toObject(),
            sousDirections
          });

        } catch (error) {
          console.error('Erreur GET:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération' });
        }

      case 'PUT':
        try {
          const updatedDirector = await Director.findByIdAndUpdate(
            id,
            { 
              ...req.body,
              updatedAt: new Date()
            },
            { 
              new: true, 
              runValidators: true 
            }
          );
          
          if (!updatedDirector) {
            return res.status(404).json({ error: 'Direction non trouvée' });
          }

          return res.status(200).json(updatedDirector);
        } catch (error) {
          console.error('Erreur PUT:', error);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

      case 'DELETE':
        try {
          // Vérifier s'il y a des sous-directions
          const hasSousDirections = await Director.exists({ direction: director.key });
          if (hasSousDirections) {
            return res.status(400).json({ 
              error: 'Impossible de supprimer une direction qui a des sous-directions' 
            });
          }

          const deletedDirector = await Director.findByIdAndDelete(id);
          
          if (!deletedDirector) {
            return res.status(404).json({ error: 'Direction non trouvée' });
          }

          return res.status(200).json({ 
            success: true, 
            message: 'Direction supprimée avec succès' 
          });
        } catch (error) {
          console.error('Erreur DELETE:', error);
          return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}