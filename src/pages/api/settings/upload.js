import formidable from 'formidable';
import path from 'path';
import { UPLOAD_PATHS, UPLOAD_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/uploadConfig';
import { 
  ensureUploadDir, 
  getSecureFilename, 
  validateMimeType, 
  cleanupUploadFile 
} from '@/lib/uploadManager';
import { handleUploadError } from '@/lib/uploadErrorHandler';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Assurer que le dossier d'upload existe avec les bonnes permissions
      // IMPORTANT: Appeler AVANT formidable.init()
      await ensureUploadDir(UPLOAD_PATHS.IMAGES);

      // Initialiser formidable
      const form = formidable({
        uploadDir: UPLOAD_PATHS.IMAGES,
        keepExtensions: true,
        maxFileSize: UPLOAD_LIMITS.IMAGE,
        filename: (name, ext, part) => {
          return getSecureFilename(part.originalFilename, 'settings');
        }
      });

      // Parser le formulaire
      form.parse(req, async (err, fields, files) => {
        if (err) {
          const errorResponse = await handleUploadError(err, {
            endpointName: '/api/settings/upload',
          });
          return res.status(errorResponse.statusCode).json({ 
            error: errorResponse.error,
            errorType: errorResponse.errorType,
          });
        }

        // Extraire le fichier
        const file = files.image;
        if (!file) {
          return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        // Valider le type MIME
        if (!validateMimeType(file.mimetype, ALLOWED_MIME_TYPES.IMAGE)) {
          await cleanupUploadFile(file.filepath);
          return res.status(400).json({ error: 'Type de fichier non autorisé' });
        }

        // Retourner le chemin relatif
        const filename = path.basename(file.filepath);
        const newPath = `/uploads/images/${filename}`;
        res.status(200).json({ 
          success: true,
          url: newPath,
          filename,
          size: file.size,
          type: file.mimetype
        });
      });

    } catch (error) {
      const errorResponse = await handleUploadError(error, {
        endpointName: '/api/settings/upload',
      });
      return res.status(errorResponse.statusCode).json({ 
        error: errorResponse.error,
        errorType: errorResponse.errorType,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}