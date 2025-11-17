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

const uploadDirImage = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Non authentifié' 
      });
    }

    // Assurer que le dossier d'upload existe avec les bonnes permissions
    // IMPORTANT: Appeler AVANT formidable.init()
    await ensureUploadDir(UPLOAD_PATHS.IMAGES_DIR);

    // Initialiser formidable
    const form = formidable({
      uploadDir: UPLOAD_PATHS.IMAGES_DIR,
      keepExtensions: true,
      maxFileSize: UPLOAD_LIMITS.IMAGE,
      filename: (name, ext, part) => {
        return getSecureFilename(part.originalFilename || 'image.jpg', 'dir');
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
        error: 'Aucun fichier uploadé ou le fichier n\'est pas une image valide' 
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

    // Retourner le chemin relatif
    const filename = path.basename(file.filepath);
    return res.status(200).json({
      success: true,
      url: `/uploads/images/dir/${filename}`,
      filename,
      size: file.size,
      type: file.mimetype
    });

  } catch (error) {
    // Gérer l'erreur de manière centralisée
    const errorResponse = await handleUploadError(error, {
      endpointName: '/api/upload/dir',
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
  { POST: uploadDirImage },
  { POST: ROUTE_TYPES.PROTECTED }
);