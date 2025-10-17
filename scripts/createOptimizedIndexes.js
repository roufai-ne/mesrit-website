// src/scripts/createOptimizedIndexes.js
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import logger, { LOG_TYPES } from '../lib/logger.js';

/**
 * Script pour créer tous les index optimisés pour le système V2
 */
class IndexOptimizer {
  constructor() {
    this.results = {
      created: [],
      existing: [],
      errors: [],
      performance: {}
    };
  }

  async createAllIndexes() {
    try {
      console.log('🚀 Création des index optimisés pour le système V2...');
      await connectDB();

      // Index pour ViewEvent
      await this.createViewEventIndexes();

      // Index pour ShareEvent
      await this.createShareEventIndexes();

      // Index pour DailyNewsStats
      await this.createDailyStatsIndexes();

      // Index pour News (optimisations)
      await this.createNewsIndexes();

      // Index composites avancés
      await this.createAdvancedIndexes();

      // Tests de performance
      await this.runPerformanceTests();

      this.printSummary();

    } catch (error) {
      console.error('❌ Erreur création index:', error);
      this.results.errors.push({
        operation: 'createAllIndexes',
        error: error.message
      });
    } finally {
      await mongoose.connection.close();
    }
  }

  async createViewEventIndexes() {
    console.log('📊 Création des index ViewEvent...');

    const indexes = [
      // Index principal pour requêtes par article et date
      {
        name: 'viewevent_newsid_timestamp',
        keys: { newsId: 1, timestamp: -1 },
        options: { background: true }
      },
      // Index pour requêtes par session
      {
        name: 'viewevent_session_timestamp',
        keys: { sessionId: 1, timestamp: -1 },
        options: { background: true }
      },
      // Index pour requêtes par utilisateur (sparse car optionnel)
      {
        name: 'viewevent_user_timestamp',
        keys: { userId: 1, timestamp: -1 },
        options: { background: true, sparse: true }
      },
      // Index composite pour analytics avancées
      {
        name: 'viewevent_analytics_composite',
        keys: { newsId: 1, timestamp: -1, isBot: 1 },
        options: { background: true }
      },
      // Index pour géolocalisation
      {
        name: 'viewevent_geo_analytics',
        keys: { country: 1, timestamp: -1 },
        options: { background: true, sparse: true }
      },
      // Index pour device analytics
      {
        name: 'viewevent_device_analytics',
        keys: { deviceType: 1, timestamp: -1 },
        options: { background: true }
      },
      // TTL index pour auto-suppression (2 ans)
      {
        name: 'viewevent_ttl',
        keys: { createdAt: 1 },
        options: {
          background: true,
          expireAfterSeconds: 60 * 60 * 24 * 365 * 2
        }
      }
    ];

    await this.createIndexesForCollection('viewevents', indexes);
  }

  async createShareEventIndexes() {
    console.log('📤 Création des index ShareEvent...');

    const indexes = [
      // Index principal pour requêtes par article et date
      {
        name: 'shareevent_newsid_timestamp',
        keys: { newsId: 1, timestamp: -1 },
        options: { background: true }
      },
      // Index pour analytics par plateforme
      {
        name: 'shareevent_platform_timestamp',
        keys: { platform: 1, timestamp: -1 },
        options: { background: true }
      },
      // Index pour requêtes par utilisateur
      {
        name: 'shareevent_user_timestamp',
        keys: { userId: 1, timestamp: -1 },
        options: { background: true, sparse: true }
      },
      // Index composite pour analytics
      {
        name: 'shareevent_analytics_composite',
        keys: { newsId: 1, platform: 1, timestamp: -1 },
        options: { background: true }
      },
      // TTL index pour auto-suppression (2 ans)
      {
        name: 'shareevent_ttl',
        keys: { createdAt: 1 },
        options: {
          background: true,
          expireAfterSeconds: 60 * 60 * 24 * 365 * 2
        }
      }
    ];

    await this.createIndexesForCollection('shareevents', indexes);
  }

