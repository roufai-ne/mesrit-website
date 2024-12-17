// src/pages/api/content/save.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).end();
    }
  
    try {
      // Ici, vous ajouteriez la logique de sauvegarde dans votre base de données
      const content = req.body;
      
      // Exemple de réponse
      res.status(200).json({
        success: true,
        message: 'Contenu sauvegardé avec succès',
        content
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }