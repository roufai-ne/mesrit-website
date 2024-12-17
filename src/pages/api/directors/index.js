// src/pages/api/directors/index.js
import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const directors = await Director.find().sort({ ordre: 1 });
      res.status(200).json(directors);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des responsables' });
    }
  } else if (req.method === 'POST') {
    try {
      const director = new Director(req.body);
      await director.save();
      res.status(201).json(director);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la création du responsable' });
    }
  }
}