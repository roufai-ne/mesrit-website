// src/pages/api/search/index.js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import Document from '@/models/Document';

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json([]);
  }

  try {
    await connectDB();

    // Recherche dans les actualités
    const newsResults = await News.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ],
      status: 'published'
    })
    .select('title _id')
    .limit(3);

    // Recherche dans les documents
    const documentResults = await Document.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      status: 'published'
    })
    .select('title _id')
    .limit(3);

    const results = [
      ...newsResults.map(news => ({
        ...news.toObject(),
        type: 'news'
      })),
      ...documentResults.map(doc => ({
        ...doc.toObject(),
        type: 'document'
      }))
    ];

    return res.status(200).json(results);
  } catch (error) {
    console.error('Erreur de recherche:', error);
    return res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
}