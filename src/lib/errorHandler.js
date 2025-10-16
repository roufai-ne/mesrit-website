// src/lib/errorHandler.js
import { toast } from 'react-hot-toast';

/**
 * Types d'erreurs standardisés
 */
export const ERROR_TYPES = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  SERVER: 'SERVER',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Messages d'erreur standardisés en français
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.AUTHENTICATION]: {
    default: 'Erreur d\'authentification. Veuillez vous reconnecter.',
    invalid_credentials: 'Nom d\'utilisateur ou mot de passe incorrect.',
    session_expired: 'Votre session a expiré. Veuillez vous reconnecter.',
    token_invalid: 'Token d\'authentification invalide.',
    account_locked: 'Votre compte a été verrouillé. Contactez l\'administrateur.'
  },
  [ERROR_TYPES.AUTHORIZATION]: {
    default: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
    insufficient_permissions: 'Permissions insuffisantes.',
    admin_required: 'Accès administrateur requis.',
    role_required: 'Rôle spécifique requis pour cette action.'
  },
  [ERROR_TYPES.VALIDATION]: {
    default: 'Données invalides. Veuillez vérifier vos informations.',
    required_field: 'Ce champ est obligatoire.',
    invalid_format: 'Format invalide.',
    password_weak: 'Le mot de passe doit contenir au moins 8 caractères.',
    email_invalid: 'Adresse email invalide.'
  },
  [ERROR_TYPES.NETWORK]: {
    default: 'Erreur de connexion. Vérifiez votre connexion internet.',
    timeout: 'La requête a expiré. Veuillez réessayer.',
    offline: 'Vous êtes hors ligne. Vérifiez votre connexion.',
    server_unreachable: 'Serveur inaccessible. Réessayez plus tard.'
  },
  [ERROR_TYPES.SERVER]: {
    default: 'Erreur serveur. Veuillez réessayer plus tard.',
    maintenance: 'Le serveur est en maintenance. Réessayez plus tard.',
    overload: 'Le serveur est surchargé. Veuillez patienter.',
    database_error: 'Erreur de base de données. Contactez le support.'
  },
  [ERROR_TYPES.NOT_FOUND]: {
    default: 'Ressource non trouvée.',
    user_not_found: 'Utilisateur non trouvé.',
    page_not_found: 'Page non trouvée.',
    resource_not_found: 'Ressource demandée non trouvée.'
  },
  [ERROR_TYPES.CONFLICT]: {
    default: 'Conflit de données.',
    duplicate_entry: 'Cette entrée existe déjà.',
    username_taken: 'Ce nom d\'utilisateur est déjà pris.',
    email_taken: 'Cette adresse email est déjà utilisée.'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    default: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
    login_attempts: 'Trop de tentatives de connexion. Attendez quelques minutes.',
    api_limit: 'Limite d\'API atteinte. Réessayez plus tard.'
  },
  [ERROR_TYPES.UNKNOWN]: {
    default: 'Une erreur inattendue s\'est produite.'
  }
};

/**
 * Classe d'erreur personnalisée
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Détermine le type d'erreur basé sur le code de statut HTTP
 */
export function getErrorTypeFromStatus(statusCode) {
  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 409:
      return ERROR_TYPES.CONFLICT;
    case 429:
      return ERROR_TYPES.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
}

/**
 * Parse une erreur de réponse API
 */
export async function parseApiError(response) {
  try {
    const data = await response.json().catch(() => ({}));
    const type = getErrorTypeFromStatus(response.status);
    // Ne jamais lancer d'exception ici, toujours retourner une instance AppError
    return new AppError(
      data.message || ERROR_MESSAGES[type].default,
      type,
      response.status,
      data.details || null
    );
  } catch (parseError) {
    const type = getErrorTypeFromStatus(response.status);
    return new AppError(
      ERROR_MESSAGES[type].default,
      type,
      response.status
    );
  }
}

/**
 * Gestionnaire d'erreur pour les requêtes fetch
 */
