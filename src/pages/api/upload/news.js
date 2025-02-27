import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadNewsImage = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification (déjà fait par le middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Définir le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public/images/news');

    // Vérifier si le dossier existe, sinon le créer
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Créer un nom de fichier sécurisé
    const generateSecureFilename = (originalFilename) => {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(16).toString('hex');
      const extension = path.extname(originalFilename);
      return `news_${timestamp}_${randomString}${extension}`;
    };

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        if (part.mimetype && !part.mimetype.includes('image/')) {
          throw new Error('Seules les images sont autorisées');
        }
        return generateSecureFilename(part.originalFilename);
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
      throw new Error('Aucun fichier uploadé');
    }

    // Vérification du type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      await fs.unlink(file.filepath);
      return res.status(400).json({ error: 'Type de fichier non autorisé' });
    }

    // Retourner le chemin relatif
    return res.status(200).json({
      url: `/images/news/${path.basename(file.filepath)}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Error uploading file' });
  }
};

export default apiHandler(
  { POST: uploadNewsImage },
  { POST: ROUTE_TYPES.PROTECTED }
);