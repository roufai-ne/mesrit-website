// src/lib/monitoringV2.js
import { EventEmitter } from 'events';
import newsEventBus from './eventBus.js';
import intelligentCache from './intelligentCache.js';
import logger, { LOG_TYPES } from './logger.js';
import { NewsErrorHandler } from './newsErrors.js';

/**
 * Système de monitoring et alertes pour le système V2
 */
class MonitoringSystemV2 extends EventEmitter {
  constructor() {
    super();

    this.metrics = {
      performance: new Map(),
      errors: new Map(),
      analytics: new Map(),
      cache: new Map(),
      system: new Map()
    };

    this.alerts = {
      thresholds: {
        responseTime: 1000,        // ms
        errorRate: 5,             // %
        cacheHitRate: 70,         // %
        memoryUsage: 85,          // %
        diskUsage: 90             // %
      },
      history: [],
      active: new Set()
    };

    this.isMonitoring = false;
    this.intervals = new Map();

    this.setupEventListeners();
  }

  /**
   * Démarrer le monitoring
   */
  start() {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring déjà actif');
      return;
    }

    console.log('🚀 Démarrage du monitoring V2...');
    this.isMonitoring = true;

    // Monitoring en temps réel
    this.startPerformanceMonitoring();
    this.startErrorMonitoring();
    this.startCacheMonitoring();
    this.startSystemMonitoring();

    // Rapports périodiques
    this.scheduleReports();

