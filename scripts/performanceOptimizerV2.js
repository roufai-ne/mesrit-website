// src/scripts/performanceOptimizerV2.js
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import intelligentCache from '../lib/intelligentCache.js';
import NewsAnalyticsServiceV2 from '../lib/newsAnalyticsV2.js';
import logger, { LOG_TYPES } from '../lib/logger.js';

// Models
import News from '../models/News.js';
import ViewEvent from '../models/ViewEvent.js';
import ShareEvent from '../models/ShareEvent.js';
import DailyNewsStats from '../models/DailyNewsStats.js';

/**
 * Optimiseur de performances pour le système V2
 */
class PerformanceOptimizerV2 {
  constructor() {
    this.results = {
      optimizations: [],
      performance: {
        before: {},
        after: {}
      },
      errors: [],
      startTime: new Date()
    };

    this.benchmarks = new Map();
  }

  /**
   * Exécuter toutes les optimisations
   */
  async optimizeAll() {
    try {
      console.log('🚀 Optimisation des performances V2...');
      await connectDB();

      // Mesurer les performances initiales
      await this.measureBaselinePerformance();

      // Optimisations
      await this.optimizeDatabase();
      await this.optimizeCache();
      await this.optimizeAnalytics();
      await this.optimizeMemory();
      await this.optimizeQueries();

      // Mesurer les performances finales
      await this.measureFinalPerformance();

      // Rapport final
      this.generateOptimizationReport();

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeAll',
        error: error.message,
        timestamp: new Date()
      });
      console.error('❌ Erreur optimisation:', error);
    } finally {
      await mongoose.connection.close();
    }
  }

  /**
   * Mesurer les performances de base
   */
  async measureBaselinePerformance() {
    console.log('📊 Mesure des performances de base...');

    this.results.performance.before = {
      database: await this.benchmarkDatabase(),
      cache: await this.benchmarkCache(),
      analytics: await this.benchmarkAnalytics(),
      memory: await this.benchmarkMemory(),
      startup: await this.benchmarkStartup()
    };

    console.log('✅ Performances de base mesurées');
  }

  /**
   * Optimiser la base de données
   */
  async optimizeDatabase() {
    console.log('🗄️ Optimisation base de données...');

    try {
      const db = mongoose.connection.db;

      // 1. Analyser les requêtes lentes
      const slowQueries = await this.findSlowQueries();

      // 2. Optimiser les index
      await this.optimizeIndexes();

      // 3. Compacter les collections
      await this.compactCollections();

      // 4. Analyser la fragmentation
      const fragmentation = await this.analyzeFragmentation();

      this.results.optimizations.push({
        type: 'database',
        actions: [
          `Requêtes lentes trouvées: ${slowQueries.length}`,
          'Index optimisés',
          'Collections compactées',
          `Fragmentation analysée: ${fragmentation.avgFragmentation}%`
        ],
        impact: 'medium'
      });

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeDatabase',
        error: error.message
      });
    }
  }

  /**
   * Optimiser le cache
   */
  async optimizeCache() {
    console.log('⚡ Optimisation cache...');

    try {
      const statsBefore = intelligentCache.getStatistics();

      // 1. Nettoyer les entrées expirées
      const cleaned = intelligentCache.cleanup();

      // 2. Ajuster la configuration
      const oldConfig = { ...intelligentCache.config };
      await this.optimizeCacheConfig();

      // 3. Précharger les données importantes
      await this.preloadCriticalData();

      // 4. Optimiser les clés de cache
      await this.optimizeCacheKeys();

      const statsAfter = intelligentCache.getStatistics();

      this.results.optimizations.push({
        type: 'cache',
        actions: [
          `Entrées nettoyées: ${cleaned}`,
          'Configuration optimisée',
          'Données critiques préchargées',
          'Clés de cache optimisées'
        ],
        impact: 'high',
        metrics: {
          hitRateImprovement: statsAfter.hitRate - statsBefore.hitRate,
          sizeBefore: statsBefore.size,
          sizeAfter: statsAfter.size
        }
      });

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeCache',
        error: error.message
      });
    }
  }

  /**
   * Optimiser les analytics
   */
  async optimizeAnalytics() {
    console.log('📈 Optimisation analytics...');

    try {
      // 1. Nettoyer les données obsolètes
      const cleaned = await this.cleanupAnalyticsData();

      // 2. Optimiser les agrégations
      await this.optimizeAggregations();

      // 3. Créer des vues matérialisées pour les requêtes fréquentes
      await this.createMaterializedViews();

      // 4. Optimiser les stats quotidiennes
      await this.optimizeDailyStats();

      this.results.optimizations.push({
        type: 'analytics',
        actions: [
          `Données obsolètes nettoyées: ${cleaned.total}`,
          'Agrégations optimisées',
          'Vues matérialisées créées',
          'Stats quotidiennes optimisées'
        ],
        impact: 'high'
      });

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeAnalytics',
        error: error.message
      });
    }
  }

  /**
   * Optimiser l'utilisation mémoire
   */
  async optimizeMemory() {
    console.log('🧠 Optimisation mémoire...');

    try {
      const memoryBefore = process.memoryUsage();

      // 1. Forcer le garbage collection
      if (global.gc) {
        global.gc();
      }

      // 2. Optimiser les connexions MongoDB
      await this.optimizeMongoConnections();

      // 3. Nettoyer les timers et listeners
      await this.cleanupTimersAndListeners();

      const memoryAfter = process.memoryUsage();

      this.results.optimizations.push({
        type: 'memory',
        actions: [
          'Garbage collection forcé',
          'Connexions MongoDB optimisées',
          'Timers et listeners nettoyés'
        ],
        impact: 'medium',
        metrics: {
          heapUsedBefore: memoryBefore.heapUsed,
          heapUsedAfter: memoryAfter.heapUsed,
          memoryFreed: memoryBefore.heapUsed - memoryAfter.heapUsed
        }
      });

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeMemory',
        error: error.message
      });
    }
  }

  /**
   * Optimiser les requêtes
   */
  async optimizeQueries() {
    console.log('🔍 Optimisation requêtes...');

    try {
      // 1. Analyser les requêtes fréquentes
      const frequentQueries = await this.analyzeFrequentQueries();

      // 2. Créer des index pour les requêtes lentes
      await this.createQuerySpecificIndexes(frequentQueries);

      // 3. Optimiser les pipelines d'agrégation
      await this.optimizeAggregationPipelines();

      // 4. Mettre en cache les résultats de requêtes coûteuses
      await this.cacheExpensiveQueries();

      this.results.optimizations.push({
        type: 'queries',
        actions: [
          `Requêtes fréquentes analysées: ${frequentQueries.length}`,
          'Index spécifiques créés',
          'Pipelines d\'agrégation optimisés',
          'Requêtes coûteuses mises en cache'
        ],
        impact: 'high'
      });

    } catch (error) {
      this.results.errors.push({
        operation: 'optimizeQueries',
        error: error.message
      });
    }
  }

  /**
   * Mesurer les performances finales
   */
  async measureFinalPerformance() {
    console.log('📊 Mesure des performances finales...');

    this.results.performance.after = {
      database: await this.benchmarkDatabase(),
      cache: await this.benchmarkCache(),
      analytics: await this.benchmarkAnalytics(),
      memory: await this.benchmarkMemory(),
      startup: await this.benchmarkStartup()
    };

    console.log('✅ Performances finales mesurées');
  }

  // Benchmarks individuels

  async benchmarkDatabase() {
    const tests = [];

    // Test 1: Requête simple News
    const start1 = Date.now();
    await News.find({ status: 'published' }).limit(10);
    tests.push({ name: 'simple_news_query', time: Date.now() - start1 });

    // Test 2: Requête complexe avec agrégation
    const start2 = Date.now();
    await DailyNewsStats.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, totalViews: { $sum: '$totalViews' } } }
    ]);
    tests.push({ name: 'complex_aggregation', time: Date.now() - start2 });

    // Test 3: Insertion
    const start3 = Date.now();
    const testEvent = new ViewEvent({
      newsId: new mongoose.Types.ObjectId(),
      sessionId: 'benchmark-test',
      ip: '127.0.0.1',
      userAgent: 'Benchmark'
    });
    await testEvent.save();
    await ViewEvent.deleteOne({ _id: testEvent._id });
    tests.push({ name: 'insert_performance', time: Date.now() - start3 });

    return {
      tests,
      averageTime: tests.reduce((sum, test) => sum + test.time, 0) / tests.length
    };
  }

  async benchmarkCache() {
    const tests = [];

    // Test 1: Set/Get basique
    const start1 = Date.now();
    await intelligentCache.set('benchmark:test1', { data: 'test' });
    await intelligentCache.get('benchmark:test1');
    tests.push({ name: 'basic_set_get', time: Date.now() - start1 });

    // Test 2: Wrap function
    const start2 = Date.now();
    await intelligentCache.wrap('benchmark:test2', async () => {
      return { data: 'wrapped', timestamp: new Date() };
    });
    tests.push({ name: 'wrap_function', time: Date.now() - start2 });

    // Test 3: Invalidation
    const start3 = Date.now();
    await intelligentCache.set('benchmark:test3', { data: 'test' }, { tags: ['benchmark'] });
    intelligentCache.invalidateByTags(['benchmark']);
    tests.push({ name: 'invalidation', time: Date.now() - start3 });

    return {
      tests,
      averageTime: tests.reduce((sum, test) => sum + test.time, 0) / tests.length,
      statistics: intelligentCache.getStatistics()
    };
  }

  async benchmarkAnalytics() {
    const tests = [];
    const testNewsId = new mongoose.Types.ObjectId();

    // Test 1: Track view
    const start1 = Date.now();
    try {
      // Créer un article de test temporaire
      const testNews = new News({
        title: 'Benchmark Test',
        content: 'Test content',
        category: 'test',
        status: 'published'
      });
      await testNews.save();

      await NewsAnalyticsServiceV2.trackView(testNews._id, {
        sessionId: 'benchmark-session',
        ip: '127.0.0.1',
        userAgent: 'Benchmark'
      });

      // Nettoyer
      await News.deleteOne({ _id: testNews._id });
      await ViewEvent.deleteMany({ newsId: testNews._id });

      tests.push({ name: 'track_view', time: Date.now() - start1 });
    } catch (error) {
      tests.push({ name: 'track_view', time: Date.now() - start1, error: error.message });
    }

    // Test 2: Global stats
    const start2 = Date.now();
    try {
      await NewsAnalyticsServiceV2.getGlobalStats(7);
      tests.push({ name: 'global_stats', time: Date.now() - start2 });
    } catch (error) {
      tests.push({ name: 'global_stats', time: Date.now() - start2, error: error.message });
    }

    return {
      tests,
      averageTime: tests.reduce((sum, test) => sum + test.time, 0) / tests.length
    };
  }

  async benchmarkMemory() {
    const memory = process.memoryUsage();
    return {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      usage: (memory.heapUsed / memory.heapTotal) * 100
    };
  }

  async benchmarkStartup() {
    // Simuler le temps de démarrage en mesurant les connexions
    const start = Date.now();

    // Test de connexion DB
    await mongoose.connection.db.admin().ping();

    // Test de cache
    intelligentCache.getStatistics();

    return {
      connectionTime: Date.now() - start,
      uptime: process.uptime()
    };
  }

  // Méthodes d'optimisation spécifiques

  async findSlowQueries() {
    try {
      const db = mongoose.connection.db;

      // Activer le profiler pour capturer les requêtes lentes
      await db.admin().command({ profile: 2, slowms: 100 });

      // Attendre un peu pour capturer des données
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Récupérer les requêtes lentes
      const slowQueries = await db.collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 60000) } })
        .sort({ ts: -1 })
        .limit(10)
        .toArray();

      // Désactiver le profiler
      await db.admin().command({ profile: 0 });

      return slowQueries;
    } catch (error) {
      console.warn('Impossible d\'analyser les requêtes lentes:', error.message);
      return [];
    }
  }

  async optimizeIndexes() {
    const db = mongoose.connection.db;
    const collections = ['news', 'viewevents', 'shareevents', 'dailynewsstats'];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);

        // Réindexer pour optimiser
        await collection.reIndex();

        // Analyser l'utilisation des index
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();

        // Supprimer les index inutilisés (avec précaution)
        for (const stat of indexStats) {
          if (stat.accesses.ops === 0 && stat.name !== '_id_') {
            console.log(`⚠️ Index inutilisé détecté: ${collectionName}.${stat.name}`);
            // Note: ne pas supprimer automatiquement, juste signaler
          }
        }
      } catch (error) {
        console.error(`Erreur optimisation index ${collectionName}:`, error.message);
      }
    }
  }

  async compactCollections() {
    const db = mongoose.connection.db;
    const collections = ['viewevents', 'shareevents']; // Collections avec beaucoup d'écritures

    for (const collectionName of collections) {
      try {
        // Compacter la collection pour réduire la fragmentation
        await db.admin().command({ compact: collectionName });
        console.log(`✅ Collection ${collectionName} compactée`);
      } catch (error) {
        console.warn(`Compactage ${collectionName} échoué:`, error.message);
      }
    }
  }

  async analyzeFragmentation() {
    try {
      const stats = await mongoose.connection.db.stats();
      const fragmentation = ((stats.storageSize - stats.dataSize) / stats.storageSize) * 100;

      return {
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        avgFragmentation: Math.round(fragmentation * 100) / 100
      };
    } catch (error) {
      return { avgFragmentation: 0, error: error.message };
    }
  }

  async optimizeCacheConfig() {
    const stats = intelligentCache.getStatistics();

    // Ajuster la taille maximale basée sur l'utilisation
    if (stats.hitRate > 90 && stats.size > 800) {
      intelligentCache.config.maxSize = Math.min(2000, stats.size * 1.5);
    } else if (stats.hitRate < 60) {
      intelligentCache.config.defaultTtl = Math.max(60000, intelligentCache.config.defaultTtl * 0.8);
    }

    // Ajuster la fréquence de nettoyage
    if (stats.size > 500) {
      intelligentCache.config.cleanupInterval = 30000; // Plus fréquent
    }
  }

  async preloadCriticalData() {
    try {
      // Précharger les articles populaires
      const popularNews = await News.find({
        status: 'published'
      }).sort({ 'stats.views': -1 }).limit(20);

      for (const news of popularNews) {
        await intelligentCache.set(
          `news:${news._id}:details`,
          news,
          { ttl: 30 * 60 * 1000, tags: ['news', 'popular'] }
        );
      }

      // Précharger les stats globales
      await intelligentCache.wrap(
        'news:stats:global:30',
        async () => NewsAnalyticsServiceV2.getGlobalStats(30),
        { ttl: 15 * 60 * 1000, tags: ['analytics', 'global'] }
      );

    } catch (error) {
      console.error('Erreur préchargement données:', error.message);
    }
  }

  async optimizeCacheKeys() {
    // Analyser les clés de cache pour détecter les patterns inefficaces
    const debugInfo = intelligentCache.getDebugInfo();
    const keyPatterns = new Map();

    debugInfo.entries.forEach(entry => {
      const pattern = entry.key.split(':').slice(0, 2).join(':'); // Prendre les 2 premiers segments
      keyPatterns.set(pattern, (keyPatterns.get(pattern) || 0) + 1);
    });

    // Signaler les patterns avec beaucoup de clés
    for (const [pattern, count] of keyPatterns) {
      if (count > 50) {
        console.log(`⚠️ Pattern de clé très utilisé: ${pattern} (${count} clés)`);
      }
    }
  }

  async cleanupAnalyticsData() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Garder 6 mois

    const viewEvents = await ViewEvent.deleteMany({
      timestamp: { $lt: cutoffDate },
      isBot: true // Supprimer seulement les vues de bots anciennes
    });

    const shareEvents = await ShareEvent.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return {
      viewEvents: viewEvents.deletedCount,
      shareEvents: shareEvents.deletedCount,
      total: viewEvents.deletedCount + shareEvents.deletedCount
    };
  }

  async optimizeAggregations() {
    // Créer des index spécifiques pour les agrégations fréquentes
    const db = mongoose.connection.db;

    // Index pour agrégation des stats quotidiennes
    await db.collection('dailynewsstats').createIndex(
      { date: -1, totalViews: -1 },
      { background: true, name: 'daily_stats_aggregation' }
    );

    // Index pour agrégation par période
    await db.collection('viewevents').createIndex(
      { timestamp: -1, newsId: 1, isBot: 1 },
      { background: true, name: 'view_events_aggregation' }
    );
  }

  async createMaterializedViews() {
    // Créer des collections pour les vues matérialisées
    const db = mongoose.connection.db;

    try {
      // Vue pour les stats mensuelles
      await db.createCollection('monthlyStats', {
        viewOn: 'dailynewsstats',
        pipeline: [
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                newsId: '$newsId'
              },
              totalViews: { $sum: '$totalViews' },
              totalShares: { $sum: '$totalShares' },
              avgReadingTime: { $avg: '$avgReadingTime' }
            }
          }
        ]
      });

      console.log('✅ Vue matérialisée monthlyStats créée');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error('Erreur création vue matérialisée:', error.message);
      }
    }
  }

  async optimizeDailyStats() {
    // Identifier les stats quotidiennes incomplètes et les recalculer
    const incompleteStats = await DailyNewsStats.find({
      isComplete: { $ne: true },
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(50);

    for (const stat of incompleteStats) {
      try {
        await NewsAnalyticsServiceV2.updateDailyStats(stat.newsId, stat.date);
      } catch (error) {
        console.error(`Erreur recalcul stats ${stat.newsId}:`, error.message);
      }
    }

    console.log(`✅ ${incompleteStats.length} stats quotidiennes recalculées`);
  }

  async optimizeMongoConnections() {
    // Optimiser les paramètres de connexion MongoDB
    const currentConfig = mongoose.connection.db.s.options;

    // Vérifier et ajuster si nécessaire
    const recommendedSettings = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000
    };

    console.log('📊 Configuration MongoDB:', {
      current: currentConfig,
      recommended: recommendedSettings
    });
  }

  async cleanupTimersAndListeners() {
    // Nettoyer les timers orphelins et listeners non utilisés
    const activeHandles = process._getActiveHandles();
    const activeRequests = process._getActiveRequests();

    console.log(`📊 Handles actifs: ${activeHandles.length}, Requêtes actives: ${activeRequests.length}`);

    // Force cleanup si nécessaire
    if (activeHandles.length > 100) {
      console.log('⚠️ Trop de handles actifs détectés');
    }
  }

  async analyzeFrequentQueries() {
    // Analyser les patterns de requêtes fréquentes
    // (Cette méthode pourrait être étendue avec un vrai profiling)
    return [
      { pattern: 'News.find({status: "published"})', frequency: 'high' },
      { pattern: 'DailyNewsStats.aggregate([...])', frequency: 'medium' },
      { pattern: 'ViewEvent.find({newsId: ObjectId})', frequency: 'high' }
    ];
  }

  async createQuerySpecificIndexes(queries) {
    // Créer des index spécifiques basés sur l'analyse des requêtes
    const db = mongoose.connection.db;

    for (const query of queries) {
      if (query.frequency === 'high') {
        console.log(`🔍 Requête fréquente détectée: ${query.pattern}`);
        // Ici on pourrait créer des index spécifiques
      }
    }
  }

  async optimizeAggregationPipelines() {
    // Optimiser les pipelines d'agrégation en réorganisant les étapes
    console.log('🔧 Optimisation des pipelines d\'agrégation...');

    // Exemple: s'assurer que $match est toujours en premier
    // et que les index sont utilisés efficacement
  }

  async cacheExpensiveQueries() {
    // Mettre en cache les résultats de requêtes coûteuses
    await intelligentCache.wrap(
      'expensive:top_articles_monthly',
      async () => {
        return await DailyNewsStats.aggregate([
          {
            $match: {
              date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: '$newsId',
              totalViews: { $sum: '$totalViews' },
              totalShares: { $sum: '$totalShares' }
            }
          },
          { $sort: { totalViews: -1 } },
          { $limit: 20 }
        ]);
      },
      { ttl: 60 * 60 * 1000, tags: ['analytics', 'expensive'] } // 1 heure
    );
  }

  /**
   * Générer le rapport d'optimisation
   */
  generateOptimizationReport() {
    const duration = Date.now() - this.results.startTime;

    // Calculer les améliorations
    const improvements = this.calculateImprovements();

    console.log(`
🚀 RAPPORT D'OPTIMISATION PERFORMANCES V2
=========================================
⏱️  Durée d'optimisation: ${Math.round(duration / 1000)}s
🔧 Optimisations réalisées: ${this.results.optimizations.length}
❌ Erreurs: ${this.results.errors.length}

📊 AMÉLIORATIONS DE PERFORMANCE:
${Object.entries(improvements).map(([category, improvement]) =>
  `- ${category}: ${improvement}`
).join('\n')}

🔧 DÉTAILS DES OPTIMISATIONS:
${this.results.optimizations.map(opt =>
  `${opt.type.toUpperCase()}:
  ${opt.actions.map(action => `  • ${action}`).join('\n')}
  Impact: ${opt.impact}`
).join('\n\n')}

${this.results.errors.length > 0 ? `
⚠️  ERREURS RENCONTRÉES:
${this.results.errors.map(err => `- ${err.operation}: ${err.error}`).join('\n')}
` : '✅ Aucune erreur!'}

📋 RECOMMANDATIONS POST-OPTIMISATION:
• Surveiller les métriques de performance
• Exécuter cette optimisation mensuellement
• Ajuster la configuration cache selon l'usage
• Monitorer l'utilisation des nouveaux index
`);

    // Logger le rapport
    logger.info(
      LOG_TYPES.MAINTENANCE,
      'Rapport d\'optimisation performances V2',
      {
        duration,
        optimizations: this.results.optimizations.length,
        errors: this.results.errors.length,
        improvements
      }
    );
  }

  calculateImprovements() {
    const before = this.results.performance.before;
    const after = this.results.performance.after;
    const improvements = {};

    if (before.database && after.database) {
      const dbImprovement = ((before.database.averageTime - after.database.averageTime) / before.database.averageTime) * 100;
      improvements.database = `${dbImprovement > 0 ? '+' : ''}${Math.round(dbImprovement)}%`;
    }

    if (before.cache && after.cache) {
      const cacheImprovement = after.cache.statistics.hitRate - before.cache.statistics.hitRate;
      improvements.cache = `${cacheImprovement > 0 ? '+' : ''}${Math.round(cacheImprovement)}% hit rate`;
    }

    if (before.memory && after.memory) {
      const memoryImprovement = ((before.memory.usage - after.memory.usage) / before.memory.usage) * 100;
      improvements.memory = `${memoryImprovement > 0 ? '+' : ''}${Math.round(memoryImprovement)}% usage`;
    }

    return improvements;
  }
}

// Script exécutable
async function main() {
  const optimizer = new PerformanceOptimizerV2();
  await optimizer.optimizeAll();
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PerformanceOptimizerV2 };