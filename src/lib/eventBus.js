// src/lib/eventBus.js
import { EventEmitter } from 'events';
import logger, { LOG_TYPES } from './logger';

class NewsEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Augmenter pour éviter les warnings
  }

  // Événements news
  static get EVENTS() {
    return {
      NEWS_CREATED: 'news:created',
      NEWS_UPDATED: 'news:updated',
      NEWS_PUBLISHED: 'news:published',
      NEWS_UNPUBLISHED: 'news:unpublished',
      NEWS_ARCHIVED: 'news:archived',
      NEWS_DELETED: 'news:deleted',
      NEWS_VIEWED: 'news:viewed',
      NEWS_SHARED: 'news:shared',

      // Événements analytics
      ANALYTICS_UPDATED: 'analytics:updated',
      DAILY_STATS_UPDATED: 'daily_stats:updated',

      // Événements cache
      CACHE_INVALIDATE: 'cache:invalidate',
      CACHE_REFRESH: 'cache:refresh',

      // Événements SEO
      SEO_UPDATED: 'seo:updated',
      SITEMAP_REFRESH: 'sitemap:refresh'
    };
  }

  /**
   * Émettre un événement avec logging automatique
   */
  async emitEvent(eventType, data = {}) {
    try {
      const eventData = {
        ...data,
        timestamp: new Date(),
        eventId: this.generateEventId()
      };

      // ✅ CORRECTION : Logger l'événement avec USER_ACTION au lieu de SYSTEM_EVENT
      await logger.info(
        LOG_TYPES.USER_ACTION,  // ← Changé de SYSTEM_EVENT à USER_ACTION
        `Événement émis: ${eventType}`,
        { eventType, data: eventData }
      );

      // Émettre l'événement
      this.emit(eventType, eventData);

      return eventData.eventId;
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        `Erreur émission événement: ${eventType}`,
        { eventType, error: error.message, data }
      );
      throw error;
    }
  }

  /**
   * S'abonner à un événement avec gestion d'erreur automatique
   */
  subscribeToEvent(eventType, handler, options = {}) {
    const { once = false, errorHandler } = options;

    const wrappedHandler = async (data) => {
      try {
        await handler(data);
      } catch (error) {
        await logger.error(
          LOG_TYPES.SYSTEM_ERROR,
          `Erreur dans handler d'événement: ${eventType}`,
          { eventType, error: error.message, data }
        );

        if (errorHandler) {
          await errorHandler(error, data);
        }
      }
    };

    if (once) {
      this.once(eventType, wrappedHandler);
    } else {
      this.on(eventType, wrappedHandler);
    }

    return () => this.off(eventType, wrappedHandler);
  }

  /**
   * Émettre des événements en batch
   */
  async emitBatch(events) {
    const results = [];
    for (const { eventType, data } of events) {
      results.push(await this.emitEvent(eventType, data));
    }
    return results;
  }

  /**
   * Générer un ID unique pour l'événement
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtenir les statistiques des événements
   */
  getStats() {
    return {
      listenerCount: this.eventNames().reduce((acc, event) => {
        acc[event] = this.listenerCount(event);
        return acc;
      }, {}),
      maxListeners: this.getMaxListeners(),
      eventNames: this.eventNames()
    };
  }
}

// Instance singleton
const newsEventBus = new NewsEventBus();

export default newsEventBus;
export { NewsEventBus };