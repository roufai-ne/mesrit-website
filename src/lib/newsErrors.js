// src/lib/newsErrors.js
import logger, { LOG_TYPES } from './logger';

/**
 * Classes d'erreurs spécialisées pour le système news
 */

export class NewsSystemError extends Error {
  constructor(message, code, context = {}, originalError = null) {
    super(message);
    this.name = 'NewsSystemError';
    this.code = code;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.correlationId = this.generateCorrelationId();

    // Préserver la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NewsSystemError);
    }
  }

  generateCorrelationId() {
    return `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      stack: this.stack
    };
  }
}

export class NewsValidationError extends NewsSystemError {
  constructor(message, field, value, context = {}) {
    super(message, 'VALIDATION_ERROR', { field, value, ...context });
    this.name = 'NewsValidationError';
    this.field = field;
    this.value = value;
  }
}

export class NewsNotFoundError extends NewsSystemError {
  constructor(newsId, context = {}) {
    super(`Article non trouvé: ${newsId}`, 'NEWS_NOT_FOUND', { newsId, ...context });
    this.name = 'NewsNotFoundError';
    this.newsId = newsId;
  }
}

export class AnalyticsError extends NewsSystemError {
  constructor(message, operation, newsId, context = {}) {
    super(message, 'ANALYTICS_ERROR', { operation, newsId, ...context });
    this.name = 'AnalyticsError';
    this.operation = operation;
    this.newsId = newsId;
  }
}

export class SEOError extends NewsSystemError {
  constructor(message, operation, context = {}) {
    super(message, 'SEO_ERROR', { operation, ...context });
    this.name = 'SEOError';
    this.operation = operation;
  }
}

export class CacheError extends NewsSystemError {
  constructor(message, operation, key, context = {}) {
    super(message, 'CACHE_ERROR', { operation, key, ...context });
    this.name = 'CacheError';
    this.operation = operation;
    this.key = key;
  }
}

/**
 * Gestionnaire centralisé d'erreurs pour le système news
 */
export class NewsErrorHandler {

  /**
   * Gérer une erreur avec logging automatique
   */
  static async handleError(error, context = {}) {
    const errorData = {
      message: error.message,
      name: error.name,
      code: error.code || 'UNKNOWN_ERROR',
      context: { ...error.context, ...context },
      timestamp: new Date(),
      correlationId: error.correlationId || this.generateCorrelationId(),
      stack: error.stack
    };

    // Logger selon la sévérité
    const logLevel = this.getLogLevel(error);

    await logger[logLevel](
      this.getLogType(error),
      `Erreur système news: ${error.message}`,
      errorData
    );

    return errorData;
  }

  /**
   * Wrapper pour les opérations async avec gestion d'erreur
   */
  static async withErrorHandling(operation, context = {}) {
    try {
      return await operation();
    } catch (error) {
      // Convertir en NewsSystemError si nécessaire
      const newsError = this.normalizeError(error, context);
      await this.handleError(newsError, context);
      throw newsError;
    }
  }

  /**
   * Normaliser une erreur en NewsSystemError
   */
  static normalizeError(error, context = {}) {
    if (error instanceof NewsSystemError) {
      return error;
    }

    // Erreurs MongoDB spécifiques
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return new NewsValidationError(
          'Données dupliquées détectées',
          'duplicate',
          error.keyValue,
          { originalError: error, ...context }
        );
      }
      if (error.code === 40) {
        return new AnalyticsError(
          'Conflit lors de la mise à jour des analytics',
          'update_conflict',
          context.newsId,
          { originalError: error, ...context }
        );
      }
    }

    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const field = Object.keys(error.errors)[0];
      return new NewsValidationError(
        error.message,
        field,
        error.errors[field]?.value,
        { originalError: error, ...context }
      );
    }

    // Erreur générique
    return new NewsSystemError(
      error.message || 'Erreur système inconnue',
      'UNKNOWN_ERROR',
      { originalError: error, ...context },
      error
    );
  }

  /**
   * Déterminer le niveau de log selon l'erreur
   */
  static getLogLevel(error) {
    if (error instanceof NewsValidationError) return 'warning';
    if (error instanceof NewsNotFoundError) return 'warning';
    if (error instanceof CacheError) return 'warning';
    return 'error';
  }

  /**
   * Déterminer le type de log selon l'erreur
   */
  static getLogType(error) {
    if (error instanceof NewsValidationError) return LOG_TYPES.VALIDATION_ERROR;
    if (error instanceof AnalyticsError) return LOG_TYPES.SYSTEM_ERROR;
    if (error instanceof SEOError) return LOG_TYPES.SYSTEM_ERROR;
    if (error instanceof CacheError) return LOG_TYPES.SYSTEM_ERROR;
    return LOG_TYPES.SYSTEM_ERROR;
  }

  /**
   * Créer une réponse d'erreur standardisée pour les APIs
   */
  static createApiErrorResponse(error, req = null) {
    const newsError = this.normalizeError(error);

    // Ne pas exposer les détails sensibles en production
    const isProduction = process.env.NODE_ENV === 'production';

    const response = {
      success: false,
      error: {
        message: newsError.message,
        code: newsError.code,
        correlationId: newsError.correlationId,
        timestamp: newsError.timestamp
      }
    };

    // Ajouter les détails en développement
    if (!isProduction) {
      response.error.details = newsError.context;
      response.error.stack = newsError.stack;
    }

    // Déterminer le code de statut HTTP
    const statusCode = this.getHttpStatusCode(newsError);

    return { response, statusCode };
  }

  /**
   * Mapper les erreurs aux codes HTTP
   */
  static getHttpStatusCode(error) {
    if (error instanceof NewsValidationError) return 400;
    if (error instanceof NewsNotFoundError) return 404;
    if (error.code === 'UNAUTHORIZED') return 401;
    if (error.code === 'FORBIDDEN') return 403;
    if (error.code === 'RATE_LIMITED') return 429;
    return 500;
  }

  /**
   * Middleware Express pour gestion d'erreurs
   */
  static expressMiddleware() {
    return async (error, req, res, next) => {
      const { response, statusCode } = this.createApiErrorResponse(error, req);

      // Logger l'erreur
      await this.handleError(error, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      });

      res.status(statusCode).json(response);
    };
  }

  static generateCorrelationId() {
    return `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Décorateur pour les méthodes avec gestion d'erreur automatique
 */
export function withErrorHandling(target, propertyName, descriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      const context = {
        className: target.constructor.name,
        methodName: propertyName,
        arguments: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
      };

      throw await NewsErrorHandler.normalizeError(error, context);
    }
  };

  return descriptor;
}

// Export des constantes d'erreur
export const ERROR_CODES = {
  // Erreurs générales
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Erreurs news
  NEWS_NOT_FOUND: 'NEWS_NOT_FOUND',
  NEWS_ALREADY_EXISTS: 'NEWS_ALREADY_EXISTS',
  NEWS_INVALID_STATUS: 'NEWS_INVALID_STATUS',

  // Erreurs analytics
  ANALYTICS_ERROR: 'ANALYTICS_ERROR',
  ANALYTICS_UPDATE_CONFLICT: 'ANALYTICS_UPDATE_CONFLICT',

  // Erreurs SEO
  SEO_ERROR: 'SEO_ERROR',
  SEO_SLUG_CONFLICT: 'SEO_SLUG_CONFLICT',

  // Erreurs cache
  CACHE_ERROR: 'CACHE_ERROR',
  CACHE_MISS: 'CACHE_MISS',

  // Erreurs auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Erreurs rate limiting
  RATE_LIMITED: 'RATE_LIMITED'
};