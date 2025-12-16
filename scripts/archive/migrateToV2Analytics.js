// src/scripts/migrateToV2Analytics.js
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import logger from '../lib/logger.js';

// Import des anciens et nouveaux modèles
import NewsAnalytics from '../models/NewsAnalytics.js';
import ViewEvent from '../models/ViewEvent.js';
import ShareEvent from '../models/ShareEvent.js';
import DailyNewsStats from '../models/DailyNewsStats.js';
import News from '../models/News.js';
import AutoSEOService from '../lib/autoSEO.js';

/**
 * Script de migration des anciennes données analytics vers la nouvelle architecture
 */
class AnalyticsMigrationV2 {
  constructor() {
    this.stats = {
      totalNewsAnalytics: 0,
      migratedViews: 0,
      migratedShares: 0,
      generatedDailyStats: 0,
      generatedSEO: 0,
      errors: [],
      startTime: new Date(),
      endTime: null
    };
  }

  /**
   * Exécuter la migration complète
   */
  async migrate() {
    try {
      console.log('🚀 Début de la migration vers Analytics V2...');

      await connectDB();

      // Étape 1: Analyser les données existantes
      await this.analyzeExistingData();

      // Étape 2: Migrer les données analytics
      await this.migrateAnalyticsData();

      // Étape 3: Générer les statistiques quotidiennes
      await this.generateDailyStats();

      // Étape 4: Générer les données SEO manquantes
      await this.generateMissingSEO();

      // Étape 5: Nettoyer les anciennes données (optionnel)
      await this.cleanupOldData();

      this.stats.endTime = new Date();

      console.log('✅ Migration terminée avec succès!');
      this.printSummary();

    } catch (error) {
      this.stats.errors.push({
        step: 'migration',
        error: error.message,
        timestamp: new Date()
      });

      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  /**
   * Analyser les données existantes
   */
  async analyzeExistingData() {
    console.log('📊 Analyse des données existantes...');

    const newsAnalytics = await NewsAnalytics.countDocuments();
    const news = await News.countDocuments();
    const viewEvents = await ViewEvent.countDocuments();
    const shareEvents = await ShareEvent.countDocuments();
    const dailyStats = await DailyNewsStats.countDocuments();

    this.stats.totalNewsAnalytics = newsAnalytics;

    console.log(`📈 Données trouvées:
    - Articles: ${news}
    - NewsAnalytics (ancien): ${newsAnalytics}
    - ViewEvents (nouveau): ${viewEvents}
    - ShareEvents (nouveau): ${shareEvents}
    - DailyStats (nouveau): ${dailyStats}`);
  }

  /**
   * Migrer les données analytics
   */
  async migrateAnalyticsData() {
    console.log('🔄 Migration des données analytics...');

    const batchSize = 100;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const analyticsData = await NewsAnalytics
        .find({})
        .skip(skip)
        .limit(batchSize)
        .lean();

      if (analyticsData.length === 0) {
        hasMore = false;
        break;
      }

      for (const analytics of analyticsData) {
        try {
          await this.migrateAnalyticsRecord(analytics);
        } catch (error) {
          this.stats.errors.push({
            step: 'migrateRecord',
            newsId: analytics.newsId,
            error: error.message,
            timestamp: new Date()
          });
          console.error(`❌ Erreur migration ${analytics.newsId}:`, error.message);
        }
      }

      skip += batchSize;
      console.log(`✅ Migré ${skip} enregistrements analytics...`);
    }
  }

  /**
   * Migrer un enregistrement analytics individuel
   */
  async migrateAnalyticsRecord(analytics) {
    const newsId = analytics.newsId;

    // Vérifier que l'article existe encore
    const news = await News.findById(newsId);
    if (!news) {
      console.log(`⚠️ Article ${newsId} n'existe plus, migration ignorée`);
      return;
    }

    // Migrer les vues
    if (analytics.views && analytics.views.length > 0) {
      for (const view of analytics.views) {
        // Vérifier si cette vue n'a pas déjà été migrée
        const existingView = await ViewEvent.findOne({
          newsId,
          timestamp: view.timestamp,
          sessionId: view.sessionId
        });

        if (!existingView) {
          const viewEvent = new ViewEvent({
            newsId,
            timestamp: view.timestamp || new Date(),
            sessionId: view.sessionId || `migrated_${Date.now()}_${Math.random()}`,
            userId: view.userId || null,
            ip: view.ip || 'unknown',
            userAgent: view.userAgent || 'migrated',
            referrer: view.referrer || '',
            readingTime: view.readingTime || 0,
            scrollDepth: view.scrollDepth || 0,
            country: view.country || 'unknown',
            city: view.city || 'unknown',
            videoWatched: view.videoWatched || false,
            videoCurrentTime: view.videoCurrentTime || 0,
            videoDuration: view.videoDuration || 0
          });

          await viewEvent.save();
          this.stats.migratedViews++;
        }
      }
    }

    // Migrer les partages
    if (analytics.shares && analytics.shares.length > 0) {
      for (const share of analytics.shares) {
        // Vérifier si ce partage n'a pas déjà été migré
        const existingShare = await ShareEvent.findOne({
          newsId,
          timestamp: share.timestamp,
          platform: share.platform
        });

        if (!existingShare) {
          const shareEvent = new ShareEvent({
            newsId,
            timestamp: share.timestamp || new Date(),
            platform: share.platform || 'other',
            sessionId: share.sessionId || `migrated_${Date.now()}_${Math.random()}`,
            userId: share.userId || null,
            ip: share.ip || 'unknown',
            userAgent: share.userAgent || 'migrated',
            referrer: share.referrer || '',
            shareUrl: share.url || '',
            shareText: share.text || '',
            customMessage: share.customMessage || '',
            country: share.country || 'unknown',
            city: share.city || 'unknown'
          });

          await shareEvent.save();
          this.stats.migratedShares++;
        }
      }
    }
  }

  /**
   * Générer les statistiques quotidiennes manquantes
   */
  async generateDailyStats() {
    console.log('📊 Génération des statistiques quotidiennes...');

    // Obtenir toutes les dates uniques des événements
    const viewDates = await ViewEvent.aggregate([
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
        $project: {
          newsId: '$_id.newsId',
          date: '$_id.date'
        }
      }
    ]);

    console.log(`📅 Génération des stats pour ${viewDates.length} combinaisons news/date...`);

    for (const item of viewDates) {
      try {
        const date = new Date(item.date);

        // Vérifier si les stats existent déjà
        const existingStats = await DailyNewsStats.findOne({
          newsId: item.newsId,
          date: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        });

        if (!existingStats) {
          const statsData = await DailyNewsStats.aggregateStatsForDate(item.newsId, date);

          const dailyStats = new DailyNewsStats(statsData);
          await dailyStats.save();

          this.stats.generatedDailyStats++;
        }
      } catch (error) {
        this.stats.errors.push({
          step: 'generateDailyStats',
          newsId: item.newsId,
          date: item.date,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    console.log(`✅ Généré ${this.stats.generatedDailyStats} statistiques quotidiennes`);
  }

  /**
   * Générer les données SEO manquantes
   */
  async generateMissingSEO() {
    console.log('🔍 Génération des données SEO manquantes...');

    const newsWithoutSEO = await News.find({
      $or: [
        { seo: { $exists: false } },
        { seo: null },
        { slug: { $exists: false } },
        { slug: null }
      ]
    }).limit(50); // Limiter pour éviter la surcharge

    console.log(`🎯 ${newsWithoutSEO.length} articles sans données SEO trouvés`);

    for (const news of newsWithoutSEO) {
      try {
        await AutoSEOService.generateAutoSEO(news._id);
        this.stats.generatedSEO++;

        // Pause courte pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.stats.errors.push({
          step: 'generateSEO',
          newsId: news._id,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    console.log(`✅ Généré SEO pour ${this.stats.generatedSEO} articles`);
  }

  /**
   * Nettoyer les anciennes données (optionnel)
   */
  async cleanupOldData() {
    console.log('🧹 Options de nettoyage des anciennes données...');

    const oldAnalyticsCount = await NewsAnalytics.countDocuments();

    console.log(`⚠️ ${oldAnalyticsCount} anciens enregistrements NewsAnalytics trouvés`);
    console.log('💡 Pour les supprimer, exécutez: await NewsAnalytics.deleteMany({})');
    console.log('⚠️ ATTENTION: Assurez-vous que la migration s\'est bien passée avant!');
  }

  /**
   * Afficher le résumé de la migration
   */
  printSummary() {
    const duration = this.stats.endTime - this.stats.startTime;

    console.log(`
📋 RÉSUMÉ DE LA MIGRATION
========================
⏱️  Durée totale: ${Math.round(duration / 1000)}s
📊 NewsAnalytics traités: ${this.stats.totalNewsAnalytics}
👁️  Vues migrées: ${this.stats.migratedViews}
📤 Partages migrés: ${this.stats.migratedShares}
📈 Stats quotidiennes générées: ${this.stats.generatedDailyStats}
🔍 Données SEO générées: ${this.stats.generatedSEO}
❌ Erreurs: ${this.stats.errors.length}

${this.stats.errors.length > 0 ? `
⚠️  ERREURS DÉTAILLÉES:
${this.stats.errors.map(err => `- ${err.step}: ${err.error}`).join('\n')}
` : '✅ Aucune erreur!'}
`);
  }

  /**
   * Vérifier l'intégrité après migration
   */
  async verifyMigration() {
    console.log('🔍 Vérification de l\'intégrité de la migration...');

    const verification = {
      newsCount: await News.countDocuments(),
      oldAnalyticsCount: await NewsAnalytics.countDocuments(),
      newViewEventsCount: await ViewEvent.countDocuments(),
      newShareEventsCount: await ShareEvent.countDocuments(),
      dailyStatsCount: await DailyNewsStats.countDocuments(),
      newsWithSEO: await News.countDocuments({
        seo: { $exists: true, $ne: null }
      }),
      newsWithSlugs: await News.countDocuments({
        slug: { $exists: true, $ne: null }
      })
    };

    console.log('📊 Résultats de vérification:', verification);

    // Tests de cohérence
    const issues = [];

    if (verification.newViewEventsCount === 0 && verification.oldAnalyticsCount > 0) {
      issues.push('Aucune vue migrée malgré des données sources');
    }

    if (verification.dailyStatsCount === 0 && verification.newViewEventsCount > 0) {
      issues.push('Aucune statistique quotidienne générée malgré des vues');
    }

    if (issues.length > 0) {
      console.log('⚠️ Problèmes détectés:', issues);
    } else {
      console.log('✅ Migration vérifiée avec succès!');
    }

    return verification;
  }
}

// Script exécutable
async function runMigration() {
  const migration = new AnalyticsMigrationV2();

  try {
    await migration.migrate();
    await migration.verifyMigration();
  } catch (error) {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { AnalyticsMigrationV2, runMigration };