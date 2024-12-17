// src/pages/api/upload/index.js
import { writeFile } from 'fs/promises';
import { join } from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir: join(process.cwd(), 'public', 'documents'),
      keepExtensions: true,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        return `${uniqueSuffix}${part.originalFilename}`;
      }
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Erreur upload:', err);
          reject(err);
          return res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
        }

        const file = files.file[0];
        
        // Validation du type de fichier
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ error: 'Type de fichier non autorisé' });
        }

        try {
          // Retourner l'URL du fichier
          const fileUrl = `/documents/${file.newFilename}`;
          resolve(res.status(200).json({
            url: fileUrl,
            size: file.size,
            type: file.mimetype
          }));
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
          reject(error);
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde du fichier' });
        }
      });
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}