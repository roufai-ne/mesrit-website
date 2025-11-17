// lib/uploadErrorHandler.js
/**
 * Gestionnaire centralisé des erreurs d'upload
 * Mappe les erreurs du système de fichiers à des messages utilisateur
 */
import logger, { LOG_TYPES } from '@/lib/logger';
import { cleanupUploadFile } from '@/lib/uploadManager';

/**
 * Types d'erreurs d'upload
 */
export const UPLOAD_ERROR_TYPES = {
  NO_FILE: 'NO_FILE',
  INVALID_MIME_TYPE: 'INVALID_MIME_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_FULL: 'DISK_FULL',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  FORMIDABLE_PARSE_ERROR: 'FORMIDABLE_PARSE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Messages d'erreur utilisateur
 */
export const ERROR_MESSAGES = {
  [UPLOAD_ERROR_TYPES.NO_FILE]: 'Aucun fichier uploadé',
  [UPLOAD_ERROR_TYPES.INVALID_MIME_TYPE]: 'Type de fichier non autorisé',
  [UPLOAD_ERROR_TYPES.FILE_TOO_LARGE]: 'Fichier trop volumineux',
  [UPLOAD_ERROR_TYPES.PERMISSION_DENIED]: 'Permission refusée sur le serveur (contact admin)',
  [UPLOAD_ERROR_TYPES.DISK_FULL]: 'Espace disque insuffisant (contact admin)',
  [UPLOAD_ERROR_TYPES.DIRECTORY_NOT_FOUND]: 'Dossier d\'upload non trouvé (contact admin)',
  [UPLOAD_ERROR_TYPES.FORMIDABLE_PARSE_ERROR]: 'Erreur lors du traitement du fichier',
  [UPLOAD_ERROR_TYPES.UNKNOWN_ERROR]: 'Erreur serveur lors de l\'upload',
};

/**
 * Classifier une erreur de système de fichiers
 * @param {Error} error - Erreur capturée
 * @returns {string} - Type d'erreur
 */
function classifyError(error) {
  if (!error) return UPLOAD_ERROR_TYPES.UNKNOWN_ERROR;

  // Erreurs de code système
  if (error.code === 'EACCES') {
    return UPLOAD_ERROR_TYPES.PERMISSION_DENIED;
  }
  if (error.code === 'ENOSPC') {
    return UPLOAD_ERROR_TYPES.DISK_FULL;
  }
  if (error.code === 'ENOENT') {
    return UPLOAD_ERROR_TYPES.DIRECTORY_NOT_FOUND;
  }
  if (error.code === 'EISDIR') {
    return UPLOAD_ERROR_TYPES.DIRECTORY_NOT_FOUND;
  }

  // Erreurs Formidable
  if (error.message && error.message.includes('maxFileSize')) {
    return UPLOAD_ERROR_TYPES.FILE_TOO_LARGE;
  }
  if (error.name === 'FormidableError') {
    return UPLOAD_ERROR_TYPES.FORMIDABLE_PARSE_ERROR;
  }

  return UPLOAD_ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Obtenir le code HTTP pour une erreur
 * @param {string} errorType - Type d'erreur
 * @returns {number} - Code HTTP
 */
function getHttpStatusCode(errorType) {
  const statusMap = {
    [UPLOAD_ERROR_TYPES.NO_FILE]: 400,
    [UPLOAD_ERROR_TYPES.INVALID_MIME_TYPE]: 400,
    [UPLOAD_ERROR_TYPES.FILE_TOO_LARGE]: 413,
    [UPLOAD_ERROR_TYPES.PERMISSION_DENIED]: 500,
    [UPLOAD_ERROR_TYPES.DISK_FULL]: 507,
    [UPLOAD_ERROR_TYPES.DIRECTORY_NOT_FOUND]: 500,
    [UPLOAD_ERROR_TYPES.FORMIDABLE_PARSE_ERROR]: 400,
    [UPLOAD_ERROR_TYPES.UNKNOWN_ERROR]: 500,
  };

  return statusMap[errorType] || 500;
}

/**
 * Gérer une erreur d'upload
 * @param {Error} error - Erreur capturée
 * @param {Object} context - Contexte de l'erreur
 * @returns {Object} - Réponse structurée
 */
export async function handleUploadError(error, context = {}) {
  const {
    filePath = null,
    endpointName = 'unknown',
    userId = null,
    originalFilename = null,
  } = context;

  // Classifier l'erreur
  const errorType = classifyError(error);
  const statusCode = getHttpStatusCode(errorType);
  const userMessage = ERROR_MESSAGES[errorType];

  // Nettoyer le fichier temporaire s'il existe
  if (filePath) {
    await cleanupUploadFile(filePath);
  }

  // Logger l'erreur
  const logData = {
    errorType,
    endpoint: endpointName,
    userId,
    originalFilename,
    errorCode: error?.code,
    errorMessage: error?.message,
  };

  if (statusCode >= 500) {
    // Erreurs serveur
    await logger.error(
      LOG_TYPES.ERROR,
      `Upload error: ${endpointName}`,
      logData
    );
  } else if (statusCode >= 400) {
    // Erreurs client
    console.warn(`Upload client error (${statusCode}):`, logData);
  }

  // Retourner une réponse structurée
  return {
    statusCode,
    error: userMessage,
    errorType,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Wrapper pour capturer les erreurs async
 * @param {Function} handler - Fonction handler de l'upload
 * @returns {Function} - Handler enrobé
 */
export function withUploadErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const errorResponse = await handleUploadError(error, {
        endpointName: req.url,
        userId: req.user?._id,
      });

      return res.status(errorResponse.statusCode).json({
        success: false,
        error: errorResponse.error,
        errorType: errorResponse.errorType,
      });
    }
  };
}

export default {
  UPLOAD_ERROR_TYPES,
  ERROR_MESSAGES,
  handleUploadError,
  withUploadErrorHandling,
};