  async createDailyStatsIndexes() {
    console.log('📈 Création des index DailyNewsStats...');

    const indexes = [
      // Index unique pour éviter doublons
      {
        name: 'dailystats_newsid_date_unique',
        keys: { newsId: 1, date: 1 },
        options: { background: true, unique: true }
      },
      // Index pour requêtes par date
      {
        name: 'dailystats_date_desc',
        keys: { date: -1 },
        options: { background: true }
      },
      // Index pour requêtes par article
      {
        name: 'dailystats_newsid_date_desc',
        keys: { newsId: 1, date: -1 },
        options: { background: true }
      },
      // Index pour requêtes de période
      {
        name: 'dailystats_date_range',
        keys: { date: 1, newsId: 1 },
        options: { background: true }
      },
      // Index pour analytics globales
      {
        name: 'dailystats_global_analytics',
        keys: { date: -1, totalViews: -1 },
        options: { background: true }
      },
      // Index pour articles populaires
      {
        name: 'dailystats_popular_articles',
        keys: { totalViews: -1, date: -1 },
        options: { background: true }
      }
    ];

    await this.createIndexesForCollection('dailynewsstats', indexes);
  }

  async createNewsIndexes() {
    console.log('📰 Optimisation des index News...');

    const indexes = [
      // Index pour slug unique
      {
        name: 'news_slug_unique',
        keys: { slug: 1 },
        options: { background: true, unique: true, sparse: true }
      },
      // Index composite pour listing optimisé
      {
        name: 'news_status_date_category',
        keys: { status: 1, date: -1, category: 1 },
        options: { background: true }
      },
      // Index pour recherche texte
      {
        name: 'news_text_search',
        keys: {
          title: "text",
          content: "text",
          category: "text"
        },
        options: {
          background: true,
          weights: {
            title: 10,
            category: 5,
            content: 1
          },
          name: 'news_text_search'
        }
      },
      // Index pour SEO
      {
        name: 'news_seo_score',
        keys: { "seo.seoScore.total": -1, status: 1 },
        options: { background: true, sparse: true }
      },
      // Index pour analytics lookup
      {
        name: 'news_analytics_lookup',
        keys: { _id: 1, status: 1, date: -1 },
        options: { background: true }
      }
    ];

    await this.createIndexesForCollection('news', indexes);
  }

  async createAdvancedIndexes() {
    console.log('🚀 Création des index avancés...');

    // Index partiel pour articles récents uniquement
    const recentNewsIndex = {
      name: 'news_recent_published',
      keys: { date: -1, status: 1 },
      options: {
        background: true,
        partialFilterExpression: {
          status: 'published',
          date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      }
    };

    await this.createIndexesForCollection('news', [recentNewsIndex]);

    // Index composite pour hot analytics
    const hotAnalyticsIndex = {
      name: 'viewevent_hot_analytics',
      keys: { timestamp: -1, newsId: 1, isBot: 1 },
      options: {
        background: true,
        partialFilterExpression: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          isBot: { $ne: true }
        }
      }
    };

    await this.createIndexesForCollection('viewevents', [hotAnalyticsIndex]);
  }

