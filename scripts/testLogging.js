#!/usr/bin/env node
// scripts/testLogging.js
const { logger } = require('../src/lib/logger');

/**
 * Test rapide du système de logging après corrections
 */
async function testLogging() {
  console.log('🧪 Test du système de logging...\n');

  try {
    // Test 1: Log avec nouveau type minister_content_accessed
    console.log('1. Test du type minister_content_accessed...');
    await logger.info('minister_content_accessed', 'Test log after correction', {
      hasCustomContent: true,
      sectionsCount: 3,
      userAgent: 'Test User Agent'
    });
    console.log('   ✅ Succès\n');

    // Test 2: Log standard
    console.log('2. Test d\'un log standard...');
    await logger.info('content_viewed', 'Standard content view test', {
      userId: 'test-user',
      contentId: 'test-content'
    });
    console.log('   ✅ Succès\n');

    // Test 3: Log d'erreur
    console.log('3. Test d\'un log d\'erreur...');
    await logger.error('system_error', 'Test error log', {
      errorCode: 'TEST_001',
      details: 'This is a test error'
    });
    console.log('   ✅ Succès\n');

    // Test 4: Vérifier qu'on peut sauvegarder en base
    console.log('4. Vérification de la sauvegarde en base...');
    await logger.success('system_startup', 'Test logging system validation completed', {
      testsPassed: 4,
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Succès\n');

    console.log('🎉 Tous les tests de logging ont réussi!');
    console.log('✅ Le problème de validation SystemLog est corrigé.');

  } catch (error) {
    console.error('❌ Erreur lors des tests de logging:', error);
    if (error.errors) {
      console.error('Détails de validation:', error.errors);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Exécution si appelé directement
if (require.main === module) {
  testLogging().catch(console.error);
}

module.exports = { testLogging };