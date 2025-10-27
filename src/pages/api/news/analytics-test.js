// src/pages/api/news/analytics-test.js
// Endpoint de diagnostic pour tester les analytics
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import DailyNewsStats from '@/models/DailyNewsStats';
import ViewEvent from '@/models/ViewEvent';
import ShareEvent from '@/models/ShareEvent';
import News from '@/models/News';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  try {
    // 1. Test connexion MongoDB
    console.log('[Analytics Test] Test connexion MongoDB...');
    try {
      await connectDB();
      const mongoState = mongoose.connection.readyState;
      const mongoStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      diagnostics.checks.push({
        name: 'MongoDB Connection',
        status: mongoState === 1 ? 'OK' : 'ERROR',
        details: {
          state: mongoStates[mongoState] || 'unknown',
          stateCode: mongoState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'MongoDB Connection',
        status: 'ERROR',
        error: error.message
      });
    }

    // 2. Vérifier les collections
    console.log('[Analytics Test] Vérification des collections...');
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      const requiredCollections = ['dailynewsstats', 'viewevents', 'shareevents', 'news'];
      const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c));

      diagnostics.checks.push({
        name: 'Collections Exist',
        status: missingCollections.length === 0 ? 'OK' : 'WARNING',
        details: {
          found: collectionNames,
          required: requiredCollections,
          missing: missingCollections
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Collections Exist',
        status: 'ERROR',
        error: error.message
      });
    }

    // 3. Compter les documents
    console.log('[Analytics Test] Comptage des documents...');
    try {
      const counts = {
        news: await News.countDocuments(),
        dailyNewsStats: await DailyNewsStats.countDocuments(),
        viewEvents: await ViewEvent.countDocuments(),
        shareEvents: await ShareEvent.countDocuments()
      };

      diagnostics.checks.push({
        name: 'Document Counts',
        status: 'OK',
        details: counts
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Document Counts',
        status: 'ERROR',
        error: error.message
      });
    }

    // 4. Test agrégation simple
    console.log('[Analytics Test] Test agrégation simple...');
    try {
      const testAggregation = await DailyNewsStats.aggregate([
        { $limit: 1 },
        { $project: { _id: 1, date: 1, newsId: 1, totalViews: 1 } }
      ]);

      diagnostics.checks.push({
        name: 'Simple Aggregation',
        status: 'OK',
        details: {
          resultCount: testAggregation.length,
          sample: testAggregation[0] || null
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Simple Aggregation',
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      });
    }

    // 5. Test agrégation complexe (celle qui cause problème)
    console.log('[Analytics Test] Test agrégation complexe...');
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const complexAggregation = await DailyNewsStats.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$totalViews' },
            totalUniqueViews: { $sum: '$uniqueViews' },
            totalShares: { $sum: '$totalShares' }
          }
        }
      ]);

      diagnostics.checks.push({
        name: 'Complex Aggregation',
        status: 'OK',
        details: {
          resultCount: complexAggregation.length,
          result: complexAggregation[0] || { totalViews: 0, totalUniqueViews: 0, totalShares: 0 }
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Complex Aggregation',
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      });
    }

    // 6. Test $sortArray (MongoDB 5.2+)
    console.log('[Analytics Test] Test $sortArray operator...');
    try {
      const sortArrayTest = await DailyNewsStats.aggregate([
        { $limit: 5 },
        {
          $group: {
            _id: null,
            items: { $push: { date: '$date', views: '$totalViews' } }
          }
        },
        {
          $project: {
            sorted: {
              $sortArray: {
                input: '$items',
                sortBy: { date: 1 }
              }
            }
          }
        }
      ]);

      diagnostics.checks.push({
        name: 'SortArray Operator (MongoDB 5.2+)',
        status: 'OK',
        details: {
          supported: true,
          resultCount: sortArrayTest.length
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'SortArray Operator (MongoDB 5.2+)',
        status: 'ERROR',
        error: error.message,
        details: {
          supported: false,
          hint: 'Votre version de MongoDB ne supporte pas $sortArray. Mettez à jour vers MongoDB 5.2+'
        }
      });
    }

    // 7. Vérifier la version MongoDB
    console.log('[Analytics Test] Vérification version MongoDB...');
    try {
      const adminDb = mongoose.connection.db.admin();
      const serverInfo = await adminDb.serverInfo();

      diagnostics.checks.push({
        name: 'MongoDB Version',
        status: 'INFO',
        details: {
          version: serverInfo.version,
          versionArray: serverInfo.versionArray
        }
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'MongoDB Version',
        status: 'WARNING',
        error: error.message
      });
    }

    // Résumé
    const errorCount = diagnostics.checks.filter(c => c.status === 'ERROR').length;
    const warningCount = diagnostics.checks.filter(c => c.status === 'WARNING').length;

    diagnostics.summary = {
      total: diagnostics.checks.length,
      ok: diagnostics.checks.filter(c => c.status === 'OK').length,
      warnings: warningCount,
      errors: errorCount,
      overall: errorCount > 0 ? 'FAILED' : (warningCount > 0 ? 'WARNING' : 'PASSED')
    };

    console.log('[Analytics Test] Diagnostic terminé:', diagnostics.summary);

    return res.status(200).json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error('[Analytics Test] Erreur globale:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      diagnostics
    });
  }
}
