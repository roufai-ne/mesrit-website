// src/pages/api/documents/index.js
import { connectDB } from '@/lib/mongodb';
import Document from '@/models/Document';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        try {
          const documents = await Document.find({})
            .sort({ publicationDate: -1 });
          return res.status(200).json(documents);
        } catch (error) {
          console.error('Erreur lors de la récupération des documents:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
        }

      case 'POST':
        try {
          const document = await Document.create(req.body);
          return res.status(201).json(document);
        } catch (error) {
          console.error('Erreur lors de la création du document:', error);
          return res.status(500).json({ error: 'Erreur lors de la création du document' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}