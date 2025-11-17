// src/pages/api/upload/establishment.js
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

    // Assurer que le dossier d'upload existe avec les bonnes permissions
    // IMPORTANT: Appeler AVANT formidable.init()
    await ensureUploadDir(UPLOAD_PATHS.IMAGES_LOGOS);

    // Initialiser formidable
    const form = formidable({
      uploadDir: UPLOAD_PATHS.IMAGES_LOGOS,
      keepExtensions: true,
      maxFileSize: UPLOAD_LIMITS.IMAGE,
      filename: (name, ext, part) => {
        return getSecureFilename(part.originalFilename || 'logo.jpg', 'est');
      }
    });

    // Parser le formulaire
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extraire le fichier
    const file = files.file;
    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: 'Aucun fichier uploadé' 
      });
    }

    // Valider le type MIME
    if (!validateMimeType(file.mimetype, ALLOWED_MIME_TYPES.IMAGE)) {
      await cleanupUploadFile(file.filepath);
      return res.status(400).json({ 
        success: false,
        error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.' 
      });
    }

    // Retourner l'URL relative
    const filename = path.basename(file.filepath);
    const relativeUrl = `/uploads/images/logos/${filename}`;

    return res.status(200).json({ 
      success: true,
      url: relativeUrl,
      filename,
      size: file.size,
      type: file.mimetype
    });

  } catch (error) {
    // Gérer l'erreur de manière centralisée
    const errorResponse = await handleUploadError(error, {
      endpointName: '/api/upload/establishment',
      userId: req.user?._id,
    });

    return res.status(errorResponse.statusCode).json({ 
      success: false,
      error: errorResponse.error,
      errorType: errorResponse.errorType,
    });
  }
};

export default apiHandler(
  { POST: uploadEstablishmentLogo },
  { POST: ROUTE_TYPES.PROTECTED }
);