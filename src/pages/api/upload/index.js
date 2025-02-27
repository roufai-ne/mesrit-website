// pages/api/upload/index.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import formidable from 'formidable';
import { join } from 'path';
import { mkdir, unlink } from 'fs/promises';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function createUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'documents');
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

async function uploadHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérification de l'utilisateur (fourni par securityMiddleware)
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  let filePath; // Pour stocker le chemin du fichier temporaire à nettoyer en cas d'erreur

  try {
    const uploadDir = await createUploadDir();

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir,
      keepExtensions: true,
      filename: (name, ext) => {
        const randomString = crypto.randomBytes(16).toString('hex');
        return `${Date.now()}-${randomString}${ext}`;
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    filePath = file.filepath; // Sauvegarde pour un éventuel nettoyage

    const allowedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      await unlink(filePath).catch(() => {}); // Nettoyage si type invalide
      return res.status(400).json({ error: 'Format de fichier non supporté' });
    }

    const response = {
      url: `/documents/${file.newFilename}`,
      size: file.size,
      type: file.mimetype,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);

    // Nettoyage du fichier en cas d'erreur
    if (filePath) {
      await unlink(filePath).catch((err) =>
        console.error('Erreur lors du nettoyage:', err)
      );
    }

    if (error.code === 'ENOENT') {
      return res.status(500).json({ error: 'Erreur de configuration du serveur' });
    }
    if (error.httpCode === 413) {
      return res.status(413).json({ error: 'Fichier trop volumineux (max 10MB)' });
    }
    return res.status(500).json({ error: "Erreur lors de l'upload" });
  }
}

// Utilisation de apiHandler avec la structure correcte pour les méthodes
export default apiHandler(
  { POST: uploadHandler },  // Objet avec les méthodes
  { POST: ROUTE_TYPES.PROTECTED }  // Objet avec les types de route
);