export async function handleFetchError(error, url = '') {
  console.error(`Fetch error for ${url}:`, error);

  // Erreur de réseau
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_TYPES.NETWORK].default,
      ERROR_TYPES.NETWORK,
      0
    );
  }

  // Erreur de timeout
  if (error.name === 'AbortError') {
    return new AppError(
      ERROR_MESSAGES[ERROR_TYPES.NETWORK].timeout,
      ERROR_TYPES.NETWORK,
      408
    );
  }

  // Erreur personnalisée déjà formatée
  if (error instanceof AppError) {
    return error;
  }

  // Erreur générique
  return new AppError(
    error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN].default,
    ERROR_TYPES.UNKNOWN,
    500
  );
}

/**
 * Affiche une notification d'erreur à l'utilisateur
 */
export function showErrorNotification(error, options = {}) {
  const {
    duration = 5000,
    showDetails = process.env.NODE_ENV === 'development',
    position = 'top-right'
  } = options;

  let message = error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN].default;
  
  // Ajouter les détails en mode développement
  if (showDetails && error.details) {
    message += `\n\nDétails: ${JSON.stringify(error.details, null, 2)}`;
  }

  // Choisir le type de toast selon le type d'erreur
  switch (error.type) {
    case ERROR_TYPES.AUTHENTICATION:
    case ERROR_TYPES.AUTHORIZATION:
      toast.error(message, { duration, position });
      break;
    case ERROR_TYPES.VALIDATION:
      toast.error(message, { duration: 4000, position });
      break;
    case ERROR_TYPES.NETWORK:
      toast.error(message, { duration: 6000, position });
      break;
    case ERROR_TYPES.SERVER:
      toast.error(message, { duration: 7000, position });
      break;
    default:
      toast.error(message, { duration, position });
  }
}

/**
 * Gestionnaire d'erreur global pour les composants React
 */
export function handleComponentError(error, errorInfo, componentName = 'Component') {
  console.error(`Error in ${componentName}:`, error, errorInfo);
  
  const appError = new AppError(
    `Erreur dans le composant ${componentName}`,
    ERROR_TYPES.UNKNOWN,
    500,
    { originalError: error.message, errorInfo }
  );
  
  showErrorNotification(appError);
  
  return appError;
}

/**
 * Wrapper pour les appels API avec gestion d'erreur automatique
 */
export async function apiCall(url, options = {}, showNotification = true) {
  try {
    const {
      timeout = 10000,
      retries = 0,
      ...fetchOptions
    } = options;

    // Ajouter un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await parseApiError(response);
      if (showNotification) {
        showErrorNotification(error);
      }
      throw error;
    }

    return await response.json();
  } catch (error) {
    const handledError = await handleFetchError(error, url);
    
    if (showNotification && !(error instanceof AppError)) {
      showErrorNotification(handledError);
    }
    
    throw handledError;
  }
}

/**
 * Middleware pour les API routes Next.js
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          type: error.type,
          details: error.details,
          timestamp: error.timestamp
        });
      }
      
      // Erreur non gérée
      return res.status(500).json({
        success: false,
        message: ERROR_MESSAGES[ERROR_TYPES.SERVER].default,
        type: ERROR_TYPES.SERVER,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Utilitaires pour la validation
 */
export const validators = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new AppError(
        `${fieldName} est obligatoire`,
        ERROR_TYPES.VALIDATION,
        400
      );
    }
  },
  
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(
        ERROR_MESSAGES[ERROR_TYPES.VALIDATION].email_invalid,
        ERROR_TYPES.VALIDATION,
        400
      );
    }
  },
  
  password: (password) => {
    if (password.length < 8) {
      throw new AppError(
        ERROR_MESSAGES[ERROR_TYPES.VALIDATION].password_weak,
        ERROR_TYPES.VALIDATION,
        400
      );
    }
  },
  
  role: (role) => {
    const { ROLES_HIERARCHY } = require('./rbac');
    const validRoles = Object.keys(ROLES_HIERARCHY);
    if (!validRoles.includes(role)) {
      throw new AppError(
        `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}`,
        ERROR_TYPES.VALIDATION,
        400
      );
    }
  }
};

const errorHandler = {
  ERROR_TYPES,
  ERROR_MESSAGES,
  AppError,
  parseApiError,
  handleFetchError,
  showErrorNotification,
  handleComponentError,
  apiCall,
  withErrorHandler,
  validators
};