    logger.info(LOG_TYPES.SYSTEM_EVENT, 'Monitoring V2 démarré');
  }

  /**
   * Arrêter le monitoring
   */
  stop() {
    if (!this.isMonitoring) return;

    console.log('🛑 Arrêt du monitoring...');
    this.isMonitoring = false;

    // Arrêter tous les intervalles
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`✅ Arrêt monitoring ${name}`);
    }
    this.intervals.clear();

    logger.info(LOG_TYPES.SYSTEM_EVENT, 'Monitoring V2 arrêté');
  }

  /**
   * Configurer les écouteurs d'événements
   */
  setupEventListeners() {
    const { EVENTS } = newsEventBus.constructor;

    // Monitoring des événements analytics
    newsEventBus.subscribeToEvent(EVENTS.NEWS_VIEWED, (data) => {
      this.recordAnalyticsEvent('view', data);
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_SHARED, (data) => {
      this.recordAnalyticsEvent('share', data);
    });

    // Monitoring des événements cache
    newsEventBus.subscribeToEvent(EVENTS.CACHE_INVALIDATE, (data) => {
      this.recordCacheEvent('invalidation', data);
    });

    // Monitoring des erreurs système
    process.on('unhandledRejection', (reason, promise) => {
      this.recordSystemError('unhandledRejection', reason);
    });

    process.on('uncaughtException', (error) => {
      this.recordSystemError('uncaughtException', error);
    });
  }

  /**
   * Monitoring des performances
   */
  startPerformanceMonitoring() {
    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectPerformanceMetrics();
        this.updateMetrics('performance', metrics);
        this.checkPerformanceAlerts(metrics);
      } catch (error) {
        console.error('Erreur monitoring performance:', error);
      }
    }, 30000); // Toutes les 30 secondes

    this.intervals.set('performance', interval);
  }

  /**
   * Monitoring des erreurs
   */
  startErrorMonitoring() {
    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectErrorMetrics();
        this.updateMetrics('errors', metrics);
        this.checkErrorAlerts(metrics);
      } catch (error) {
        console.error('Erreur monitoring erreurs:', error);
      }
    }, 60000); // Toutes les minutes

    this.intervals.set('errors', interval);
  }

  /**
   * Monitoring du cache
   */
  startCacheMonitoring() {
    const interval = setInterval(() => {
      try {
        const metrics = this.collectCacheMetrics();
        this.updateMetrics('cache', metrics);
        this.checkCacheAlerts(metrics);
      } catch (error) {
        console.error('Erreur monitoring cache:', error);
      }
    }, 45000); // Toutes les 45 secondes

    this.intervals.set('cache', interval);
  }

  /**
   * Monitoring système
   */
  startSystemMonitoring() {
    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        this.updateMetrics('system', metrics);
        this.checkSystemAlerts(metrics);
      } catch (error) {
        console.error('Erreur monitoring système:', error);
      }
    }, 120000); // Toutes les 2 minutes

    this.intervals.set('system', interval);
  }

  /**
   * Collecter les métriques de performance
   */
  async collectPerformanceMetrics() {
    const processMetrics = process.memoryUsage();
    const hrTime = process.hrtime();

    return {
      timestamp: new Date(),
      memory: {
        rss: processMetrics.rss,
        heapUsed: processMetrics.heapUsed,
        heapTotal: processMetrics.heapTotal,
        external: processMetrics.external
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg ? os.loadavg() : [0, 0, 0]
      },
      uptime: process.uptime(),
      eventLoop: {
        delay: await this.measureEventLoopDelay()
      }
    };
  }

  /**
   * Mesurer le délai de l'event loop
   */
  async measureEventLoopDelay() {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const delay = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
        resolve(delay);
      });
    });
  }

  /**
   * Collecter les métriques d'erreur
   */
  async collectErrorMetrics() {
    // Compter les erreurs récentes dans les logs
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

    const recentErrors = this.metrics.errors.get('recentErrors') || [];
    const filteredErrors = recentErrors.filter(error => error.timestamp > last5Minutes);

    return {
      timestamp: new Date(),
      total: filteredErrors.length,
      byType: this.groupErrorsByType(filteredErrors),
      errorRate: this.calculateErrorRate(filteredErrors)
    };
  }

  /**
   * Collecter les métriques de cache
   */
  collectCacheMetrics() {
    const cacheStats = intelligentCache.getStatistics();

    return {
      timestamp: new Date(),
      ...cacheStats,
      efficiency: this.calculateCacheEfficiency(cacheStats)
    };
  }

  /**
   * Collecter les métriques système
   */
  async collectSystemMetrics() {
    try {
      // Import dynamique pour éviter les erreurs sur certains environnements
      const os = await import('os');

      return {
        timestamp: new Date(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        },
        cpu: {
          count: os.cpus().length,
          loadAverage: os.loadavg()
        },
        platform: os.platform(),
        hostname: os.hostname()
      };
    } catch (error) {
      return {
        timestamp: new Date(),
        error: 'Métriques système non disponibles'
      };
    }
  }

  /**
   * Mettre à jour les métriques
   */
  updateMetrics(category, metrics) {
    const currentMetrics = this.metrics[category];

    // Garder seulement les 100 dernières mesures
    const key = `${category}_${Date.now()}`;
    currentMetrics.set(key, metrics);

    // Nettoyer les anciennes entrées
    if (currentMetrics.size > 100) {
      const oldestKey = currentMetrics.keys().next().value;
      currentMetrics.delete(oldestKey);
    }

    // Émettre l'événement de mise à jour
    this.emit('metricsUpdated', { category, metrics });
  }

  /**
   * Enregistrer un événement analytics
   */
  recordAnalyticsEvent(type, data) {
    const analyticsMetrics = this.metrics.analytics;
    const key = `${type}_${Date.now()}`;

    analyticsMetrics.set(key, {
      type,
      timestamp: new Date(),
      data
    });

    // Nettoyer les anciens événements (garder 1 heure)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, event] of analyticsMetrics) {
      if (event.timestamp.getTime() < oneHourAgo) {
        analyticsMetrics.delete(key);
      }
    }
  }

  /**
   * Enregistrer un événement cache
   */
  recordCacheEvent(type, data) {
    const cacheMetrics = this.metrics.cache;
    const key = `event_${Date.now()}`;

    cacheMetrics.set(key, {
      type,
      timestamp: new Date(),
      data
    });
  }

  /**
   * Enregistrer une erreur système
   */
  recordSystemError(type, error) {
    const errorMetrics = this.metrics.errors;
    const recentErrors = errorMetrics.get('recentErrors') || [];

    const errorEntry = {
      type,
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date()
    };

    recentErrors.push(errorEntry);
    errorMetrics.set('recentErrors', recentErrors);

    // Créer une alerte immédiate pour les erreurs critiques
    this.createAlert('critical', `Erreur système: ${type}`, errorEntry);

    logger.error(LOG_TYPES.SYSTEM_ERROR, `Erreur système detectée: ${type}`, errorEntry);
  }

  /**
   * Vérifier les alertes de performance
   */
  checkPerformanceAlerts(metrics) {
    const memoryUsage = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    const eventLoopDelay = metrics.eventLoop.delay;

    if (memoryUsage > this.alerts.thresholds.memoryUsage) {
      this.createAlert(
        'warning',
        'Utilisation mémoire élevée',
        { usage: memoryUsage, threshold: this.alerts.thresholds.memoryUsage }
      );
    }

    if (eventLoopDelay > this.alerts.thresholds.responseTime) {
      this.createAlert(
        'warning',
        'Délai event loop élevé',
        { delay: eventLoopDelay, threshold: this.alerts.thresholds.responseTime }
      );
    }
  }

  /**
   * Vérifier les alertes d'erreur
   */
  checkErrorAlerts(metrics) {
    if (metrics.errorRate > this.alerts.thresholds.errorRate) {
      this.createAlert(
        'critical',
        'Taux d\'erreur élevé',
        { rate: metrics.errorRate, threshold: this.alerts.thresholds.errorRate }
      );
    }
  }

  /**
   * Vérifier les alertes de cache
   */
  checkCacheAlerts(metrics) {
    if (metrics.hitRate < this.alerts.thresholds.cacheHitRate) {
      this.createAlert(
        'warning',
        'Taux de hit cache faible',
        { hitRate: metrics.hitRate, threshold: this.alerts.thresholds.cacheHitRate }
      );
    }
  }

  /**
   * Vérifier les alertes système
   */
  checkSystemAlerts(metrics) {
    if (metrics.memory && metrics.memory.usage > this.alerts.thresholds.memoryUsage) {
      this.createAlert(
        'critical',
        'Utilisation mémoire système élevée',
        { usage: metrics.memory.usage, threshold: this.alerts.thresholds.memoryUsage }
      );
    }
  }

  /**
   * Créer une alerte
   */
  createAlert(severity, message, data = {}) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alert = {
      id: alertId,
      severity,
      message,
      data,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.history.push(alert);
    this.alerts.active.add(alertId);

    // Émettre l'événement d'alerte
    this.emit('alert', alert);

    // Logger l'alerte
    const logLevel = severity === 'critical' ? 'error' : 'warn';
    logger[logLevel](
      LOG_TYPES.SYSTEM_WARNING,
      `Alerte ${severity}: ${message}`,
      { alertId, data }
    );

    // Auto-résolution des alertes après 1 heure
    setTimeout(() => {
      this.resolveAlert(alertId, 'auto_timeout');
    }, 60 * 60 * 1000);

    return alertId;
  }

  /**
   * Acquitter une alerte
   */
  acknowledgeAlert(alertId, user = 'system') {
    const alert = this.alerts.history.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = user;
      alert.acknowledgedAt = new Date();

      this.emit('alertAcknowledged', alert);

      logger.info(
        LOG_TYPES.ADMIN_ACTION,
        'Alerte acquittée',
        { alertId, user }
      );
    }
  }

  /**
   * Résoudre une alerte
   */
  resolveAlert(alertId, reason = 'manual') {
    const alert = this.alerts.history.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedReason = reason;

      this.alerts.active.delete(alertId);
      this.emit('alertResolved', alert);

      logger.info(
        LOG_TYPES.SYSTEM_EVENT,
        'Alerte résolue',
        { alertId, reason }
      );
    }
  }

  /**
   * Obtenir les alertes actives
   */
  getActiveAlerts() {
    return this.alerts.history.filter(alert =>
      this.alerts.active.has(alert.id) && !alert.resolved
    );
  }

  /**
   * Obtenir les métriques actuelles
   */
  getCurrentMetrics() {
    const result = {};

    for (const [category, metrics] of Object.entries(this.metrics)) {
      const latestEntries = Array.from(metrics.values()).slice(-5);
      result[category] = {
        latest: latestEntries[latestEntries.length - 1],
        trend: latestEntries,
        count: metrics.size
      };
    }

    return result;
  }

  /**
   * Générer un rapport de santé
   */
  generateHealthReport() {
    const metrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    const cacheStats = intelligentCache.getStatistics();

    return {
      timestamp: new Date(),
      status: activeAlerts.length === 0 ? 'healthy' : 'issues',
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        warnings: activeAlerts.filter(a => a.severity === 'warning').length
      },
      performance: {
        memory: metrics.performance?.latest?.memory,
        eventLoop: metrics.performance?.latest?.eventLoop,
        uptime: metrics.performance?.latest?.uptime
      },
      cache: {
        hitRate: cacheStats.hitRate,
        size: cacheStats.size,
        memoryUsage: cacheStats.memoryUsage
      },
      analytics: {
        eventsLastHour: this.metrics.analytics.size,
        errorRate: metrics.errors?.latest?.errorRate || 0
      },
      recommendations: this.generateRecommendations(metrics, activeAlerts)
    };
  }

  /**
   * Générer des recommandations
   */
  generateRecommendations(metrics, alerts) {
    const recommendations = [];

    if (alerts.some(a => a.message.includes('mémoire'))) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Optimiser l\'utilisation mémoire ou augmenter les ressources'
      });
    }

    const cacheStats = intelligentCache.getStatistics();
    if (cacheStats.hitRate < 70) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Améliorer la stratégie de cache pour augmenter le taux de hit'
      });
    }

    if (metrics.errors?.latest?.errorRate > 2) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        message: 'Investiguer et corriger les sources d\'erreurs récurrentes'
      });
    }

    return recommendations;
  }

  /**
   * Planifier les rapports périodiques
   */
  scheduleReports() {
    // Rapport de santé toutes les 5 minutes
    const healthInterval = setInterval(() => {
      const report = this.generateHealthReport();
      this.emit('healthReport', report);

      // Logger seulement si il y a des problèmes
      if (report.status !== 'healthy') {
        logger.warn(
          LOG_TYPES.SYSTEM_WARNING,
          'Rapport de santé: problèmes détectés',
          report
        );
      }
    }, 5 * 60 * 1000);

    this.intervals.set('healthReports', healthInterval);

    // Rapport détaillé toutes les heures
    const detailedInterval = setInterval(() => {
      const metrics = this.getCurrentMetrics();
      logger.info(
        LOG_TYPES.SYSTEM_STATS,
        'Rapport de monitoring détaillé',
        {
          metrics,
          alertsCount: this.alerts.active.size,
          cacheStats: intelligentCache.getStatistics()
        }
      );
    }, 60 * 60 * 1000);

    this.intervals.set('detailedReports', detailedInterval);
  }

  // Méthodes utilitaires

  groupErrorsByType(errors) {
    const byType = {};
    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });
    return byType;
  }

  calculateErrorRate(errors) {
    const last5Minutes = 5 * 60 * 1000;
    const totalRequests = 100; // Estimation, à adapter selon vos métriques
    return errors.length > 0 ? (errors.length / totalRequests) * 100 : 0;
  }

  calculateCacheEfficiency(stats) {
    const totalRequests = stats.hits + stats.misses;
    return totalRequests > 0 ? {
      hitRate: stats.hitRate,
      efficiency: stats.hitRate > 80 ? 'excellent' : stats.hitRate > 60 ? 'good' : 'poor'
    } : { hitRate: 0, efficiency: 'unknown' };
  }
}

// Instance singleton
const monitoringSystemV2 = new MonitoringSystemV2();

// Auto-start en production
if (process.env.NODE_ENV === 'production') {
  monitoringSystemV2.start();
}

// Nettoyage lors de l'arrêt
process.on('SIGINT', () => {
  monitoringSystemV2.stop();
});

process.on('SIGTERM', () => {
  monitoringSystemV2.stop();
});

export default monitoringSystemV2;