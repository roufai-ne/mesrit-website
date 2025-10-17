// src/lib/logger.js - Système de logging centralisé
import { connectDB } from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';
import LogAlert from '@/models/LogAlert';

/**
 * Types de logs disponibles
 */
export const LOG_TYPES = {
  // Authentification
  ACCESS: 'access',
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  SESSION_EXPIRED: 'session_expired',
  
  // Gestion des utilisateurs
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  PASSWORD_CHANGED: 'password_changed',
  ROLE_CHANGED: 'role_changed',
  
  // Gestion du contenu
  CONTENT_CREATED: 'content_created',
  CONTENT_UPDATED: 'content_updated',
  CONTENT_DELETED: 'content_deleted',
  CONTENT_PUBLISHED: 'content_published',
  CONTENT_VIEWED: 'content_viewed',
  MINISTER_CONTENT_ACCESSED: 'minister_content_accessed',
  // Actions
  USER_ACTION: 'user_action',
  ADMIN_ACTION: 'admin_action',
  
  // Système
  SYSTEM_STARTUP: 'system_startup',
  SYSTEM_SHUTDOWN: 'system_shutdown',
  SYSTEM_ERROR: 'system_error',
  SYSTEM_EVENT: 'system_event',
  BACKUP_CREATED: 'backup_created',
  BACKUP_RESTORED: 'backup_restored',
  DATABASE_ERROR: 'database_error',
  API_ERROR: 'api_error',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  
  // Sécurité
  SECURITY_BREACH: 'security_breach',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  
  // Performance
  SLOW_QUERY: 'slow_query',
  HIGH_MEMORY_USAGE: 'high_memory_usage',
  HIGH_CPU_USAGE: 'high_cpu_usage'
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
 * Classe Logger centralisée
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    // Alert rules configuration
    this.alertRules = [
      // Critical security alerts
      {
        condition: (log) => log.level === LOG_LEVELS.ERROR && 
                           (log.type === LOG_TYPES.SECURITY_BREACH || 
                            log.type === LOG_TYPES.LOGIN_FAILED) &&
                           log.details?.attempts > 5,
        priority: 'critical',
        channels: ['email', 'dashboard']
      },
      // Database errors
      {
        condition: (log) => log.level === LOG_LEVELS.ERROR && 
                           log.type === LOG_TYPES.DATABASE_ERROR,
        priority: 'high',
        channels: ['email', 'dashboard']
      },
      // API errors
      {
        condition: (log) => log.level === LOG_LEVELS.ERROR && 
                           log.type === LOG_TYPES.API_ERROR,
        priority: 'medium',
        channels: ['dashboard']
      },
      // Warning alerts
      {
        condition: (log) => log.level === LOG_LEVELS.WARNING && 
                           log.type === LOG_TYPES.SUSPICIOUS_ACTIVITY,
        priority: 'high',
        channels: ['email', 'dashboard']
      },
      // Rate limiting
      {
        condition: (log) => log.type === LOG_TYPES.RATE_LIMIT_EXCEEDED,
        priority: 'medium',
        channels: ['dashboard']
      }
    ];
  }

  /**
   * Log une action avec tous les détails
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
      // Validation des paramètres requis
      if (!type || typeof type !== 'string') {
        console.error('Logger: paramètre "type" requis et doit être une chaîne. Reçu:', { type, typeOf: typeof type });
        return null;
      }

      if (!message || typeof message !== 'string') {
        console.error('Logger: paramètre "message" requis et doit être une chaîne. Reçu:', { message, typeOf: typeof message });
        return null;
      }
      // Extraire les informations de la requête si fournie
      if (req) {
        ip = ip || this.getClientIP(req);
        userAgent = userAgent || req.headers['user-agent'];
        userId = userId || req.user?.id;
        username = username || req.user?.username;
        
        // Ajouter les détails de la requête HTTP
        if (req.method && req.url) {
          details.httpMethod = req.method;
          details.httpUrl = req.url;
        }
      }

      const logEntry = {
        timestamp: new Date(),
        level,
        type,
        message,
        userId,
        username: username || 'system',
        ip: ip || 'localhost',
        userAgent: userAgent || 'system',
        details,
        environment: process.env.NODE_ENV || 'development',
        category,
        priority,
        tags,
        relatedEntity
      };

      // Log en console pour le développement
      if (!this.isProduction) {
        console.log(`[${level.toUpperCase()}] ${type}: ${message}`, details);
      }

      // Sauvegarder en base de données
      const savedLog = await this.saveToDatabase(logEntry);

      // Alertes pour les logs critiques
      if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARNING) {
        await this.handleCriticalLog(logEntry);
      }

      // Check for alert rules
      await this.checkAlertRules(logEntry, savedLog);

      return savedLog || logEntry;
    } catch (error) {
      console.error('Erreur lors du logging:', error);
      // Ne pas faire échouer l'application si le logging échoue
    }
  }

  /**
   * Méthodes de convenance pour chaque niveau
   */
  async info(type, message, details = {}, req = null) {
    return this.log({
      level: LOG_LEVELS.INFO,
      type,
      message,
      details,
      req
    });
  }

  async success(type, message, details = {}, req = null) {
    return this.log({
      level: LOG_LEVELS.SUCCESS,
      type,
      message,
      details,
      req
    });
  }

  async warning(type, message, details = {}, req = null) {
    return this.log({
      level: LOG_LEVELS.WARNING,
      type,
      message,
      details,
      req
    });
  }

  async error(type, message, details = {}, req = null) {
    return this.log({
      level: LOG_LEVELS.ERROR,
      type,
      message,
      details,
      req
    });
  }

  async debug(type, message, details = {}, req = null) {
    if (!this.isProduction) {
      return this.log({
        level: LOG_LEVELS.DEBUG,
        type,
        message,
        details,
        req
      });
    }
  }

  /**
   * Sauvegarder le log en base de données
   */
  async saveToDatabase(logEntry) {
    try {
      await connectDB();
      
      // Créer une nouvelle entrée de log avec le modèle SystemLog
      const systemLog = new SystemLog(logEntry);
      await systemLog.save();
      
      return systemLog;
    } catch (error) {
      console.error('Erreur sauvegarde log:', error);
      // Fallback vers la méthode directe MongoDB si le modèle échoue
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        
        await client.connect();
        const db = client.db();
        const collection = db.collection('system_logs');
        
        await collection.insertOne(logEntry);
        await client.close();
      } catch (fallbackError) {
        console.error('Erreur sauvegarde log (fallback):', fallbackError);
      }
    }
  }

  /**
   * Gérer les logs critiques (alertes, notifications)
   */
  async handleCriticalLog(logEntry) {
    try {
      // Ici on pourrait :
      // - Envoyer des emails d'alerte
      // - Créer des notifications push
      // - Intégrer avec des services de monitoring (Slack, Discord, etc.)
      
      if (logEntry.level === LOG_LEVELS.ERROR) {
        console.error('🚨 LOG CRITIQUE:', logEntry.message);
      } else if (logEntry.level === LOG_LEVELS.WARNING) {
        console.warn('⚠️ LOG AVERTISSEMENT:', logEntry.message);
      }
    } catch (error) {
      console.error('Erreur gestion log critique:', error);
    }
  }

  /**
   * Check if log matches any alert rules
   */
  async checkAlertRules(logEntry, savedLog) {
    try {
      for (const rule of this.alertRules) {
        if (rule.condition(logEntry)) {
          // Create alert based on rule
          await this.createAlertFromLog(logEntry, savedLog, rule);
        }
      }
    } catch (error) {
      console.error('Error checking alert rules:', error);
    }
  }

  /**
   * Create alert from log entry
   */
  async createAlertFromLog(logEntry, savedLog, rule) {
    try {
      await connectDB();
      
      const alert = new LogAlert({
        logId: savedLog._id,
        title: `Log Alert: ${logEntry.type}`,
        message: logEntry.message,
        level: logEntry.level,
        category: logEntry.category,
        priority: rule.priority,
        status: 'pending',
        channels: rule.channels,
        triggeredBy: 'system',
        metadata: {
          logDetails: {
            type: logEntry.type,
            username: logEntry.username,
            ip: logEntry.ip,
            timestamp: logEntry.timestamp
          }
        }
      });
      
      await alert.save();
      
      // Log the alert creation
      await this.info(
        LOG_TYPES.CONTENT_CREATED,
        `Alert created for log: ${logEntry.type}`,
        { alertId: alert._id, logId: savedLog._id }
      );
    } catch (error) {
      console.error('Error creating alert from log:', error);
    }
  }

  /**
   * Extraire l'IP du client
   */
  getClientIP(req) {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Récupérer les logs avec filtres
   */
  async getLogs({
    level = null,
    type = null,
    userId = null,
    category = null,
    priority = null,
    dateFrom = null,
    dateTo = null,
    limit = 100,
    offset = 0,
    search = null,
    archived = false
  } = {}) {
    try {
      await connectDB();
      
      // Construire la requête avec le modèle SystemLog
      const query = { archived };
      
      if (level) query.level = level;
      if (type) query.type = type;
      if (userId) query.userId = userId;
      if (category) query.category = category;
      if (priority) query.priority = priority;
      
      if (dateFrom || dateTo) {
        query.timestamp = {};
        if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
        if (dateTo) query.timestamp.$lte = new Date(dateTo);
      }
      
      if (search) {
        query.$text = { $search: search };
      }
      
      // Exécuter la requête avec le modèle
      const logs = await SystemLog
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
      
      const total = await SystemLog.countDocuments(query);
      
      return {
        logs,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('Erreur récupération logs:', error);
      return { logs: [], total: 0, hasMore: false };
    }
  }

  /**
   * Obtenir les statistiques des logs
   */
  async getLogStats(dateFrom = null, dateTo = null) {
    try {
      await connectDB();
      
      // Statistiques par niveau
      const levelStats = await SystemLog.getStatsByLevel(dateFrom, dateTo);
      
      // Statistiques par catégorie
      const categoryStats = await SystemLog.getStatsByCategory(dateFrom, dateTo);
      
      // Statistiques par type (top 10)
      const matchStage = { archived: false };
      if (dateFrom || dateTo) {
        matchStage.timestamp = {};
        if (dateFrom) matchStage.timestamp.$gte = new Date(dateFrom);
        if (dateTo) matchStage.timestamp.$lte = new Date(dateTo);
      }
      
      const typeStats = await SystemLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Activité par heure (dernières 24h)
      const hourlyActivity = await SystemLog.getHourlyActivity(24);
      
      // Logs critiques non traités
      const criticalUnprocessed = await SystemLog.findUnprocessedCritical();
      
      // Statistiques par priorité
      const priorityStats = await SystemLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        levelStats: levelStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        categoryStats: categoryStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        typeStats,
        hourlyActivity,
        priorityStats: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        criticalUnprocessed: criticalUnprocessed.length,
        total: levelStats.reduce((sum, stat) => sum + stat.count, 0)
      };
    } catch (error) {
      console.error('Erreur statistiques logs:', error);
      return {
        levelStats: {},
        categoryStats: {},
        typeStats: [],
        hourlyActivity: [],
        priorityStats: {},
        criticalUnprocessed: 0,
        total: 0
      };
    }
  }

  /**
   * Récupérer les logs critiques non traités
   */
  async getCriticalUnprocessedLogs() {
    try {
      await connectDB();
      return await SystemLog.findUnprocessedCritical();
    } catch (error) {
      console.error('Erreur récupération logs critiques:', error);
      return [];
    }
  }

  /**
   * Marquer un log comme traité
   */
  async markLogAsProcessed(logId) {
    try {
      await connectDB();
      const log = await SystemLog.findById(logId);
      if (log) {
        return await log.markAsProcessed();
      }
      return null;
    } catch (error) {
      console.error('Erreur marquage log traité:', error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques avancées
   */
  async getAdvancedStats(dateFrom = null, dateTo = null) {
    try {
      await connectDB();
      
      const basicStats = await this.getLogStats(dateFrom, dateTo);
      
      // Statistiques par utilisateur (top 10)
      const matchStage = { archived: false };
      if (dateFrom || dateTo) {
        matchStage.timestamp = {};
        if (dateFrom) matchStage.timestamp.$gte = new Date(dateFrom);
        if (dateTo) matchStage.timestamp.$lte = new Date(dateTo);
      }
      
      const userStats = await SystemLog.aggregate([
        { $match: matchStage },
        { $match: { username: { $ne: 'system' } } },
        {
          $group: {
            _id: '$username',
            count: { $sum: 1 },
            levels: { $push: '$level' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Tendances (comparaison avec la période précédente)
      const periodMs = dateTo ? new Date(dateTo).getTime() - new Date(dateFrom).getTime() : 24 * 60 * 60 * 1000;
      const previousPeriodEnd = dateFrom ? new Date(dateFrom) : new Date(Date.now() - periodMs);
      const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodMs);
      
      const previousStats = await SystemLog.getStatsByLevel(previousPeriodStart, previousPeriodEnd);
      
      const trends = {};
      Object.keys(basicStats.levelStats).forEach(level => {
        const current = basicStats.levelStats[level] || 0;
        const previous = previousStats.find(s => s._id === level)?.count || 0;
        trends[level] = {
          current,
          previous,
          change: previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous * 100)
        };
      });
      
      return {
        ...basicStats,
        userStats,
        trends,
        period: {
          from: dateFrom,
          to: dateTo,
          previousFrom: previousPeriodStart,
          previousTo: previousPeriodEnd
        }
      };
    } catch (error) {
      console.error('Erreur statistiques avancées:', error);
      return {
        levelStats: {},
        categoryStats: {},
        typeStats: [],
        hourlyActivity: [],
        priorityStats: {},
        criticalUnprocessed: 0,
        userStats: [],
        trends: {},
        total: 0
      };
    }
  }

  /**
   * Recherche avancée dans les logs
   */
  async searchLogs({
    query,
    level = null,
    category = null,
    dateFrom = null,
    dateTo = null,
    limit = 50
  }) {
    try {
      await connectDB();
      
      const searchQuery = { archived: false };
      
      if (level) searchQuery.level = level;
      if (category) searchQuery.category = category;
      
      if (dateFrom || dateTo) {
        searchQuery.timestamp = {};
        if (dateFrom) searchQuery.timestamp.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.timestamp.$lte = new Date(dateTo);
      }
      
      if (query) {
        searchQuery.$text = { $search: query };
      }
      
      const logs = await SystemLog
        .find(searchQuery)
        .sort({ timestamp: -1, score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Erreur recherche logs:', error);
      return [];
    }
  }

  /**
   * Obtenir les logs par entité
   */
  async getLogsByEntity(entityType, entityId, limit = 50) {
    try {
      await connectDB();
      
      const logs = await SystemLog
        .find({
          'relatedEntity.type': entityType,
          'relatedEntity.id': entityId,
          archived: false
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Erreur logs par entité:', error);
      return [];
    }
  }

  /**
   * Nettoyer les anciens logs
   */
  async cleanOldLogs(daysToKeep = 90) {
    try {
      await connectDB();
      
      // D'abord archiver les logs anciens
      const archiveResult = await SystemLog.archiveOldLogs(30);
      
      // Ensuite supprimer les logs très anciens et archivés
      const deleteResult = await SystemLog.cleanOldLogs(daysToKeep);
      
      await this.info(
        LOG_TYPES.SYSTEM_STARTUP, 
        `Nettoyage des logs: ${archiveResult.modifiedCount} logs archivés, ${deleteResult.deletedCount} entrées supprimées`
      );
      
      return {
        archived: archiveResult.modifiedCount || 0,
        deleted: deleteResult.deletedCount || 0
      };
    } catch (error) {
      console.error('Erreur nettoyage logs:', error);
      return { archived: 0, deleted: 0 };
    }
  }
}

// Instance singleton
const logger = new Logger();

export default logger;

// Middleware pour logger automatiquement les requêtes API
export function withLogging(handler, logType = null) {
  return async (req, res) => {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, res);
      
      const duration = Date.now() - startTime;
      
      // Logger les requêtes lentes
      if (duration > 1000) {
        await logger.warning(
          LOG_TYPES.SLOW_QUERY,
          `Requête lente: ${req.method} ${req.url} (${duration}ms)`,
          { duration, method: req.method, url: req.url },
          req
        );
      }
      
      // Logger l'action si un type est spécifié
      if (logType) {
        await logger.info(
          logType,
          `${req.method} ${req.url}`,
          { 
            duration, 
            status: res.statusCode,
            httpMethod: req.method,
            httpUrl: req.url,
            httpStatus: res.statusCode
          },
          req
        );
      }
      
      return result;
    } catch (error) {
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur API: ${req.method} ${req.url} - ${error.message}`,
        { 
          error: error.message,
          stack: error.stack,
          method: req.method,
          url: req.url
        },
        req
      );
      
      throw error;
    }
  };
}