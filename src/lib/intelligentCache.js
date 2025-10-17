// src/lib/intelligentCache.js
import newsEventBus from './eventBus';
import { CacheError, NewsErrorHandler } from './newsErrors';
import logger, { LOG_TYPES } from './logger';

/**
 * Système de cache intelligent avec invalidation basée sur les événements
 */
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.metadata = new Map(); // Métadonnées pour chaque entrée de cache
    this.dependencies = new Map(); // Dépendances entre clés de cache
    this.statistics = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      sets: 0
    };

    // Configuration par défaut
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000, // Nombre maximum d'entrées
      cleanupInterval: 60 * 1000, // Nettoyage toutes les minutes
      enableStatistics: true
    };

    this.setupEventListeners();
    this.startCleanupInterval();
  }

  /**
   * Configurer les écouteurs d'événements pour invalidation automatique
   */
  setupEventListeners() {
    const { EVENTS } = newsEventBus.constructor;

    // Invalidation pour les événements news
    newsEventBus.subscribeToEvent(EVENTS.NEWS_CREATED, (data) => {
      this.invalidateByPattern('news:list:*');
      this.invalidateByPattern('news:stats:global:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_UPDATED, (data) => {
      this.invalidateByNewsId(data.newsId);
      this.invalidateByPattern('news:list:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_PUBLISHED, (data) => {
      this.invalidateByNewsId(data.newsId);
      this.invalidateByPattern('news:list:*');
      this.invalidateByPattern('news:stats:global:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_ARCHIVED, (data) => {
      this.invalidateByNewsId(data.newsId);
      this.invalidateByPattern('news:list:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_DELETED, (data) => {
      this.invalidateByNewsId(data.newsId);
      this.invalidateByPattern('news:list:*');
      this.invalidateByPattern('news:stats:global:*');
    });

    // Invalidation pour les événements analytics
    newsEventBus.subscribeToEvent(EVENTS.NEWS_VIEWED, (data) => {
      this.invalidateByPattern(`news:stats:${data.newsId}:*`);
      this.invalidateByPattern('news:stats:global:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.NEWS_SHARED, (data) => {
      this.invalidateByPattern(`news:stats:${data.newsId}:*`);
      this.invalidateByPattern('news:stats:global:*');
    });

    newsEventBus.subscribeToEvent(EVENTS.DAILY_STATS_UPDATED, (data) => {
      this.invalidateByPattern(`news:stats:${data.newsId}:*`);
      this.invalidateByPattern('news:stats:global:*');
    });

    // Invalidation pour les événements SEO
    newsEventBus.subscribeToEvent(EVENTS.SEO_UPDATED, (data) => {
      this.invalidateByNewsId(data.newsId);
      this.invalidateByPattern('seo:*');
    });
  }

  /**
   * Obtenir une valeur du cache
   */
  async get(key) {
    try {
      const entry = this.cache.get(key);
      const meta = this.metadata.get(key);

      if (!entry || !meta) {
        this.recordMiss(key);
        return null;
      }

      // Vérifier l'expiration
      if (meta.expires && Date.now() > meta.expires) {
        this.delete(key);
        this.recordMiss(key);
        return null;
      }

      // Mettre à jour les statistiques d'accès
      meta.lastAccessed = Date.now();
      meta.accessCount++;

      this.recordHit(key);
      return entry.value;
    } catch (error) {
      throw new CacheError(
        `Erreur lors de la récupération du cache: ${error.message}`,
        'get',
        key
      );
    }
  }

  /**
   * Définir une valeur dans le cache
   */
  async set(key, value, options = {}) {
    try {
      const {
        ttl = this.config.defaultTtl,
        tags = [],
        dependencies = []
      } = options;

      // Vérifier la taille du cache
      if (this.cache.size >= this.config.maxSize) {
        this.evictLeastRecentlyUsed();
      }

      // Créer l'entrée
      const entry = {
        value,
        createdAt: Date.now()
      };

      // Métadonnées
      const metadata = {
        key,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        expires: ttl ? Date.now() + ttl : null,
        tags: new Set(tags),
        size: this.calculateSize(value)
      };

      this.cache.set(key, entry);
      this.metadata.set(key, metadata);

      // Gérer les dépendances
      if (dependencies.length > 0) {
        this.dependencies.set(key, new Set(dependencies));
      }

      this.statistics.sets++;

      logger.debug(
        LOG_TYPES.SYSTEM_DEBUG,
        `Cache set: ${key}`,
        { key, ttl, tags, dependencies }
      );

      return true;
    } catch (error) {
      throw new CacheError(
        `Erreur lors de la définition du cache: ${error.message}`,
        'set',
        key
      );
    }
  }

  /**
   * Supprimer une entrée du cache
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    this.metadata.delete(key);
    this.dependencies.delete(key);

    if (deleted) {
      logger.debug(LOG_TYPES.SYSTEM_DEBUG, `Cache deleted: ${key}`);
    }

    return deleted;
  }

  /**
   * Invalidation par pattern (avec wildcard)
   */
  invalidateByPattern(pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );

    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }

    this.statistics.invalidations += invalidated;

    if (invalidated > 0) {
      logger.debug(
        LOG_TYPES.SYSTEM_DEBUG,
        `Cache invalidated by pattern: ${pattern}`,
        { pattern, invalidated }
      );
    }

    return invalidated;
  }

  /**
   * Invalidation par newsId
   */
  invalidateByNewsId(newsId) {
    return this.invalidateByPattern(`news:${newsId}:*`);
  }

  /**
   * Invalidation par tags
   */
  invalidateByTags(tags) {
    const tagsSet = new Set(Array.isArray(tags) ? tags : [tags]);
    let invalidated = 0;

    for (const [key, meta] of this.metadata.entries()) {
      const hasMatchingTag = [...tagsSet].some(tag => meta.tags.has(tag));
      if (hasMatchingTag) {
        this.delete(key);
        invalidated++;
      }
    }

    this.statistics.invalidations += invalidated;

    if (invalidated > 0) {
      logger.debug(
        LOG_TYPES.SYSTEM_DEBUG,
        `Cache invalidated by tags: ${Array.from(tagsSet).join(', ')}`,
        { tags: Array.from(tagsSet), invalidated }
      );
    }

    return invalidated;
  }

  /**
   * Wrapper pour opérations avec cache automatique
   */
  async wrap(key, fetcher, options = {}) {
    try {
      // Essayer de récupérer du cache
      let value = await this.get(key);

      if (value !== null) {
        return value;
      }

      // Pas en cache, exécuter la fonction
      value = await fetcher();

      // Mettre en cache le résultat
      await this.set(key, value, options);

      return value;
    } catch (error) {
      throw new CacheError(
        `Erreur dans l'opération wrap: ${error.message}`,
        'wrap',
        key
      );
    }
  }

  /**
   * Éviction LRU (Least Recently Used)
   */
  evictLeastRecentlyUsed() {
    let lruKey = null;
    let lruTime = Date.now();

    for (const [key, meta] of this.metadata.entries()) {
      if (meta.lastAccessed < lruTime) {
        lruTime = meta.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
      logger.debug(
        LOG_TYPES.SYSTEM_DEBUG,
        `Cache LRU eviction: ${lruKey}`,
        { key: lruKey, lastAccessed: new Date(lruTime) }
      );
    }
  }

  /**
   * Nettoyage des entrées expirées
   */
  cleanup() {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, meta] of this.metadata.entries()) {
      if (meta.expires && now > meta.expires) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(
        LOG_TYPES.SYSTEM_DEBUG,
        `Cache cleanup completed`,
        { cleaned, remaining: this.cache.size }
      );
    }

    return cleaned;
  }

  /**
   * Démarrer l'intervalle de nettoyage automatique
   */
  startCleanupInterval() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Arrêter l'intervalle de nettoyage
   */
  stopCleanupInterval() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Calculer la taille approximative d'une valeur
   */
  calculateSize(value) {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 1; // Fallback pour les valeurs non-sérialisables
    }
  }

  /**
   * Enregistrer un hit de cache
   */
  recordHit(key) {
    if (this.config.enableStatistics) {
      this.statistics.hits++;
    }
  }

  /**
   * Enregistrer un miss de cache
   */
  recordMiss(key) {
    if (this.config.enableStatistics) {
      this.statistics.misses++;
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStatistics() {
    const totalRequests = this.statistics.hits + this.statistics.misses;
    const hitRate = totalRequests > 0 ? (this.statistics.hits / totalRequests) * 100 : 0;

    return {
      ...this.statistics,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Obtenir l'utilisation mémoire approximative
   */
  getMemoryUsage() {
    let totalSize = 0;
    for (const meta of this.metadata.values()) {
      totalSize += meta.size || 0;
    }
    return totalSize;
  }

  /**
   * Vider complètement le cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.metadata.clear();
    this.dependencies.clear();

    logger.info(
      LOG_TYPES.SYSTEM_EVENT,
      'Cache cleared',
      { clearedEntries: size }
    );

    return size;
  }

  /**
   * Obtenir les informations de debug
   */
  getDebugInfo() {
    const entries = [];
    for (const [key, meta] of this.metadata.entries()) {
      entries.push({
        key,
        ...meta,
        tags: Array.from(meta.tags),
        isExpired: meta.expires && Date.now() > meta.expires
      });
    }

    return {
      config: this.config,
      statistics: this.getStatistics(),
      entries: entries.sort((a, b) => b.lastAccessed - a.lastAccessed)
    };
  }
}

// Instance singleton
const intelligentCache = new IntelligentCache();

// Hook pour Next.js - nettoyage lors de l'arrêt
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    intelligentCache.stopCleanupInterval();
  });

  process.on('SIGTERM', () => {
    intelligentCache.stopCleanupInterval();
  });
}

export default intelligentCache;