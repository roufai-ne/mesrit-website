// src/scripts/integrationTestsV2.js
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import NewsAnalyticsServiceV2 from '../lib/newsAnalyticsV2.js';
import AutoSEOService from '../lib/autoSEO.js';
import intelligentCache from '../lib/intelligentCache.js';
import newsEventBus from '../lib/eventBus.js';
import monitoringSystemV2 from '../lib/monitoringV2.js';
import { NewsErrorHandler } from '../lib/newsErrors.js';

// Models
import News from '../models/News.js';
import ViewEvent from '../models/ViewEvent.js';
import ShareEvent from '../models/ShareEvent.js';
import DailyNewsStats from '../models/DailyNewsStats.js';

/**
 * Suite de tests d'intégration pour le système V2
 */
class IntegrationTestSuiteV2 {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: new Date(),
      endTime: null
    };

    this.testData = {
      news: [],
      cleanup: []
    };
  }

  /**
   * Exécuter tous les tests d'intégration
   */
  async runAllTests() {
    try {
      console.log('🧪 Démarrage des tests d\'intégration V2...');

      await connectDB();
      await this.setupTestData();

      // Tests principaux
      await this.testEventSystem();
      await this.testAnalyticsWorkflow();
      await this.testSEOGeneration();
      await this.testCacheSystem();
      await this.testErrorHandling();
      await this.testMonitoring();
      await this.testPerformance();

      this.results.endTime = new Date();
      this.printResults();

    } catch (error) {
      console.error('💥 Erreur lors des tests:', error);
      this.results.failed++;
    } finally {
      await this.cleanup();
      await mongoose.connection.close();
    }
  }

  /**
   * Configuration des données de test
   */
  async setupTestData() {
    console.log('🔧 Configuration des données de test...');

    // Créer des articles de test
    const testNews = [
      {
        title: 'Article Test 1 - Analytics',
        content: 'Contenu de test pour analytics avec plus de 500 caractères. '.repeat(10),
        category: 'test',
        status: 'published'
      },
      {
        title: 'Article Test 2 - SEO',
        content: 'Contenu de test pour SEO avec des mots-clés spécifiques comme technologie, innovation, recherche, développement. '.repeat(8),
        category: 'tech',
        status: 'published'
      },
      {
        title: 'Article Test 3 - Performance',
        content: 'Contenu de test pour performance et cache. '.repeat(15),
        category: 'performance',
        status: 'draft'
      }
    ];

    for (const newsData of testNews) {
      const news = new News(newsData);
      await news.save();
      this.testData.news.push(news);
      this.testData.cleanup.push({ model: 'News', id: news._id });
    }

    console.log(`✅ ${testNews.length} articles de test créés`);
  }

  /**
   * Test du système d'événements
   */
  async testEventSystem() {
    const testName = 'Event System';
    console.log(`🧪 Test: ${testName}...`);

    try {
      let eventReceived = false;
      let eventData = null;

      // S'abonner à un événement de test
      const unsubscribe = newsEventBus.subscribeToEvent(
        'test:integration',
        (data) => {
          eventReceived = true;
          eventData = data;
        }
      );

      // Émettre l'événement
      const eventId = newsEventBus.emitEvent('test:integration', {
        message: 'Test integration event',
        timestamp: new Date()
      });

      // Attendre que l'événement soit traité
      await new Promise(resolve => setTimeout(resolve, 100));

      // Vérifications
      this.assert(eventId, 'Event ID should be generated');
      this.assert(eventReceived, 'Event should be received');
      this.assert(eventData?.message === 'Test integration event', 'Event data should be correct');

      // Nettoyer
      unsubscribe();

      this.recordTestResult(testName, true, 'Système d\'événements fonctionne correctement');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test du workflow analytics complet
   */
  async testAnalyticsWorkflow() {
    const testName = 'Analytics Workflow';
    console.log(`🧪 Test: ${testName}...`);

    try {
      const news = this.testData.news[0];

      // 1. Tracker des vues
      const viewData = {
        sessionId: 'test-session-123',
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        referrer: 'https://test.com',
        readingTime: 45,
        scrollDepth: 80
      };

      const viewEvent = await NewsAnalyticsServiceV2.trackView(news._id, viewData);
      this.assert(viewEvent._id, 'View event should be created');

      // 2. Tracker des partages
      const shareData = {
        platform: 'facebook',
        sessionId: 'test-session-123',
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        shareUrl: 'https://test.com/news/123'
      };

      const shareEvent = await NewsAnalyticsServiceV2.trackShare(news._id, shareData);
      this.assert(shareEvent._id, 'Share event should be created');

      // 3. Vérifier les événements dans la DB
      const viewCount = await ViewEvent.countDocuments({ newsId: news._id });
      const shareCount = await ShareEvent.countDocuments({ newsId: news._id });

      this.assert(viewCount >= 1, 'View events should be stored');
      this.assert(shareCount >= 1, 'Share events should be stored');

      // 4. Générer les stats quotidiennes
      await NewsAnalyticsServiceV2.updateDailyStats(news._id);

      const dailyStats = await DailyNewsStats.findOne({ newsId: news._id });
      this.assert(dailyStats, 'Daily stats should be generated');
      this.assert(dailyStats.totalViews >= 1, 'Daily stats should include views');

      // 5. Récupérer les stats
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 1);

      const stats = await NewsAnalyticsServiceV2.getNewsStats(news._id, startDate, endDate);
      this.assert(stats.totals.totalViews >= 1, 'Stats should be retrievable');

      // Ajouter aux données de nettoyage
      this.testData.cleanup.push(
        { model: 'ViewEvent', query: { newsId: news._id } },
        { model: 'ShareEvent', query: { newsId: news._id } },
        { model: 'DailyNewsStats', query: { newsId: news._id } }
      );

      this.recordTestResult(testName, true, 'Workflow analytics complet fonctionne');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test de la génération SEO
   */
  async testSEOGeneration() {
    const testName = 'SEO Generation';
    console.log(`🧪 Test: ${testName}...`);

    try {
      const news = this.testData.news[1];

      // Générer le SEO automatiquement
      const seoData = await AutoSEOService.generateAutoSEO(news._id);

      // Vérifications
      this.assert(seoData.slug, 'Slug should be generated');
      this.assert(seoData.metaDescription, 'Meta description should be generated');
      this.assert(seoData.keywords.length > 0, 'Keywords should be extracted');
      this.assert(seoData.openGraph, 'Open Graph data should be generated');
      this.assert(seoData.jsonLd, 'JSON-LD data should be generated');
      this.assert(seoData.seoScore.total > 0, 'SEO score should be calculated');

      // Vérifier que l'article a été mis à jour
      const updatedNews = await News.findById(news._id);
      this.assert(updatedNews.slug === seoData.slug, 'News should be updated with slug');
      this.assert(updatedNews.seo, 'News should have SEO data');

      // Test de l'audit SEO
      const audit = await AutoSEOService.auditNewsSEO(news._id);
      this.assert(audit.score > 0, 'SEO audit should return a score');

      // Test du sitemap
      const sitemap = await AutoSEOService.generateSitemap();
      this.assert(Array.isArray(sitemap), 'Sitemap should be an array');
      this.assert(sitemap.length > 0, 'Sitemap should contain URLs');

      this.recordTestResult(testName, true, 'Génération SEO fonctionne correctement');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test du système de cache
   */
  async testCacheSystem() {
    const testName = 'Cache System';
    console.log(`🧪 Test: ${testName}...`);

    try {
      const testKey = 'test:cache:integration';
      const testValue = { message: 'Test cache value', timestamp: new Date() };

      // Test basique set/get
      await intelligentCache.set(testKey, testValue);
      const retrieved = await intelligentCache.get(testKey);

      this.assert(retrieved, 'Value should be retrieved from cache');
      this.assert(retrieved.message === testValue.message, 'Retrieved value should match');

      // Test avec TTL
      const ttlKey = 'test:cache:ttl';
      await intelligentCache.set(ttlKey, testValue, { ttl: 100 }); // 100ms

      let ttlValue = await intelligentCache.get(ttlKey);
      this.assert(ttlValue, 'Value should be retrievable before TTL');

      // Attendre expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      ttlValue = await intelligentCache.get(ttlKey);
      this.assert(!ttlValue, 'Value should be expired after TTL');

      // Test avec tags
      const tagKey = 'test:cache:tags';
      await intelligentCache.set(tagKey, testValue, { tags: ['test', 'integration'] });

      let tagValue = await intelligentCache.get(tagKey);
      this.assert(tagValue, 'Value with tags should be retrievable');

      // Invalidation par tags
      intelligentCache.invalidateByTags(['test']);
      tagValue = await intelligentCache.get(tagKey);
      this.assert(!tagValue, 'Value should be invalidated by tags');

      // Test wrap function
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        return { fetchCount, timestamp: new Date() };
      };

      const wrapKey = 'test:cache:wrap';
      const result1 = await intelligentCache.wrap(wrapKey, fetcher);
      const result2 = await intelligentCache.wrap(wrapKey, fetcher);

      this.assert(fetchCount === 1, 'Fetcher should be called only once');
      this.assert(result1.fetchCount === result2.fetchCount, 'Results should be identical from cache');

      // Test statistiques
      const stats = intelligentCache.getStatistics();
      this.assert(typeof stats.hits === 'number', 'Stats should include hits');
      this.assert(typeof stats.misses === 'number', 'Stats should include misses');
      this.assert(typeof stats.hitRate === 'number', 'Stats should include hit rate');

      this.recordTestResult(testName, true, 'Système de cache fonctionne correctement');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test de la gestion d'erreurs
   */
  async testErrorHandling() {
    const testName = 'Error Handling';
    console.log(`🧪 Test: ${testName}...`);

    try {
      // Test d'erreur Analytics
      try {
        await NewsAnalyticsServiceV2.trackView('invalid-id', {});
        this.assert(false, 'Should throw error for invalid news ID');
      } catch (error) {
        this.assert(error.name === 'AnalyticsError', 'Should throw AnalyticsError');
        this.assert(error.correlationId, 'Error should have correlation ID');
      }

      // Test d'erreur SEO
      try {
        await AutoSEOService.generateAutoSEO('invalid-id');
        this.assert(false, 'Should throw error for invalid news ID');
      } catch (error) {
        this.assert(error.name === 'SEOError', 'Should throw SEOError');
      }

      // Test du wrapper d'erreur
      try {
        await NewsErrorHandler.withErrorHandling(async () => {
          throw new Error('Test error');
        });
        this.assert(false, 'Should throw error');
      } catch (error) {
        this.assert(error.name === 'NewsSystemError', 'Should normalize to NewsSystemError');
      }

      // Test de création de réponse API
      const testError = new Error('Test API error');
      const { response, statusCode } = NewsErrorHandler.createApiErrorResponse(testError);

      this.assert(response.success === false, 'API response should indicate failure');
      this.assert(response.error.message, 'API response should include error message');
      this.assert(response.error.correlationId, 'API response should include correlation ID');
      this.assert(statusCode === 500, 'Should return 500 status code');

      this.recordTestResult(testName, true, 'Gestion d\'erreurs fonctionne correctement');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test du système de monitoring
   */
  async testMonitoring() {
    const testName = 'Monitoring System';
    console.log(`🧪 Test: ${testName}...`);

    try {
      // Démarrer le monitoring pour le test
      monitoringSystemV2.start();

      // Attendre que le monitoring collecte des données
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test des métriques
      const metrics = monitoringSystemV2.getCurrentMetrics();
      this.assert(typeof metrics === 'object', 'Metrics should be collected');

      // Test de création d'alerte
      let alertReceived = false;
      monitoringSystemV2.once('alert', (alert) => {
        alertReceived = true;
      });

      const alertId = monitoringSystemV2.createAlert(
        'warning',
        'Test alert for integration',
        { test: true }
      );

      this.assert(alertId, 'Alert should be created');
      this.assert(alertReceived, 'Alert event should be emitted');

      // Test des alertes actives
      const activeAlerts = monitoringSystemV2.getActiveAlerts();
      this.assert(activeAlerts.length > 0, 'Should have active alerts');

      // Test d'acquittement d'alerte
      monitoringSystemV2.acknowledgeAlert(alertId, 'test-user');
      const acknowledgedAlert = monitoringSystemV2.alerts.history.find(a => a.id === alertId);
      this.assert(acknowledgedAlert.acknowledged, 'Alert should be acknowledged');

      // Test de résolution d'alerte
      monitoringSystemV2.resolveAlert(alertId, 'test-resolved');
      const resolvedAlert = monitoringSystemV2.alerts.history.find(a => a.id === alertId);
      this.assert(resolvedAlert.resolved, 'Alert should be resolved');

      // Test du rapport de santé
      const healthReport = monitoringSystemV2.generateHealthReport();
      this.assert(healthReport.timestamp, 'Health report should have timestamp');
      this.assert(typeof healthReport.status === 'string', 'Health report should have status');

      // Arrêter le monitoring
      monitoringSystemV2.stop();

      this.recordTestResult(testName, true, 'Système de monitoring fonctionne correctement');

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Test de performance
   */
  async testPerformance() {
    const testName = 'Performance Test';
    console.log(`🧪 Test: ${testName}...`);

    try {
      const news = this.testData.news[2];
      const iterations = 50;

      // Test de performance analytics
      const analyticsStart = Date.now();
      const viewPromises = [];

      for (let i = 0; i < iterations; i++) {
        viewPromises.push(
          NewsAnalyticsServiceV2.trackView(news._id, {
            sessionId: `perf-test-${i}`,
            ip: '127.0.0.1',
            userAgent: 'Performance Test Browser',
            readingTime: Math.random() * 100,
            scrollDepth: Math.random() * 100
          })
        );
      }

      await Promise.all(viewPromises);
      const analyticsTime = Date.now() - analyticsStart;

      this.assert(analyticsTime < 5000, `Analytics should complete in <5s (took ${analyticsTime}ms)`);

      // Test de performance cache
      const cacheStart = Date.now();
      const cachePromises = [];

      for (let i = 0; i < iterations; i++) {
        cachePromises.push(
          intelligentCache.wrap(`perf-test-${i}`, async () => {
            return { data: `Performance test ${i}`, timestamp: new Date() };
          })
        );
      }

      await Promise.all(cachePromises);
      const cacheTime = Date.now() - cacheStart;

      this.assert(cacheTime < 1000, `Cache should complete in <1s (took ${cacheTime}ms)`);

      // Test de performance SEO (moins d'iterations car plus lourd)
      const seoStart = Date.now();
      const seoPromises = [];

      for (let i = 0; i < 3; i++) {
        const testNews = new News({
          title: `Performance Test Article ${i}`,
          content: 'Performance test content. '.repeat(50),
          category: 'performance',
          status: 'published'
        });
        await testNews.save();
        this.testData.cleanup.push({ model: 'News', id: testNews._id });

        seoPromises.push(AutoSEOService.generateAutoSEO(testNews._id));
      }

      await Promise.all(seoPromises);
      const seoTime = Date.now() - seoStart;

      this.assert(seoTime < 3000, `SEO generation should complete in <3s (took ${seoTime}ms)`);

      // Nettoyage des données de performance
      await ViewEvent.deleteMany({ sessionId: /^perf-test-/ });

      this.recordTestResult(testName, true, `Performance acceptable - Analytics: ${analyticsTime}ms, Cache: ${cacheTime}ms, SEO: ${seoTime}ms`);

    } catch (error) {
      this.recordTestResult(testName, false, error.message);
    }
  }

  /**
   * Enregistrer le résultat d'un test
   */
  recordTestResult(testName, passed, message) {
    this.results.tests.push({
      name: testName,
      passed,
      message,
      timestamp: new Date()
    });

    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  /**
   * Assertion helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Nettoyer les données de test
   */
  async cleanup() {
    console.log('🧹 Nettoyage des données de test...');

    for (const item of this.testData.cleanup) {
      try {
        if (item.model === 'News') {
          await News.findByIdAndDelete(item.id);
        } else if (item.model === 'ViewEvent') {
          await ViewEvent.deleteMany(item.query);
        } else if (item.model === 'ShareEvent') {
          await ShareEvent.deleteMany(item.query);
        } else if (item.model === 'DailyNewsStats') {
          await DailyNewsStats.deleteMany(item.query);
        }
      } catch (error) {
        console.error(`Erreur nettoyage ${item.model}:`, error.message);
      }
    }

    // Nettoyer le cache
    intelligentCache.clear();

    console.log('✅ Nettoyage terminé');
  }

  /**
   * Afficher les résultats
   */
  printResults() {
    const duration = this.results.endTime - this.results.startTime;
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? (this.results.passed / total) * 100 : 0;

    console.log(`
📋 RÉSULTATS DES TESTS D'INTÉGRATION V2
=======================================
⏱️  Durée totale: ${Math.round(duration / 1000)}s
📊 Tests exécutés: ${total}
✅ Tests réussis: ${this.results.passed}
❌ Tests échoués: ${this.results.failed}
📈 Taux de réussite: ${Math.round(successRate)}%

📋 DÉTAILS:
${this.results.tests.map(test =>
  `${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}`
).join('\n')}

${this.results.failed === 0 ?
  '🎉 TOUS LES TESTS SONT PASSÉS! Le système V2 est prêt pour la production.' :
  '⚠️  DES TESTS ONT ÉCHOUÉ. Vérifiez les erreurs avant le déploiement.'
}
`);
  }
}

// Script exécutable
async function main() {
  const testSuite = new IntegrationTestSuiteV2();
  await testSuite.runAllTests();

  // Exit avec code d'erreur si des tests ont échoué
  process.exit(testSuite.results.failed > 0 ? 1 : 0);
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IntegrationTestSuiteV2 };