// src/lib/logger.js - Système de logging centralisé (Simplified for Static/Strapi)

/**
 * Types de logs disponibles
 */
export const LOG_TYPES = {
  // Authentification (Legacy/Strapi)
  ACCESS: 'access',
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  SESSION_EXPIRED: 'session_expired',

  // Gestion du contenu
  CONTENT_CREATED: 'content_created',
  CONTENT_UPDATED: 'content_updated',
  CONTENT_DELETED: 'content_deleted',
  CONTENT_PUBLISHED: 'content_published',
  CONTENT_VIEWED: 'content_viewed',
  MINISTER_CONTENT_ACCESSED: 'minister_content_accessed',

  // Système
  SYSTEM_STARTUP: 'system_startup',
  SYSTEM_SHUTDOWN: 'system_shutdown',
  SYSTEM_ERROR: 'system_error',
  SYSTEM_EVENT: 'system_event',
  API_ERROR: 'api_error',

  // Sécurité
  SECURITY_BREACH: 'security_breach',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',

  // Performance
  SLOW_QUERY: 'slow_query'
};

/**
 * Niveaux de log
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
  DEBUG: 'debug'
};

/**
 * Classe Logger centralisée (Console Only)
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log une action
   */
  async log({
    level = LOG_LEVELS.INFO,
    type,
    message,
    userId = null,
    username = null,
    ip = null,
    userAgent = null,
    details = {},
    req = null,
    category = null,
    priority = null,
    tags = [],
    relatedEntity = null
  }) {
    try {
      if (req) {
        ip = ip || (req.headers && (req.headers['x-forwarded-for'] || req.connection?.remoteAddress));
        userAgent = userAgent || (req.headers && req.headers['user-agent']);
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        type,
        message,
        details,
        environment: process.env.NODE_ENV || 'development'
      };

      // Console output
      const consoleMsg = `[${level.toUpperCase()}] ${type}: ${message}`;
      if (level === LOG_LEVELS.ERROR) {
        console.error(consoleMsg, details);
      } else if (level === LOG_LEVELS.WARNING) {
        console.warn(consoleMsg, details);
      } else if (level === LOG_LEVELS.INFO || level === LOG_LEVELS.SUCCESS) {
        console.log(consoleMsg);
      } else if (level === LOG_LEVELS.DEBUG && !this.isProduction) {
        console.debug(consoleMsg, details);
      }

      return logEntry;
    } catch (error) {
      console.error('Logger internal error:', error);
    }
  }

  async info(type, message, details = {}, req = null) {
    return this.log({ level: LOG_LEVELS.INFO, type, message, details, req });
  }

  async success(type, message, details = {}, req = null) {
    return this.log({ level: LOG_LEVELS.SUCCESS, type, message, details, req });
  }

  async warning(type, message, details = {}, req = null) {
    return this.log({ level: LOG_LEVELS.WARNING, type, message, details, req });
  }

  async error(type, message, details = {}, req = null) {
    return this.log({ level: LOG_LEVELS.ERROR, type, message, details, req });
  }

  async debug(type, message, details = {}, req = null) {
    return this.log({ level: LOG_LEVELS.DEBUG, type, message, details, req });
  }

  // Stubs for methods previously used by Dashboard but now removed/obsolete.
  // Kept empty to prevent runtime crashes if any stray calls remain.
  async getLogs() { return { logs: [], total: 0 }; }
  async getLogStats() { return {}; }
  async getAdvancedStats() { return {}; }
  async searchLogs() { return []; }
  async getLogsByEntity() { return []; }
  async cleanOldLogs() { return { archived: 0, deleted: 0 }; }
  async markLogAsProcessed() { return null; }
  async getCriticalUnprocessedLogs() { return []; }
}

const logger = new Logger();
export default logger;

export function withLogging(handler, logType = null) {
  return async (req, res) => {
    try {
      const result = await handler(req, res);
      if (logType) {
        logger.info(logType, `${req.method} ${req.url}`, { status: res.statusCode }, req);
      }
      return result;
    } catch (error) {
      logger.error('API_ERROR', `Error in ${req.url}: ${error.message}`, { stack: error.stack }, req);
      throw error;
    }
  };
}