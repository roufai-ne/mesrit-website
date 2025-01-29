// src/pages/api/directors/index.js
import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        try {
          // Récupérer toutes les directions
          const directors = await Director.find()
            .sort({ ordre: 1 });

          return res.status(200).json(directors);
        } catch (error) {
          console.error('Erreur GET:', error);
          return res.status(500).json({ 
            error: 'Erreur lors de la récupération des directions' 
          });
        }

      case 'POST':
        try {
          // Vérifier si la clé existe déjà
          if (req.body.key) {
            const existing = await Director.findOne({ key: req.body.key });
            if (existing) {
              return res.status(400).json({ 
                error: 'Une direction avec cette clé existe déjà' 
              });
            }
          }

          const director = new Director({
            ...req.body,
            createdAt: new Date()
          });

          await director.save();
          return res.status(201).json(director);
        } catch (error) {
          console.error('Erreur POST:', error);
          return res.status(400).json({ 
            error: 'Erreur lors de la création de la direction',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
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