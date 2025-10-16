// src/scripts/autoCleanupLogs.js
// Script d'archivage et de nettoyage automatique des logs
import { connectDB } from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Archive automatiquement les logs plus anciens que le nombre de jours spécifié
 * @param {number} daysToArchive - Nombre de jours après lesquels archiver les logs (par défaut 30)
 */
export async function autoArchiveLogs(daysToArchive = 30) {
  try {
    await connectDB();
    
    const result = await SystemLog.archiveOldLogs(daysToArchive);
    
    if (result.modifiedCount > 0) {
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Archivage automatique des logs: ${result.modifiedCount} logs archivés`,
        { daysToArchive, archivedCount: result.modifiedCount }
      );
      
      console.log(`Archivage automatique: ${result.modifiedCount} logs archivés`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'archivage automatique des logs:', error);
    await logger.error(
      LOG_TYPES.DATABASE_ERROR,
      'Erreur lors de l\'archivage automatique des logs',
      { error: error.message, stack: error.stack }
    );
    throw error;
  }
}

/**
 * Supprime automatiquement les logs archivés plus anciens que le nombre de jours spécifié
 * @param {number} daysToKeep - Nombre de jours à conserver les logs (par défaut 90)
 */
export async function autoDeleteOldLogs(daysToKeep = 90) {
  try {
    await connectDB();
    
    const result = await SystemLog.cleanOldLogs(daysToKeep);
    
    if (result.deletedCount > 0) {
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        `Nettoyage automatique des logs: ${result.deletedCount} logs supprimés`,
        { daysToKeep, deletedCount: result.deletedCount }
      );
      
      console.log(`Nettoyage automatique: ${result.deletedCount} logs supprimés`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors du nettoyage automatique des logs:', error);
    await logger.error(
      LOG_TYPES.DATABASE_ERROR,
      'Erreur lors du nettoyage automatique des logs',
      { error: error.message, stack: error.stack }
    );
    throw error;
  }
}

/**
 * Exécute le processus complet d'archivage et de nettoyage automatique
 * @param {Object} options - Options de nettoyage
 * @param {number} options.daysToArchive - Jours après lesquels archiver (par défaut 30)
 * @param {number} options.daysToKeep - Jours à conserver les logs (par défaut 90)
 */
export async function runAutoCleanup({ daysToArchive = 30, daysToKeep = 90 } = {}) {
  try {
    console.log('Démarrage du nettoyage automatique des logs...');
    
    // Archiver les anciens logs
    const archiveResult = await autoArchiveLogs(daysToArchive);
    
    // Supprimer les très anciens logs
    const deleteResult = await autoDeleteOldLogs(daysToKeep);
    
    await logger.info(
      LOG_TYPES.SYSTEM_STARTUP,
      'Nettoyage automatique des logs terminé',
      {
        daysToArchive,
        daysToKeep,
        archived: archiveResult.modifiedCount,
        deleted: deleteResult.deletedCount
      }
    );
    
    console.log(`Nettoyage automatique terminé: ${archiveResult.modifiedCount} logs archivés, ${deleteResult.deletedCount} logs supprimés`);
    
    return {
      archived: archiveResult.modifiedCount,
      deleted: deleteResult.deletedCount
    };
  } catch (error) {
    console.error('Erreur lors du nettoyage automatique des logs:', error);
    await logger.error(
      LOG_TYPES.DATABASE_ERROR,
      'Erreur lors du nettoyage automatique des logs',
      { error: error.message, stack: error.stack }
    );
    throw error;
  }
}

// Exécuter immédiatement si le script est appelé directement
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parser les arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = parseInt(args[i + 1]);
    
    if (key === 'daysToArchive' || key === 'daysToKeep') {
      options[key] = value;
    }
  }
  
  runAutoCleanup(options)
    .then(() => {
      console.log('Nettoyage automatique terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors du nettoyage automatique:', error);
      process.exit(1);
    });
}

const autoCleanupLogs = {
  autoArchiveLogs,
  autoDeleteOldLogs,
  runAutoCleanup
};

export default autoCleanupLogs;