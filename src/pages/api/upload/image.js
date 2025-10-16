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

const uploadImage = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification (déjà fait par le middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Définir le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public/uploads');

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
      const extension = path.extname(originalFilename || '');
      return `${timestamp}_${randomString}${extension}`;
    };

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        // Vérifier le type MIME
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedMimeTypes.includes(part.mimetype)) {
          throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou SVG.');
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

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Double vérification du type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Supprimer le fichier s'il a été créé
      try {
        await fs.unlink(file.filepath);
      } catch (e) {
        console.error('Erreur lors de la suppression du fichier:', e);
      }
      return res.status(400).json({ error: 'Type de fichier non autorisé' });
    }

    console.log(`[UPLOAD SUCCESS] Image uploadée: /uploads/${path.basename(file.filepath)}`);

    // Retourner le chemin relatif
    return res.status(200).json({
      success: true,
      message: 'Image uploadée avec succès',
      url: `/uploads/${path.basename(file.filepath)}`,
      filename: path.basename(file.filepath),
      size: file.size,
      type: file.mimetype
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'upload de l\'image' 
    });
  }
};

export default apiHandler(
  { POST: uploadImage },
  { POST: ROUTE_TYPES.PROTECTED }
);