// lib/uploadManager.js
/**
 * Helper centralisé pour la gestion des uploads
 * Assure la cohérence et la sécurité des uploads across all endpoints
 */
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_PATHS, DIR_PERMISSIONS, TEMP_DIR } from '@/lib/uploadConfig';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Assurer qu'un dossier d'upload existe avec les bonnes permissions
 * @param {string} targetDir - Chemin du dossier cible
 * @returns {Promise<void>}
 */
export async function ensureUploadDir(targetDir) {
  try {
    // Vérifier si le dossier existe
    await fs.access(targetDir);
    
    // Vérifier les permissions (minimum 0o755)
    const stats = await fs.stat(targetDir);
    if ((stats.mode & 0o200) === 0) {
      // Si pas writable, essayer de changer les permissions
      try {
        await fs.chmod(targetDir, DIR_PERMISSIONS);
      } catch (e) {
        console.warn(`Impossible de changer les permissions de ${targetDir}:`, e.message);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Dossier n'existe pas, le créer
      try {
        await fs.mkdir(targetDir, { 
          recursive: true, 
          mode: DIR_PERMISSIONS 
        });
        console.log(`✓ Dossier upload créé: ${targetDir}`);
      } catch (mkdirErr) {
        throw new Error(`Impossible de créer le dossier ${targetDir}: ${mkdirErr.message}`);
      }
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission refusée: ${targetDir} - Vérifiez les permissions du propriétaire`);
    } else {
      throw error;
    }
  }
}

/**
 * Générer un nom de fichier sécurisé
 * @param {string} originalFilename - Nom original du fichier
 * @param {string} prefix - Préfixe du fichier (ex: 'news', 'video')
 * @returns {string} - Nom de fichier sécurisé
 */
export function getSecureFilename(originalFilename, prefix = 'file') {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const extension = path.extname(originalFilename || '');
  
  // Nettoyer l'extension (enlever les chemins malveillants)
  const safeExtension = extension
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
    .slice(0, 10); // Limiter à 10 caractères
  
  return `${prefix}_${timestamp}_${randomBytes}${safeExtension}`;
}

/**
 * Valider le type MIME d'un fichier
 * @param {string} mimeType - Type MIME du fichier
 * @param {string[]} allowedTypes - Types autorisés
 * @returns {boolean}
 */
export function validateMimeType(mimeType, allowedTypes) {
  return allowedTypes.includes(mimeType);
}

/**
 * Valider la taille d'un fichier
 * @param {number} fileSize - Taille du fichier en bytes
 * @param {number} maxSize - Taille maximale en bytes
 * @returns {boolean}
 */
export function validateFileSize(fileSize, maxSize) {
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Nettoyer/supprimer un fichier uploadé en cas d'erreur
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Promise<void>}
 */
export async function cleanupUploadFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
    console.log(`✓ Fichier nettoyé: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Impossible de supprimer ${filePath}:`, error.message);
      // Ne pas lever l'erreur, le cleanup échoue silencieusement
    }
  }
}

/**
 * Assurer que le dossier temporaire existe pour Formidable
 * @returns {Promise<string>} - Chemin du dossier temp
 */
export async function ensureTempDir() {
  await ensureUploadDir(TEMP_DIR);
  return TEMP_DIR;
}

/**
 * Nettoyer les fichiers temporaires uploadés
 * À appeler régulièrement (via cron ou task scheduler)
 * @param {number} maxAgeMs - Âge maximum en millisecondes (défaut: 24h)
 * @returns {Promise<number>} - Nombre de fichiers nettoyés
 */
export async function cleanupOldTempFiles(maxAgeMs = 24 * 60 * 60 * 1000) {
  let cleanedCount = 0;

  try {
    await ensureUploadDir(TEMP_DIR);
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      try {
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      } catch (err) {
        console.warn(`Erreur en nettoyant ${filePath}:`, err.message);
      }
    }

    if (cleanedCount > 0) {
      console.log(`✓ ${cleanedCount} fichiers temporaires nettoyés`);
      await logger.info(
        LOG_TYPES.SYSTEM_ACTION,
        `Cleanup uploads: ${cleanedCount} fichiers nettoyés`,
        { cleanedCount, tempDir: TEMP_DIR }
      );
    }
  } catch (error) {
    console.error('Erreur lors du cleanup des fichiers temporaires:', error);
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur cleanup uploads temporaires',
      { error: error.message }
    );
  }

  return cleanedCount;
}

/**
 * Obtenir les statistiques d'espace disque pour les uploads
 * @param {string} targetPath - Chemin à vérifier (défaut: UPLOADS_BASE)
 * @returns {Promise<{free: number, used: number, total: number}>}
 */
export async function getUploadDiskStats(targetPath = UPLOAD_PATHS.BASE) {
  try {
    // Implémenter avec 'diskusage' si disponible
    // Pour l'instant, retourner un placeholder
    return {
      free: -1, // Non disponible
      used: -1,
      total: -1,
    };
  } catch (error) {
    console.error('Erreur récupération stats disque:', error);
    return { free: -1, used: -1, total: -1 };
  }
}

export default {
  ensureUploadDir,
  getSecureFilename,
  validateMimeType,
  validateFileSize,
  cleanupUploadFile,
  ensureTempDir,
  cleanupOldTempFiles,
  getUploadDiskStats,
};
