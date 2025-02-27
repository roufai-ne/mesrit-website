// src/pages/api/upload/establishment.js
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

const uploadEstablishmentLogo = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Vérifier l'authentification (fait par le middleware mais on le refait pour clarity)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Non authentifié' 
      });
    }

    // Créer le dossier d'uploads s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public/images/logos');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Créer un nom de fichier sécurisé
    const generateSecureFilename = () => {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(16).toString('hex');
      return `est_${timestamp}_${randomString}`;
    };

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        if (part.mimetype && !part.mimetype.includes('image/')) {
          throw new Error('Seules les images sont autorisées');
        }
        return generateSecureFilename() + ext;
      },
      filter: function({ mimetype }) {
        // Accepter seulement les images
        return mimetype && mimetype.includes("image");
      },
    });

    // Utiliser une promesse pour parse
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: 'Aucun fichier uploadé' 
      });
    }

    // Vérification supplémentaire du type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Supprimer le fichier temporaire
      try {
        await fs.unlink(file.filepath);
      } catch (e) {
        console.error('Error deleting invalid file:', e);
      }
      
      return res.status(400).json({ 
        success: false,
        error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.' 
      });
    }

    // Retourner l'URL relative
    const relativeUrl = `/images/logos/${path.basename(file.filepath)}`;

    return res.status(200).json({ 
      success: true,
      url: relativeUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Erreur lors de l\'upload du fichier' 
    });
  }
};

export default apiHandler(
  { POST: uploadEstablishmentLogo },
  { POST: ROUTE_TYPES.PROTECTED }
);