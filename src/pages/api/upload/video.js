// src/pages/api/upload/video.js
import formidable from 'formidable';
import path from 'path';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { UPLOAD_PATHS, UPLOAD_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/uploadConfig';
import { 
  ensureUploadDir, 
  getSecureFilename, 
  validateMimeType, 
  cleanupUploadFile 
} from '@/lib/uploadManager';
import { handleUploadError } from '@/lib/uploadErrorHandler';
import logger, { LOG_TYPES } from '@/lib/logger';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadVideoHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Assurer que les dossiers existent avec les bonnes permissions
    // IMPORTANT: Appeler AVANT formidable.init()
    await ensureUploadDir(UPLOAD_PATHS.VIDEOS_NEWS);
    await ensureUploadDir(UPLOAD_PATHS.VIDEOS_THUMBNAILS);

    // Initialiser formidable
    const form = formidable({
      uploadDir: UPLOAD_PATHS.VIDEOS_NEWS,
      keepExtensions: true,
      maxFileSize: UPLOAD_LIMITS.VIDEO,
      filename: (name, ext, part) => {
        return getSecureFilename(part.originalFilename, 'video');
      }
    });

    // Parser le formulaire
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    // Extraire le fichier
    const file = files.file?.[0] || files.file;
    if (!file) {
      throw new Error('Aucun fichier vidéo uploadé');
    }

    // Valider le type MIME
    if (!validateMimeType(file.mimetype, ALLOWED_MIME_TYPES.VIDEO)) {
      await cleanupUploadFile(file.filepath);
      return res.status(400).json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: MP4, WebM, AVI, MOV' 
      });
    }

    // Extraire les métadonnées de base
    const videoMetadata = {
      originalName: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      format: path.extname(file.originalFilename).substring(1).toLowerCase(),
      uploadedAt: new Date()
    };

    // TODO: Générer une miniature (nécessite ffmpeg)
    // Pour l'instant, on utilise une miniature par défaut
    const thumbnailPath = '/uploads/videos/thumbnails/default-video-thumbnail.jpg';

    // Retourner le chemin relatif et les métadonnées
    const filename = path.basename(file.filepath);
    const videoUrl = `/uploads/videos/news/${filename}`;

    // Logger l'upload
    const userId = req.user?.username || req.user?._id || 'unknown';
    try {
      await logger.success(
        LOG_TYPES.FILE_UPLOADED,
        `Vidéo uploadée: ${file.originalFilename}`,
        {
          fileName: filename,
          originalName: file.originalFilename,
          size: file.size,
          mimetype: file.mimetype,
          uploadedBy: userId
        },
        req
      );
    } catch (logError) {
      console.error('Error logging upload:', logError);
      // Ne pas échouer l'upload si le logging échoue
    }

    return res.status(200).json({
      success: true,
      url: videoUrl,
      filename,
      thumbnail: thumbnailPath,
      metadata: videoMetadata
    });

  } catch (error) {
    // Gérer l'erreur de manière centralisée
    const errorResponse = await handleUploadError(error, {
      endpointName: '/api/upload/video',
      userId: req.user?._id,
    });

    const userId = req.user?.username || req.user?._id || 'unknown';
    try {
      await logger.error(
        LOG_TYPES.FILE_UPLOAD_ERROR,
        'Erreur lors de l\'upload vidéo',
        {
          error: error.message,
          errorType: errorResponse.errorType,
          uploadedBy: userId
        },
        req
      );
    } catch (logError) {
      console.error('Error logging upload error:', logError);
      // Ne pas échouer si le logging échoue
    }

    return res.status(errorResponse.statusCode).json({ 
      success: false,
      error: errorResponse.error,
      errorType: errorResponse.errorType,
    });
  }
};

export default apiHandler(
  { POST: uploadVideoHandler },
  { POST: ROUTE_TYPES.PROTECTED }
);
