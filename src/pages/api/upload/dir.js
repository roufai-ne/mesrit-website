// pages/api/upload/dir.js
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

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
    // Définir le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public/images/dir');

    // Vérifier si le dossier existe, sinon le créer
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        // Valider que le fichier est une image
        return mimetype && mimetype.includes('image');
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      throw new Error('Aucun fichier uploadé ou le fichier n\'est pas une image valide');
    }

    console.log('Fichier uploadé :', file); // Log pour déboguer

    // Générer un nom de fichier unique
    const fileName = `dir_${Date.now()}${path.extname(file.name || file.filename || file.originalFilename)}`;
    const newPath = path.join(uploadDir, fileName);

    // Renommer le fichier avec le nouveau nom
    await fs.rename(file.filepath, newPath);

    // Retourner le chemin relatif pour le stockage en base de données
    return res.status(200).json({
      url: `/images/dir/${fileName}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'upload du fichier' });
  }
}