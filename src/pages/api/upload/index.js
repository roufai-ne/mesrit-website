// pages/api/upload/index.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { UPLOAD_PATHS, UPLOAD_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/uploadConfig';
import { 
  ensureUploadDir, 
  getSecureFilename, 
  validateMimeType, 
  cleanupUploadFile 
} from '@/lib/uploadManager';
import { handleUploadError } from '@/lib/uploadErrorHandler';
import formidable from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // Assurer que le dossier d'upload existe avec les bonnes permissions
    // IMPORTANT: Appeler AVANT formidable.init()
    await ensureUploadDir(UPLOAD_PATHS.DOCUMENTS);

    // Initialiser formidable
    const form = formidable({
      maxFileSize: UPLOAD_LIMITS.DOCUMENT,
      uploadDir: UPLOAD_PATHS.DOCUMENTS,
      keepExtensions: true,
      filename: (name, ext, part) => {
        return getSecureFilename(part.originalFilename || 'document', 'doc');
      },
    });

    // Parser le formulaire
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Extraire le fichier
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    filePath = file.filepath; // Sauvegarde pour un éventuel nettoyage

    // Valider le type MIME
    if (!validateMimeType(file.mimetype, ALLOWED_MIME_TYPES.DOCUMENT)) {
      await cleanupUploadFile(filePath);
      return res.status(400).json({ error: 'Format de fichier non supporté' });
    }

    // Retourner la réponse
    const filename = path.basename(file.filepath);
    const response = {
      success: true,
      url: `/uploads/documents/${filename}`,
      filename,
      size: file.size,
      type: file.mimetype,
    };

    return res.status(200).json(response);

  } catch (error) {
    // Gérer l'erreur de manière centralisée
    const errorResponse = await handleUploadError(error, {
      endpointName: '/api/upload',
      userId: req.user?._id,
      filePath
    });

    return res.status(errorResponse.statusCode).json({ 
      success: false,
      error: errorResponse.error,
      errorType: errorResponse.errorType,
    });
  }
}

// Utilisation de apiHandler avec la structure correcte pour les méthodes
export default apiHandler(
  { POST: uploadHandler },  // Objet avec les méthodes
  { POST: ROUTE_TYPES.PROTECTED }  // Objet avec les types de route
);