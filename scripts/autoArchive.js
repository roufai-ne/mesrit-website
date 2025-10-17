// src/scripts/autoArchive.js
// Script pour l'archivage automatique des anciens articles

import NewsArchiveService from '../lib/newsArchive.js';
import logger, { LOG_TYPES } from '../lib/logger.js';

/**
 * Configuration de l'archivage automatique
 */
const ARCHIVE_CONFIG = {
  // Archiver les articles publiés depuis plus de 365 jours
  AUTO_ARCHIVE_DAYS: parseInt(process.env.AUTO_ARCHIVE_DAYS) || 365,
  
  // Supprimer définitivement les articles en corbeille depuis plus de 30 jours
  TRASH_CLEANUP_DAYS: parseInt(process.env.TRASH_CLEANUP_DAYS) || 30,
  
  // Activer l'archivage automatique
  ENABLE_AUTO_ARCHIVE: process.env.ENABLE_AUTO_ARCHIVE === 'true',
  
  // Activer le nettoyage de la corbeille
  ENABLE_TRASH_CLEANUP: process.env.ENABLE_TRASH_CLEANUP === 'true'
};

/**
 * Fonction principale d'archivage automatique
 */
async function runAutoArchive() {
  const startTime = Date.now();
  
  try {
    console.log('🗄️ Démarrage de l\'archivage automatique...');
    
    await logger.info(
      LOG_TYPES.SYSTEM_MAINTENANCE,
      'Démarrage de l\'archivage automatique',
      {
        config: ARCHIVE_CONFIG,
        timestamp: new Date().toISOString()
      }
    );
    
    let totalArchived = 0;
    let totalDeleted = 0;
    
    // Archivage automatique des anciens articles
    if (ARCHIVE_CONFIG.ENABLE_AUTO_ARCHIVE) {
      console.log(`📦 Archivage des articles de plus de ${ARCHIVE_CONFIG.AUTO_ARCHIVE_DAYS} jours...`);
      
      const archiveResult = await NewsArchiveService.autoArchiveOldArticles(
        ARCHIVE_CONFIG.AUTO_ARCHIVE_DAYS
      );
      
      totalArchived = archiveResult.modifiedCount;
      
      console.log(`✅ ${totalArchived} articles archivés automatiquement`);
    } else {
      console.log('⏭️ Archivage automatique désactivé');
    }
    
    // Nettoyage de la corbeille
    if (ARCHIVE_CONFIG.ENABLE_TRASH_CLEANUP) {
      console.log(`🗑️ Nettoyage de la corbeille (articles de plus de ${ARCHIVE_CONFIG.TRASH_CLEANUP_DAYS} jours)...`);
      
      const cleanupResult = await NewsArchiveService.cleanupTrash(
        ARCHIVE_CONFIG.TRASH_CLEANUP_DAYS
      );
      
      totalDeleted = cleanupResult.deletedCount;
      
      console.log(`✅ ${totalDeleted} articles supprimés définitivement`);
    } else {
      console.log('⏭️ Nettoyage de la corbeille désactivé');
    }
    
    // Log du résumé
    await logger.info(
      LOG_TYPES.SYSTEM_MAINTENANCE,
      'Archivage automatique terminé',
      {
        articlesArchived: totalArchived,
        articlesDeleted: totalDeleted,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('✨ Archivage automatique terminé avec succès');
    console.log(`📊 Résumé: ${totalArchived} archivés, ${totalDeleted} supprimés`);
    
    return {
      success: true,
      articlesArchived: totalArchived,
      articlesDeleted: totalDeleted
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'archivage automatique:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur archivage automatique',
      {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    );
    
    throw error;
  }
}

/**
 * Fonction pour générer un rapport d'archivage
 */
async function generateArchiveReport() {
  try {
    console.log('📋 Génération du rapport d\'archivage...');
    
    const stats = await NewsArchiveService.getArchiveStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      totalArticles: stats.totalArticles,
      publishedArticles: stats.publishedArticles,
      archivedArticles: stats.archivedArticles,
      deletedArticles: stats.deletedArticles,
      archiveRate: ((stats.archivedArticles / stats.totalArticles) * 100).toFixed(2),
      oldestArchived: stats.oldestArchived,
      newestArchived: stats.newestArchived,
      config: ARCHIVE_CONFIG
    };
    
    console.log('📊 Rapport d\'archivage:');
    console.log(`   Total articles: ${report.totalArticles}`);
    console.log(`   Articles publiés: ${report.publishedArticles}`);
    console.log(`   Articles archivés: ${report.archivedArticles} (${report.archiveRate}%)`);
    console.log(`   Articles supprimés: ${report.deletedArticles}`);
    
    await logger.info(
      LOG_TYPES.SYSTEM_INFO,
      'Rapport d\'archivage généré',
      report
    );
    
    return report;
    
  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
    throw error;
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Démarrage du processus d\'archivage automatique');
    console.log(`⏰ ${new Date().toLocaleString('fr-FR')}`);
    
    // Vérifier la configuration
    if (!ARCHIVE_CONFIG.ENABLE_AUTO_ARCHIVE && !ARCHIVE_CONFIG.ENABLE_TRASH_CLEANUP) {
      console.log('⚠️ Aucune tâche d\'archivage activée');
      return;
    }
    
    // Exécuter l'archivage
    const result = await runAutoArchive();
    
    // Générer le rapport
    await generateArchiveReport();
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Processus terminé en ${duration}ms`);
    
    // Sortie propre
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runAutoArchive, generateArchiveReport, ARCHIVE_CONFIG };