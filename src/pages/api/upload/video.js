// src/pages/api/upload/video.js
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
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

    // Définir les chemins de destination
    const videoDir = path.join(process.cwd(), 'public/videos/news');
    const thumbnailDir = path.join(process.cwd(), 'public/videos/news/thumbnails');

    // Vérifier/créer les dossiers
    try {
      await fs.access(videoDir);
    } catch {
      await fs.mkdir(videoDir, { recursive: true });
    }

    try {
      await fs.access(thumbnailDir);
    } catch {
      await fs.mkdir(thumbnailDir, { recursive: true });
    }

    // Créer un nom de fichier sécurisé
    const generateSecureFilename = (originalFilename) => {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(16).toString('hex');
      const extension = path.extname(originalFilename);
      return `video_${timestamp}_${randomString}${extension}`;
    };

    const form = formidable({
      uploadDir: videoDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filename: (name, ext, part) => {
        // Vérifier que c'est bien une vidéo
        if (part.mimetype && !part.mimetype.includes('video/')) {
          throw new Error('Seules les vidéos sont autorisées');
        }
        return generateSecureFilename(part.originalFilename);
      },
      filter: ({ mimetype }) => {
        // Accepter seulement les vidéos
        return mimetype && mimetype.includes('video');
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
      throw new Error('Aucun fichier vidéo uploadé');
    }

    // Vérification du type MIME
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm', 
      'video/avi',
      'video/mov',
      'video/quicktime'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      await fs.unlink(file.filepath);
      return res.status(400).json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: MP4, WebM, AVI, MOV' 
      });
    }

    // Vérifier la taille du fichier
    if (file.size > 50 * 1024 * 1024) {
      await fs.unlink(file.filepath);
      return res.status(400).json({ 
        error: 'Fichier trop volumineux. Taille maximum: 50MB' 
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
    const thumbnailPath = '/videos/news/thumbnails/default-video-thumbnail.jpg';

    // Retourner le chemin relatif et les métadonnées
    const videoUrl = `/videos/news/${path.basename(file.filepath)}`;

    // Logger l'upload
    await logger.success(
      LOG_TYPES.FILE_UPLOADED,
      `Vidéo uploadée: ${file.originalFilename}`,
      {
        fileName: path.basename(file.filepath),
        originalName: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: req.user.username || req.user.id
      },
      req
    );

    return res.status(200).json({
      success: true,
      url: videoUrl,
      thumbnail: thumbnailPath,
      metadata: videoMetadata
    });

  } catch (error) {
    console.error('Erreur upload vidéo:', error);
    
    await logger.error(
      LOG_TYPES.FILE_UPLOAD_ERROR,
      'Erreur lors de l\'upload vidéo',
      {
        error: error.message,
        uploadedBy: req.user?.username || req.user?.id
      },
      req
    );

    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'upload de la vidéo' 
    });
  }
};

export default apiHandler(uploadVideoHandler, {
  POST: ROUTE_TYPES.PROTECTED
});