  async createIndexesForCollection(collectionName, indexes) {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    for (const indexDef of indexes) {
      try {
        const startTime = Date.now();

        // Vérifier si l'index existe déjà
        const existingIndexes = await collection.indexes();
        const indexExists = existingIndexes.some(idx => idx.name === indexDef.name);

        if (indexExists) {
          console.log(`✅ Index ${indexDef.name} existe déjà`);
          this.results.existing.push({
            collection: collectionName,
            name: indexDef.name
          });
          continue;
        }

        // Créer l'index
        await collection.createIndex(indexDef.keys, {
          ...indexDef.options,
          name: indexDef.name
        });

        const duration = Date.now() - startTime;
        console.log(`✅ Index ${indexDef.name} créé en ${duration}ms`);

        this.results.created.push({
          collection: collectionName,
          name: indexDef.name,
          duration
        });

        // Analyser la performance de l'index
        const indexStats = await collection.aggregate([
          { $indexStats: {} },
          { $match: { name: indexDef.name } }
        ]).toArray();

        if (indexStats.length > 0) {
          this.results.performance[indexDef.name] = indexStats[0];
        }

      } catch (error) {
        console.error(`❌ Erreur création index ${indexDef.name}:`, error.message);
        this.results.errors.push({
          collection: collectionName,
          name: indexDef.name,
          error: error.message
        });
      }
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Tests de performance des index...');

    const db = mongoose.connection.db;

    // Test 1: Query ViewEvent par newsId et date
    const test1Start = Date.now();
    await db.collection('viewevents').find({
      newsId: new mongoose.Types.ObjectId(),
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(100).toArray();
    const test1Duration = Date.now() - test1Start;

    // Test 2: Query DailyStats période
    const test2Start = Date.now();
    await db.collection('dailynewsstats').find({
      date: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date()
      }
    }).sort({ date: -1 }).limit(50).toArray();
    const test2Duration = Date.now() - test2Start;

    // Test 3: Query News avec tri
    const test3Start = Date.now();
    await db.collection('news').find({
      status: 'published'
    }).sort({ date: -1 }).limit(20).toArray();
    const test3Duration = Date.now() - test3Start;

    this.results.performance.queryTests = {
      viewEventQuery: test1Duration,
      dailyStatsQuery: test2Duration,
      newsQuery: test3Duration
    };

    console.log(`📊 Performance queries:
    - ViewEvent: ${test1Duration}ms
    - DailyStats: ${test2Duration}ms
    - News: ${test3Duration}ms`);
  }

  printSummary() {
    console.log(`
📋 RÉSUMÉ CRÉATION INDEX
========================
✅ Index créés: ${this.results.created.length}
🔄 Index existants: ${this.results.existing.length}
❌ Erreurs: ${this.results.errors.length}

📊 PERFORMANCE
==============
${Object.entries(this.results.performance.queryTests || {})
  .map(([test, duration]) => `${test}: ${duration}ms`)
  .join('\n')}

${this.results.errors.length > 0 ? `
⚠️  ERREURS DÉTAILLÉES:
${this.results.errors.map(err => `- ${err.collection}.${err.name}: ${err.error}`).join('\n')}
` : '✅ Aucune erreur!'}
`);

    // Logger pour monitoring
    logger.info(
      LOG_TYPES.MAINTENANCE,
      'Index MongoDB créés/vérifiés',
      {
        created: this.results.created.length,
        existing: this.results.existing.length,
        errors: this.results.errors.length,
        performance: this.results.performance
      }
    );
  }

  /**
   * Analyser l'utilisation des index existants
   */
  async analyzeIndexUsage() {
    console.log('🔍 Analyse utilisation des index...');

    const db = mongoose.connection.db;
    const collections = ['news', 'viewevents', 'shareevents', 'dailynewsstats'];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();

        console.log(`\n📊 ${collectionName.toUpperCase()}:`);
        indexStats.forEach(stat => {
          const usage = stat.accesses?.ops || 0;
          const lastUsed = stat.accesses?.since || 'Jamais';
          console.log(`  ${stat.name}: ${usage} utilisations (depuis ${lastUsed})`);
        });

      } catch (error) {
        console.error(`❌ Erreur analyse ${collectionName}:`, error.message);
      }
    }
  }

  /**
   * Supprimer les index inutilisés
   */
  async cleanupUnusedIndexes(dryRun = true) {
    console.log(`🧹 ${dryRun ? 'Simulation' : 'Exécution'} nettoyage index...`);

    const db = mongoose.connection.db;
    const collections = ['news', 'viewevents', 'shareevents', 'dailynewsstats'];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();

        const unusedIndexes = indexStats.filter(stat => {
          const usage = stat.accesses?.ops || 0;
          const isDefaultIndex = stat.name === '_id_';
          return usage === 0 && !isDefaultIndex;
        });

        if (unusedIndexes.length > 0) {
          console.log(`\n🗑️ ${collectionName} - Index inutilisés:`);
          for (const index of unusedIndexes) {
            console.log(`  - ${index.name}`);
            if (!dryRun) {
              await collection.dropIndex(index.name);
              console.log(`    ✅ Supprimé`);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Erreur nettoyage ${collectionName}:`, error.message);
      }
    }
  }
}

// Script exécutable
async function main() {
  const optimizer = new IndexOptimizer();

  const args = process.argv.slice(2);
  const command = args[0] || 'create';

  switch (command) {
    case 'create':
      await optimizer.createAllIndexes();
      break;
    case 'analyze':
      await optimizer.analyzeIndexUsage();
      break;
    case 'cleanup':
      const dryRun = !args.includes('--confirm');
      await optimizer.cleanupUnusedIndexes(dryRun);
      break;
    default:
      console.log(`Usage: node createOptimizedIndexes.js [create|analyze|cleanup]`);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IndexOptimizer };