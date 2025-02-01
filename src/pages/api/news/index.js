/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/news/index.js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const news = await News.find().sort({ date: -1 });
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des actualités' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const news = new News(req.body);
      await news.save();
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la création de l\'actualité' });
    }
  }
}