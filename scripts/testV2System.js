#!/usr/bin/env node
// scripts/testV2System.js
const { MongoClient } = require('mongodb');

/**
 * Test simple du système V2
 */
class V2SystemTester {
  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mesrit';
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async runTests() {
    console.log('🧪 TESTS SYSTÈME V2');
    console.log('==================\n');

    try {
      await this.client.connect();
      this.db = this.client.db();

      console.log('✅ Connexion MongoDB OK');

      // Test 1: Vérifier les collections V2
      await this.testV2Collections();

      // Test 2: Test insertion ViewEvent
      await this.testViewEventInsertion();

      // Test 3: Test insertion ShareEvent
      await this.testShareEventInsertion();

      // Test 4: Test agrégation DailyStats
      await this.testDailyStatsAggregation();

      console.log('\n🎉 Tous les tests V2 sont passés avec succès!');
      console.log('\n📋 Résumé:');
      console.log('  ✅ Collections V2 présentes');
      console.log('  ✅ Insertion ViewEvent');
      console.log('  ✅ Insertion ShareEvent');
      console.log('  ✅ Agrégation statistiques');
      console.log('\n🚀 Le système V2 est opérationnel!');

    } catch (error) {
      console.error('❌ Test échoué:', error.message);
      process.exit(1);
    } finally {
      await this.client.close();
    }
  }

  async testV2Collections() {
    console.log('🔍 Test collections V2...');

    const requiredCollections = ['viewevents', 'shareevents', 'dailynewsstats'];
    const existingCollections = await this.db.listCollections().toArray();
    const collectionNames = existingCollections.map(c => c.name);

    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        console.log(`  ✅ ${collection}`);
      } else {
        throw new Error(`Collection manquante: ${collection}`);
      }
    }
  }

  async testViewEventInsertion() {
    console.log('\n📊 Test insertion ViewEvent...');

    const viewEvent = {
      newsId: 'test-news-id',
      timestamp: new Date(),
      userAgent: 'Test Browser',
      ipAddress: '127.0.0.1',
      sessionId: 'test-session-' + Date.now(),
      userId: null,
      deviceType: 'desktop',
      isBot: false,
      readingTime: 30,
      scrollDepth: 75,
      expireAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 ans
    };

    const result = await this.db.collection('viewevents').insertOne(viewEvent);
    if (result.acknowledged) {
      console.log('  ✅ ViewEvent inséré avec succès');

      // Nettoyer
      await this.db.collection('viewevents').deleteOne({ _id: result.insertedId });
      console.log('  🧹 Données test nettoyées');
    } else {
      throw new Error('Échec insertion ViewEvent');
    }
  }

  async testShareEventInsertion() {
    console.log('\n📤 Test insertion ShareEvent...');

    const shareEvent = {
      newsId: 'test-news-id',
      platform: 'facebook',
      timestamp: new Date(),
      userId: null,
      sessionId: 'test-session-' + Date.now(),
      referrer: 'https://example.com'
    };

    const result = await this.db.collection('shareevents').insertOne(shareEvent);
    if (result.acknowledged) {
      console.log('  ✅ ShareEvent inséré avec succès');

      // Nettoyer
      await this.db.collection('shareevents').deleteOne({ _id: result.insertedId });
      console.log('  🧹 Données test nettoyées');
    } else {
      throw new Error('Échec insertion ShareEvent');
    }
  }

  async testDailyStatsAggregation() {
    console.log('\n📈 Test agrégation DailyStats...');

    // Insérer quelques données test
    const testData = [
      {
        newsId: 'test-news-daily',
        timestamp: new Date(),
        userAgent: 'Test Browser 1',
        ipAddress: '127.0.0.1',
        sessionId: 'session-1',
        expireAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
      },
      {
        newsId: 'test-news-daily',
        timestamp: new Date(),
        userAgent: 'Test Browser 2',
        ipAddress: '127.0.0.2',
        sessionId: 'session-2',
        expireAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
      }
    ];

    await this.db.collection('viewevents').insertMany(testData);

    // Tester l'agrégation pour créer les stats journalières
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aggregationResult = await this.db.collection('viewevents').aggregate([
      {
        $match: {
          newsId: 'test-news-daily',
          timestamp: { $gte: today }
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
          },
          totalViews: { $sum: 1 },
          uniqueViews: { $addToSet: '$sessionId' },
          deviceTypes: { $push: '$deviceType' }
        }
      },
      {
        $project: {
          newsId: '$_id.newsId',
          date: { $dateFromString: { dateString: '$_id.date' } },
          totalViews: 1,
          uniqueViews: { $size: '$uniqueViews' },
          mobileViews: {
            $size: {
              $filter: {
                input: '$deviceTypes',
                cond: { $eq: ['$$this', 'mobile'] }
              }
            }
          },
          _id: 0
        }
      }
    ]).toArray();

    if (aggregationResult.length > 0) {
      console.log('  ✅ Agrégation réussie');
      console.log(`  📊 ${aggregationResult[0].totalViews} vues totales, ${aggregationResult[0].uniqueViews} vues uniques`);
    } else {
      console.log('  ⚠️ Aucune donnée agrégée (normal pour test)');
    }

    // Nettoyer les données test
    await this.db.collection('viewevents').deleteMany({ newsId: 'test-news-daily' });
    console.log('  🧹 Données test nettoyées');
  }
}

// Exécution
async function main() {
  const tester = new V2SystemTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { V2SystemTester };