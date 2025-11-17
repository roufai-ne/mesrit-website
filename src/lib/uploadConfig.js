// lib/uploadConfig.js
/**
 * Configuration centralisée pour les uploads
 * Permet de configurer les chemins via variables d'environnement
 */
import path from 'path';

// Base path pour tous les uploads (configurable via env)
const UPLOADS_BASE = process.env.UPLOADS_BASE_PATH 
  ? path.resolve(process.env.UPLOADS_BASE_PATH)
  : path.join(process.cwd(), 'public');

// Chemins relatifs
export const UPLOAD_PATHS = {
  BASE: UPLOADS_BASE,
  IMAGES: path.join(UPLOADS_BASE, 'images'),
  IMAGES_NEWS: path.join(UPLOADS_BASE, 'images/news'),
  IMAGES_DIR: path.join(UPLOADS_BASE, 'images/dir'),
  IMAGES_LOGOS: path.join(UPLOADS_BASE, 'images/logos'),
  VIDEOS_NEWS: path.join(UPLOADS_BASE, 'videos/news'),
  VIDEOS_THUMBNAILS: path.join(UPLOADS_BASE, 'videos/news/thumbnails'),
  DOCUMENTS: path.join(UPLOADS_BASE, 'documents'),
};

// Limites de taille
export const UPLOAD_LIMITS = {
  IMAGE: parseInt(process.env.UPLOAD_MAX_SIZE_IMAGE || '10485760'), // 10MB
  VIDEO: parseInt(process.env.UPLOAD_MAX_SIZE_VIDEO || '52428800'), // 50MB
  DOCUMENT: parseInt(process.env.UPLOAD_MAX_SIZE_DOCUMENT || '15728640'), // 15MB
};

// Types MIME autorisés
export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// Préfixes de fichiers pour éviter les collisions
export const FILE_PREFIXES = {
  IMAGE: 'img',
  NEWS: 'news',
  VIDEO: 'video',
  DIR: 'dir',
  ESTABLISHMENT: 'est',
  DOCUMENT: 'doc',
  THUMBNAIL: 'thumb',
};

// Répertoire temporaire pour Formidable
export const TEMP_DIR = process.env.NODE_UPLOAD_TMPDIR 
  ? path.resolve(process.env.NODE_UPLOAD_TMPDIR)
  : path.join(process.cwd(), '.uploads-tmp');

// Permissions par défaut (0o755 = rwxr-xr-x)
export const DIR_PERMISSIONS = 0o755;

/**
 * Valider que les chemins d'upload sont correctement configurés
 */
export function validateUploadConfig() {
  const errors = [];

  if (!UPLOADS_BASE) {
    errors.push('UPLOADS_BASE_PATH non défini');
  }

  if (UPLOAD_LIMITS.IMAGE <= 0) {
    errors.push('UPLOAD_MAX_SIZE_IMAGE invalide');
  }

  if (UPLOAD_LIMITS.VIDEO <= 0) {
    errors.push('UPLOAD_MAX_SIZE_VIDEO invalide');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration d'uploads invalide: ${errors.join(', ')}`);
  }

  return {
    uploadsBase: UPLOADS_BASE,
    tempDir: TEMP_DIR,
    limits: UPLOAD_LIMITS,
  };
}

export default {
  UPLOAD_PATHS,
  UPLOAD_LIMITS,
  ALLOWED_MIME_TYPES,
  FILE_PREFIXES,
  TEMP_DIR,
  DIR_PERMISSIONS,
  validateUploadConfig,
};
