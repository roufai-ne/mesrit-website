#!/usr/bin/env node
// scripts/diagnoseNewsAnalytics.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Diagnostic complet du système d'actualités V2
 * Analyse la santé, les performances et l'intégrité des données
 */
class NewsAnalyticsDiagnostic {
  constructor() {
    this.client = null;
    this.db = null;
    this.issues = [];
    this.recommendations = [];
    this.stats = {};
    this.config = this.loadConfig();
  }

  /**
   * Charger la configuration
   */
  loadConfig() {
    try {
      const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const config = {};
        envContent.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        });
        return config;
      }
    } catch (error) {
      console.warn('⚠️ Impossible de charger la configuration:', error.message);
    }
    return {};
  }

  /**
   * Diagnostic complet
   */
  async diagnose() {
    console.log(`
🔍 DIAGNOSTIC SYSTÈME D'ACTUALITÉS V2
====================================

Analyse en cours...
`);

    try {
      // Connexion MongoDB
      await this.connectToDatabase();

      // Tests de diagnostic
      await this.checkDatabaseHealth();
      await this.analyzeDataIntegrity();
      await this.checkPerformance();
      await this.analyzeErrors();
      await this.checkV2Implementation();
      await this.validateConfiguration();

      // Générer le rapport
      await this.generateReport();

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error.message);
      this.addIssue('FATAL', 'Échec du diagnostic', error.message);
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }

  /**
   * Connexion à la base de données
   */
  async connectToDatabase() {
    console.log('🔌 Test connexion MongoDB...');

    const uri = this.config.MONGODB_URI || 'mongodb://localhost:27017/mesrit_website';

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();

      // Test ping
      await this.db.admin().ping();
      console.log('✅ Connexion MongoDB OK');

      this.stats.connectionOK = true;
    } catch (error) {
      console.log('❌ Connexion MongoDB échouée');
      this.addIssue('CRITICAL', 'Connexion base de données', error.message);
      this.stats.connectionOK = false;
      throw error;
    }
  }

  /**
   * Vérifier la santé de la base de données
   */
  async checkDatabaseHealth() {
    console.log('🏥 Analyse santé base de données...');

    try {
      // Statistiques MongoDB
      const dbStats = await this.db.stats();
      this.stats.database = {
        collections: dbStats.collections,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // MB
        indexSize: Math.round(dbStats.indexSize / 1024 / 1024), // MB
        totalSize: Math.round(dbStats.storageSize / 1024 / 1024) // MB
      };

      console.log(`📊 Collections: ${dbStats.collections}`);
      console.log(`💾 Taille données: ${this.stats.database.dataSize}MB`);
      console.log(`🗂️ Taille index: ${this.stats.database.indexSize}MB`);

      // Vérifier les collections critiques
      const requiredCollections = [
        'news', 'newsanalytics', 'viewevents',
        'shareevents', 'dailynewsstats', 'systemlogs'
      ];

      const existingCollections = await this.db.listCollections().toArray();
      const collectionNames = existingCollections.map(c => c.name);

      for (const collection of requiredCollections) {
        if (!collectionNames.includes(collection)) {
          this.addIssue('HIGH', `Collection manquante: ${collection}`,
            'Cette collection est requise pour le système V2');
        }
      }

      // Vérifier les index
      await this.checkIndexes();

      console.log('✅ Santé base de données vérifiée');
    } catch (error) {
      this.addIssue('HIGH', 'Analyse santé DB', error.message);
    }
  }

  /**
   * Vérifier les index
   */
  async checkIndexes() {
    console.log('🔍 Vérification des index...');

    const indexChecks = [
      {
        collection: 'news',
        requiredIndexes: ['slug_1', 'status_1', 'publishedAt_1', 'category_1']
      },
      {
        collection: 'viewevents',
        requiredIndexes: ['newsId_1', 'timestamp_1', 'expireAt_1']
      },
      {
        collection: 'shareevents',
        requiredIndexes: ['newsId_1', 'platform_1', 'timestamp_1']
      },
      {
        collection: 'dailynewsstats',
        requiredIndexes: ['newsId_1', 'date_1']
      }
    ];

    for (const check of indexChecks) {
      try {
        const collection = this.db.collection(check.collection);
        const indexes = await collection.indexes();
        const indexNames = indexes.map(idx => Object.keys(idx.key).map(k => `${k}_${idx.key[k]}`).join('_'));

        for (const requiredIndex of check.requiredIndexes) {
          if (!indexNames.some(name => name.includes(requiredIndex))) {
            this.addIssue('MEDIUM', `Index manquant: ${check.collection}.${requiredIndex}`,
              'Cet index est recommandé pour les performances');
          }
        }
      } catch (error) {
        this.addIssue('MEDIUM', `Erreur vérification index ${check.collection}`, error.message);
      }
    }
  }

  /**
   * Analyser l'intégrité des données
   */
  async analyzeDataIntegrity() {
    console.log('🔍 Analyse intégrité des données...');

    try {
      // Vérifier les actualités
      await this.checkNewsIntegrity();

      // Vérifier les analytics
      await this.checkAnalyticsIntegrity();

      // Vérifier la cohérence V1/V2
      await this.checkV1V2Consistency();

      console.log('✅ Intégrité des données vérifiée');
    } catch (error) {
      this.addIssue('HIGH', 'Analyse intégrité', error.message);
    }
  }

  /**
   * Vérifier l'intégrité des actualités
   */
  async checkNewsIntegrity() {
    const newsCollection = this.db.collection('news');

    // Compter les actualités
    const totalNews = await newsCollection.countDocuments();
    const publishedNews = await newsCollection.countDocuments({ status: 'published' });
    const archivedNews = await newsCollection.countDocuments({ archived: true });

    this.stats.news = {
      total: totalNews,
      published: publishedNews,
      archived: archivedNews
    };

    console.log(`📰 Actualités: ${totalNews} total, ${publishedNews} publiées, ${archivedNews} archivées`);

    // Vérifier les slugs dupliqués
    const duplicateSlugs = await newsCollection.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateSlugs.length > 0) {
      this.addIssue('HIGH', `${duplicateSlugs.length} slugs dupliqués détectés`,
        'Les slugs dupliqués causent des conflits d\'URL');
    }

    // Vérifier les actualités sans slug
    const newsWithoutSlug = await newsCollection.countDocuments({
      $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }]
    });

    if (newsWithoutSlug > 0) {
      this.addIssue('MEDIUM', `${newsWithoutSlug} actualités sans slug`,
        'Les actualités doivent avoir un slug pour le SEO');
    }
  }

  /**
   * Vérifier l'intégrité des analytics
   */
  async checkAnalyticsIntegrity() {
    // Analytics V1
    const analyticsV1 = this.db.collection('newsanalytics');
    const v1Count = await analyticsV1.countDocuments();

    // Analytics V2
    const viewEvents = this.db.collection('viewevents');
    const shareEvents = this.db.collection('shareevents');
    const dailyStats = this.db.collection('dailynewsstats');

    const viewEventsCount = await viewEvents.countDocuments();
    const shareEventsCount = await shareEvents.countDocuments();
    const dailyStatsCount = await dailyStats.countDocuments();

    this.stats.analytics = {
      v1Records: v1Count,
      viewEvents: viewEventsCount,
      shareEvents: shareEventsCount,
      dailyStats: dailyStatsCount
    };

    console.log(`📊 Analytics V1: ${v1Count}, V2 Events: ${viewEventsCount + shareEventsCount}, Daily: ${dailyStatsCount}`);

    // Vérifier les données orphelines
    const orphanedAnalytics = await analyticsV1.aggregate([
      {
        $lookup: {
          from: 'news',
          localField: 'newsId',
          foreignField: '_id',
          as: 'news'
        }
      },
      { $match: { news: { $size: 0 } } }
    ]).toArray();

    if (orphanedAnalytics.length > 0) {
      this.addIssue('MEDIUM', `${orphanedAnalytics.length} analytics orphelins`,
        'Ces données référencent des actualités supprimées');
    }
  }

  /**
   * Vérifier la cohérence V1/V2
   */
  async checkV1V2Consistency() {
    console.log('🔄 Vérification cohérence V1/V2...');

    try {
      // Comparer les compteurs pour quelques actualités récentes
      const recentNews = await this.db.collection('news')
        .find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(10)
        .toArray();

      let inconsistencies = 0;

      for (const news of recentNews) {
        // V1 analytics
        const v1Analytics = await this.db.collection('newsanalytics')
          .findOne({ newsId: news._id });

        // V2 events
        const viewCount = await this.db.collection('viewevents')
          .countDocuments({ newsId: news._id.toString() });

        const shareCount = await this.db.collection('shareevents')
          .countDocuments({ newsId: news._id.toString() });

        if (v1Analytics) {
          const v1Views = v1Analytics.views?.length || 0;
          const v1Shares = v1Analytics.shares?.length || 0;

          // Tolérance de 10% pour les différences
          const viewDiff = Math.abs(v1Views - viewCount) / Math.max(v1Views, viewCount, 1);
          const shareDiff = Math.abs(v1Shares - shareCount) / Math.max(v1Shares, shareCount, 1);

          if (viewDiff > 0.1 || shareDiff > 0.1) {
            inconsistencies++;
          }
        }
      }

      if (inconsistencies > 0) {
        this.addIssue('MEDIUM', `${inconsistencies} incohérences V1/V2 détectées`,
          'Les données V1 et V2 ne correspondent pas parfaitement');
      }

    } catch (error) {
      this.addIssue('LOW', 'Erreur vérification V1/V2', error.message);
    }
  }

  /**
   * Analyser les performances
   */
  async checkPerformance() {
    console.log('⚡ Analyse des performances...');

    try {
      // Test performance des requêtes critiques
      const startTime = Date.now();

      // Requête 1: Liste des actualités
      const newsListStart = Date.now();
      await this.db.collection('news')
        .find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(20)
        .toArray();
      const newsListTime = Date.now() - newsListStart;

      // Requête 2: Analytics d'une actualité
      const analyticsStart = Date.now();
      const sampleNews = await this.db.collection('news').findOne({ status: 'published' });
      if (sampleNews) {
        await this.db.collection('newsanalytics').findOne({ newsId: sampleNews._id });
      }
      const analyticsTime = Date.now() - analyticsStart;

      // Requête 3: Events V2
      const eventsStart = Date.now();
      if (sampleNews) {
        await this.db.collection('viewevents')
          .find({ newsId: sampleNews._id.toString() })
          .limit(100)
          .toArray();
      }
      const eventsTime = Date.now() - eventsStart;

      this.stats.performance = {
        newsListTime,
        analyticsTime,
        eventsTime,
        totalTime: Date.now() - startTime
      };

      console.log(`⏱️ Liste actualités: ${newsListTime}ms`);
      console.log(`⏱️ Analytics: ${analyticsTime}ms`);
      console.log(`⏱️ Events V2: ${eventsTime}ms`);

      // Alertes performance
      if (newsListTime > 1000) {
        this.addIssue('HIGH', 'Requête liste actualités lente',
          `${newsListTime}ms - Optimisation des index recommandée`);
      }

      if (analyticsTime > 500) {
        this.addIssue('MEDIUM', 'Requête analytics lente',
          `${analyticsTime}ms - Vérifier les index`);
      }

      console.log('✅ Performances analysées');
    } catch (error) {
      this.addIssue('MEDIUM', 'Erreur analyse performance', error.message);
    }
  }

  /**
   * Analyser les erreurs
   */
  async analyzeErrors() {
    console.log('🔍 Analyse des erreurs...');

    try {
      const logsCollection = this.db.collection('systemlogs');

      // Erreurs récentes (24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentErrors = await logsCollection
        .find({
          level: { $in: ['error', 'fatal'] },
          timestamp: { $gte: oneDayAgo }
        })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      // Grouper par type d'erreur
      const errorTypes = {};
      recentErrors.forEach(error => {
        const type = error.component || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });

      this.stats.errors = {
        recent24h: recentErrors.length,
        types: errorTypes
      };

      console.log(`🚨 Erreurs récentes (24h): ${recentErrors.length}`);

      // Alertes d'erreurs
      if (recentErrors.length > 50) {
        this.addIssue('HIGH', `Trop d'erreurs récentes (${recentErrors.length})`,
          'Nombre d\'erreurs anormalement élevé');
      }

      // Erreurs critiques spécifiques
      const criticalErrors = recentErrors.filter(error =>
        error.message?.includes('MongoDB') ||
        error.message?.includes('conflict') ||
        error.message?.includes('timeout')
      );

      if (criticalErrors.length > 0) {
        this.addIssue('HIGH', `${criticalErrors.length} erreurs critiques`,
          'Erreurs MongoDB ou de conflit détectées');
      }

      console.log('✅ Erreurs analysées');
    } catch (error) {
      this.addIssue('MEDIUM', 'Erreur analyse des erreurs', error.message);
    }
  }

  /**
   * Vérifier l'implémentation V2
   */
  async checkV2Implementation() {
    console.log('🔧 Vérification implémentation V2...');

    const v2Files = [
      'src/lib/eventBus.js',
      'src/lib/newsAnalyticsV2.js',
      'src/lib/intelligentCache.js',
      'src/models/ViewEvent.js',
      'src/models/ShareEvent.js',
      'src/models/DailyNewsStats.js',
      'src/lib/autoSEO.js',
      'src/lib/monitoringV2.js'
    ];

    let implementedFiles = 0;
    for (const file of v2Files) {
      if (fs.existsSync(file)) {
        implementedFiles++;
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file}`);
        this.addIssue('HIGH', `Fichier V2 manquant: ${file}`,
          'Ce fichier est requis pour le système V2');
      }
    }

    this.stats.v2Implementation = {
      totalFiles: v2Files.length,
      implementedFiles,
      completionPercentage: Math.round((implementedFiles / v2Files.length) * 100)
    };

    console.log(`📁 Implémentation V2: ${implementedFiles}/${v2Files.length} (${this.stats.v2Implementation.completionPercentage}%)`);

    if (this.stats.v2Implementation.completionPercentage < 100) {
      this.addIssue('HIGH', 'Implémentation V2 incomplète',
        `${v2Files.length - implementedFiles} fichiers manquants`);
    }
  }

  /**
   * Valider la configuration
   */
  async validateConfiguration() {
    console.log('⚙️ Validation de la configuration...');

    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'ANALYTICS_ENABLED',
      'CACHE_ENABLED',
      'SEO_ENABLED'
    ];

    let missingVars = 0;
    for (const envVar of requiredEnvVars) {
      if (!this.config[envVar]) {
        missingVars++;
        this.addIssue('MEDIUM', `Variable manquante: ${envVar}`,
          'Cette variable est recommandée pour V2');
      }
    }

    this.stats.configuration = {
      totalVars: requiredEnvVars.length,
      configuredVars: requiredEnvVars.length - missingVars
    };

    console.log(`⚙️ Configuration: ${requiredEnvVars.length - missingVars}/${requiredEnvVars.length} variables`);
  }

  /**
   * Ajouter un problème
   */
  addIssue(severity, title, description) {
    this.issues.push({
      severity,
      title,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Générer des recommandations
   */
  generateRecommendations() {
    // Recommandations basées sur les problèmes détectés
    if (this.stats.performance?.newsListTime > 1000) {
      this.recommendations.push({
        priority: 'HIGH',
        title: 'Optimiser les index des actualités',
        action: 'Exécuter: node src/scripts/createOptimizedIndexes.js'
      });
    }

    if (this.stats.v2Implementation?.completionPercentage < 100) {
      this.recommendations.push({
        priority: 'HIGH',
        title: 'Compléter l\'implémentation V2',
        action: 'Exécuter: node scripts/setupV2.js'
      });
    }

    if (this.stats.errors?.recent24h > 10) {
      this.recommendations.push({
        priority: 'MEDIUM',
        title: 'Analyser les erreurs récentes',
        action: 'Consulter les logs système et corriger les problèmes récurrents'
      });
    }

    if (this.stats.analytics?.v1Records > 0) {
      this.recommendations.push({
        priority: 'MEDIUM',
        title: 'Migrer vers Analytics V2',
        action: 'Exécuter: node src/scripts/migrateToV2Analytics.js'
      });
    }

    // Recommandations générales
    this.recommendations.push({
      priority: 'LOW',
      title: 'Programmer la maintenance automatique',
      action: 'Configurer: node src/scripts/autoMaintenanceV2.js daily'
    });
  }

  /**
   * Générer le rapport
   */
  async generateReport() {
    console.log('📋 Génération du rapport...');

    this.generateRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'CRITICAL').length,
        highIssues: this.issues.filter(i => i.severity === 'HIGH').length,
        mediumIssues: this.issues.filter(i => i.severity === 'MEDIUM').length,
        lowIssues: this.issues.filter(i => i.severity === 'LOW').length
      },
      stats: this.stats,
      issues: this.issues,
      recommendations: this.recommendations
    };

    // Sauvegarder le rapport
    const reportPath = `diagnostic-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Afficher le résumé
    this.displaySummary(report);

    console.log(`\n📄 Rapport complet sauvegardé: ${reportPath}`);
  }

  /**
   * Afficher le résumé
   */
  displaySummary(report) {
    console.log(`\n📊 RÉSUMÉ DU DIAGNOSTIC
========================

🔍 Santé globale: ${report.summary.totalIssues === 0 ? '✅ EXCELLENT' :
  report.summary.criticalIssues > 0 ? '🚨 CRITIQUE' :
  report.summary.highIssues > 0 ? '⚠️ ATTENTION' : '✅ BON'}

📈 Statistiques:
${report.stats.news ? `  • Actualités: ${report.stats.news.total} total, ${report.stats.news.published} publiées` : ''}
${report.stats.analytics ? `  • Analytics: ${report.stats.analytics.v1Records} V1, ${report.stats.analytics.viewEvents + report.stats.analytics.shareEvents} V2 events` : ''}
${report.stats.database ? `  • Base de données: ${report.stats.database.totalSize}MB (${report.stats.database.collections} collections)` : ''}
${report.stats.performance ? `  • Performance: Liste ${report.stats.performance.newsListTime}ms, Analytics ${report.stats.performance.analyticsTime}ms` : ''}

🚨 Problèmes détectés:
  • Critiques: ${report.summary.criticalIssues}
  • Élevés: ${report.summary.highIssues}
  • Moyens: ${report.summary.mediumIssues}
  • Faibles: ${report.summary.lowIssues}

🔧 Recommandations principales:`);

    report.recommendations
      .filter(r => r.priority === 'HIGH')
      .slice(0, 3)
      .forEach(rec => {
        console.log(`  • ${rec.title}`);
        console.log(`    → ${rec.action}`);
      });

    if (report.summary.totalIssues === 0) {
      console.log('\n🎉 Félicitations! Aucun problème critique détecté.');
      console.log('💡 Consultez le rapport complet pour les optimisations suggérées.');
    } else {
      console.log('\n🔧 Actions recommandées:');
      console.log('1. Corriger les problèmes critiques et élevés');
      console.log('2. Exécuter les scripts de maintenance suggérés');
      console.log('3. Relancer le diagnostic après corrections');
    }
  }
}

// Exécution du script
async function main() {
  const diagnostic = new NewsAnalyticsDiagnostic();
  await diagnostic.diagnose();
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NewsAnalyticsDiagnostic };
