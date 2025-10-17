// src/scripts/autoMaintenanceV2.js
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import NewsAnalyticsServiceV2 from '../lib/newsAnalyticsV2.js';
import AutoSEOService from '../lib/autoSEO.js';
import intelligentCache from '../lib/intelligentCache.js';
import ViewEvent from '../models/ViewEvent.js';
import ShareEvent from '../models/ShareEvent.js';
import DailyNewsStats from '../models/DailyNewsStats.js';
import News from '../models/News.js';
import logger, { LOG_TYPES } from '../lib/logger.js';

/**
 * Système de maintenance automatisée pour le système V2
 */
class AutoMaintenanceV2 {
  constructor() {
    this.results = {
      startTime: new Date(),
      endTime: null,
      tasks: [],
      errors: [],
      stats: {}
    };
  }

  /**
   * Exécuter toutes les tâches de maintenance
   */
  async runFullMaintenance() {
    try {
      console.log('🔧 Début maintenance automatique V2...');
      await connectDB();

      // Tâches principales
      await this.cleanupExpiredData();
      await this.generateMissingDailyStats();
      await this.updateSEOData();
      await this.optimizeCache();
      await this.updateIndexStatistics();
      await this.archiveOldNews();
      await this.checkSystemHealth();

      this.results.endTime = new Date();
      await this.sendMaintenanceReport();

      console.log('✅ Maintenance terminée avec succès!');

    } catch (error) {
      this.results.errors.push({
        task: 'fullMaintenance',
        error: error.message,
        timestamp: new Date()
      });

      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur lors de la maintenance automatique',
        { error: error.message, stack: error.stack }
      );

      throw error;
    } finally {
      await mongoose.connection.close();
    }
  }

  /**
   * Nettoyer les données expirées
   */
  async cleanupExpiredData() {
    const taskName = 'cleanupExpiredData';
    const taskStart = Date.now();

    try {
      console.log('🗑️ Nettoyage des données expirées...');

      // Les ViewEvent et ShareEvent ont un TTL automatique,
      // mais nettoyons manuellement si nécessaire
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);

      const oldViewEvents = await ViewEvent.countDocuments({
        createdAt: { $lt: cutoffDate }
      });

      const oldShareEvents = await ShareEvent.countDocuments({
        createdAt: { $lt: cutoffDate }
      });

      // Nettoyer les stats quotidiennes très anciennes (>3 ans)
      const statscutoff = new Date();
      statscutoff.setFullYear(statssCutoff.getFullYear() - 3);

      const deletedStats = await DailyNewsStats.deleteMany({
        date: { $lt: statsCtoff }
      });

      // Nettoyer le cache
      const cacheSize = intelligentCache.cache.size;
      intelligentCache.cleanup();
      const cleanedCache = cacheSize - intelligentCache.cache.size;

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: {
          oldViewEvents,
          oldShareEvents,
          deletedStats: deletedStats.deletedCount,
          cleanedCacheEntries: cleanedCache
        }
      });

      console.log(`✅ Nettoyage terminé:
      - ViewEvents anciens: ${oldViewEvents}
      - ShareEvents anciens: ${oldShareEvents}
      - Stats supprimées: ${deletedStats.deletedCount}
      - Cache nettoyé: ${cleanedCache} entrées`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Générer les statistiques quotidiennes manquantes
   */
  async generateMissingDailyStats() {
    const taskName = 'generateMissingDailyStats';
    const taskStart = Date.now();

    try {
      console.log('📊 Génération des stats quotidiennes manquantes...');

      // Trouver les dates manquantes des 30 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      // Obtenir toutes les combinaisons news/date qui ont des événements
      const missingStats = await ViewEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              newsId: '$newsId',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'dailynewsstats',
            let: {
              newsId: '$_id.newsId',
              date: { $dateFromString: { dateString: '$_id.date' } }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$newsId', '$$newsId'] },
                      { $eq: ['$date', '$$date'] }
                    ]
                  }
                }
              }
            ],
            as: 'existing'
          }
        },
        {
          $match: {
            existing: { $size: 0 }
          }
        },
        {
          $project: {
            newsId: '$_id.newsId',
            date: '$_id.date'
          }
        }
      ]);

      console.log(`📈 ${missingStats.length} stats quotidiennes à générer...`);

      let generated = 0;
      for (const item of missingStats) {
        try {
          const date = new Date(item.date);
          await NewsAnalyticsServiceV2.updateDailyStats(item.newsId, date);
          generated++;

          // Pause courte pour éviter la surcharge
          if (generated % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`❌ Erreur génération stats ${item.newsId}/${item.date}:`, error.message);
        }
      }

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: {
          missing: missingStats.length,
          generated
        }
      });

      console.log(`✅ ${generated}/${missingStats.length} stats quotidiennes générées`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Mettre à jour les données SEO manquantes
   */
  async updateSEOData() {
    const taskName = 'updateSEOData';
    const taskStart = Date.now();

    try {
      console.log('🔍 Mise à jour des données SEO...');

      // Articles sans SEO ou avec SEO obsolète
      const newsWithoutSEO = await News.find({
        $or: [
          { 'seo.autoGenerated': { $ne: true } },
          { 'seo.lastUpdated': { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          { slug: { $exists: false } },
          { slug: null }
        ],
        status: { $in: ['published', 'draft'] }
      }).limit(20); // Limiter pour éviter la surcharge

      console.log(`🎯 ${newsWithoutSEO.length} articles nécessitent une mise à jour SEO`);

      let updated = 0;
      for (const news of newsWithoutSEO) {
        try {
          await AutoSEOService.generateAutoSEO(news._id);
          updated++;

          // Pause pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`❌ Erreur SEO ${news._id}:`, error.message);
        }
      }

      // Générer/mettre à jour le sitemap
      const sitemapUrls = await AutoSEOService.generateSitemap();

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: {
          articlesNeedingUpdate: newsWithoutSEO.length,
          articlesUpdated: updated,
          sitemapUrls: sitemapUrls.length
        }
      });

      console.log(`✅ SEO mis à jour: ${updated} articles, ${sitemapUrls.length} URLs sitemap`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Optimiser le cache intelligent
   */
  async optimizeCache() {
    const taskName = 'optimizeCache';
    const taskStart = Date.now();

    try {
      console.log('⚡ Optimisation du cache intelligent...');

      const statsBefore = intelligentCache.getStatistics();

      // Nettoyer les entrées expirées
      const cleaned = intelligentCache.cleanup();

      // Précharger les données fréquemment consultées
      await this.preloadFrequentData();

      const statsAfter = intelligentCache.getStatistics();

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: {
          cleanedEntries: cleaned,
          statsBefore,
          statsAfter,
          hitRateImprovement: statsAfter.hitRate - statsBefore.hitRate
        }
      });

      console.log(`✅ Cache optimisé:
      - Entrées nettoyées: ${cleaned}
      - Taux de hit: ${statsAfter.hitRate}%
      - Taille: ${statsAfter.size} entrées`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Précharger les données fréquemment consultées
   */
  async preloadFrequentData() {
    try {
      // Précharger les stats globales
      await NewsAnalyticsServiceV2.getGlobalStats(30);

      // Précharger les articles populaires
      const popularNews = await News.find({
        status: 'published'
      }).sort({ 'stats.views': -1 }).limit(10);

      for (const news of popularNews) {
        const cacheKey = `news:${news._id}:details`;
        if (!(await intelligentCache.get(cacheKey))) {
          await intelligentCache.set(cacheKey, news, {
            ttl: 30 * 60 * 1000, // 30 minutes
            tags: ['news', `news:${news._id}`]
          });
        }
      }

    } catch (error) {
      console.error('Erreur préchargement cache:', error.message);
    }
  }

  /**
   * Mettre à jour les statistiques d'index
   */
  async updateIndexStatistics() {
    const taskName = 'updateIndexStatistics';
    const taskStart = Date.now();

    try {
      console.log('📊 Mise à jour des statistiques d\'index...');

      const db = mongoose.connection.db;
      const collections = ['news', 'viewevents', 'shareevents', 'dailynewsstats'];
      const indexStats = {};

      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);

          // Obtenir les stats d'utilisation des index
          const stats = await collection.aggregate([{ $indexStats: {} }]).toArray();

          // Réindexer si nécessaire (pour les collections importantes)
          if (['viewevents', 'shareevents'].includes(collectionName)) {
            await collection.reIndex();
          }

          indexStats[collectionName] = {
            totalIndexes: stats.length,
            usage: stats.map(s => ({
              name: s.name,
              operations: s.accesses?.ops || 0
            }))
          };

        } catch (error) {
          console.error(`Erreur stats index ${collectionName}:`, error.message);
        }
      }

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: { indexStats }
      });

      console.log(`✅ Statistiques d'index mises à jour pour ${collections.length} collections`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Archiver les anciens articles
   */
  async archiveOldNews() {
    const taskName = 'archiveOldNews';
    const taskStart = Date.now();

    try {
      console.log('📦 Archivage des anciens articles...');

      // Articles publiés il y a plus de 2 ans et peu consultés
      const archiveCutoff = new Date();
      archiveCutoff.setFullYear(archiveCutoff.getFullYear() - 2);

      const oldNews = await News.find({
        status: 'published',
        date: { $lt: archiveCutoff },
        'stats.views': { $lt: 100 } // Peu consultés
      }).limit(50);

      let archived = 0;
      for (const news of oldNews) {
        try {
          // Vérifier si l'article a encore des vues récentes
          const recentViews = await ViewEvent.countDocuments({
            newsId: news._id,
            timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
          });

          // Si aucune vue récente, archiver
          if (recentViews === 0) {
            await News.findByIdAndUpdate(news._id, {
              status: 'archived',
              archivedAt: new Date(),
              archivedReason: 'auto_maintenance_old_unused'
            });
            archived++;
          }

        } catch (error) {
          console.error(`Erreur archivage ${news._id}:`, error.message);
        }
      }

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: {
          candidatesForArchive: oldNews.length,
          actuallyArchived: archived
        }
      });

      console.log(`✅ ${archived}/${oldNews.length} articles archivés automatiquement`);

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  /**
   * Vérifier la santé du système
   */
  async checkSystemHealth() {
    const taskName = 'checkSystemHealth';
    const taskStart = Date.now();

    try {
      console.log('🏥 Vérification de la santé du système...');

      const health = {
        database: await this.checkDatabaseHealth(),
        cache: this.checkCacheHealth(),
        analytics: await this.checkAnalyticsHealth(),
        seo: await this.checkSEOHealth()
      };

      // Alertes si problèmes détectés
      const issues = [];

      if (health.database.connectionTime > 1000) {
        issues.push('Base de données lente');
      }

      if (health.cache.hitRate < 50) {
        issues.push('Cache inefficace');
      }

      if (health.analytics.errorRate > 5) {
        issues.push('Erreurs analytics élevées');
      }

      if (health.seo.articlesWithoutSEO > 10) {
        issues.push('Trop d\'articles sans SEO');
      }

      this.results.tasks.push({
        name: taskName,
        duration: Date.now() - taskStart,
        success: true,
        details: { health, issues }
      });

      if (issues.length > 0) {
        console.log(`⚠️ Problèmes détectés: ${issues.join(', ')}`);

        await logger.warn(
          LOG_TYPES.SYSTEM_WARNING,
          'Problèmes détectés lors du check de santé',
          { issues, health }
        );
      } else {
        console.log('✅ Système en bonne santé');
      }

    } catch (error) {
      this.results.errors.push({
        task: taskName,
        error: error.message,
        timestamp: new Date()
      });
      console.error(`❌ Erreur ${taskName}:`, error.message);
    }
  }

  async checkDatabaseHealth() {
    const start = Date.now();
    const stats = await mongoose.connection.db.stats();
    const connectionTime = Date.now() - start;

    return {
      connectionTime,
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      totalSize: stats.storageSize
    };
  }

  checkCacheHealth() {
    const stats = intelligentCache.getStatistics();
    return {
      hitRate: stats.hitRate,
      size: stats.size,
      memoryUsage: stats.memoryUsage
    };
  }

  async checkAnalyticsHealth() {
    const recentErrors = await mongoose.connection.db.collection('systemlogs').countDocuments({
      level: 'error',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      message: /analytics/i
    });

    const totalEvents = await ViewEvent.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      errorRate: totalEvents > 0 ? (recentErrors / totalEvents) * 100 : 0,
      eventsLast24h: totalEvents,
      errorsLast24h: recentErrors
    };
  }

  async checkSEOHealth() {
    const articlesWithoutSEO = await News.countDocuments({
      status: 'published',
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { 'seo.autoGenerated': { $ne: true } }
      ]
    });

    const totalPublished = await News.countDocuments({ status: 'published' });

    return {
      articlesWithoutSEO,
      totalPublished,
      seoCompletionRate: totalPublished > 0 ? ((totalPublished - articlesWithoutSEO) / totalPublished) * 100 : 0
    };
  }

  /**
   * Envoyer le rapport de maintenance
   */
  async sendMaintenanceReport() {
    const duration = this.results.endTime - this.results.startTime;
    const successfulTasks = this.results.tasks.filter(t => t.success).length;

    const report = {
      timestamp: new Date(),
      duration: Math.round(duration / 1000),
      tasks: {
        total: this.results.tasks.length,
        successful: successfulTasks,
        failed: this.results.errors.length
      },
      details: this.results.tasks,
      errors: this.results.errors
    };

    // Logger le rapport
    await logger.info(
      LOG_TYPES.MAINTENANCE,
      'Rapport de maintenance automatique V2',
      report
    );

    console.log(`
📋 RAPPORT DE MAINTENANCE V2
============================
⏱️  Durée: ${Math.round(duration / 1000)}s
✅ Tâches réussies: ${successfulTasks}
❌ Tâches échouées: ${this.results.errors.length}

📊 DÉTAILS:
${this.results.tasks.map(task =>
  `- ${task.name}: ${task.success ? '✅' : '❌'} (${task.duration}ms)`
).join('\n')}

${this.results.errors.length > 0 ? `
⚠️  ERREURS:
${this.results.errors.map(err => `- ${err.task}: ${err.error}`).join('\n')}
` : ''}
`);
  }
}

// Scripts spécialisés pour tâches individuelles

/**
 * Nettoyage rapide quotidien
 */
export async function dailyCleanup() {
  const maintenance = new AutoMaintenanceV2();
  await maintenance.cleanupExpiredData();
  await maintenance.optimizeCache();
}

/**
 * Maintenance SEO hebdomadaire
 */
export async function weeklySEOMaintenance() {
  const maintenance = new AutoMaintenanceV2();
  await maintenance.updateSEOData();
  await maintenance.checkSystemHealth();
}

/**
 * Maintenance complète mensuelle
 */
export async function monthlyMaintenance() {
  const maintenance = new AutoMaintenanceV2();
  await maintenance.runFullMaintenance();
}

// Script exécutable
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  try {
    switch (command) {
      case 'daily':
        await dailyCleanup();
        break;
      case 'weekly':
        await weeklySEOMaintenance();
        break;
      case 'monthly':
      case 'full':
        await monthlyMaintenance();
        break;
      default:
        console.log(`Usage: node autoMaintenanceV2.js [daily|weekly|monthly|full]`);
    }
  } catch (error) {
    console.error('💥 Erreur maintenance:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutoMaintenanceV2 };