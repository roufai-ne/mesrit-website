// src/scripts/initLogCleanup.js
// Script d'initialisation du service de nettoyage des logs
import cleanupService from '@/services/logCleanupService';

/**
 * Initialize the log cleanup service
 */
export async function initLogCleanupService() {
  try {
    console.log('Initializing log cleanup service...');
    await cleanupService.init();
    console.log('Log cleanup service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize log cleanup service:', error);
    // Don't throw error as this shouldn't prevent app startup
  }
}

// Run immediately if called directly
if (require.main === module) {
  initLogCleanupService();
}

export default initLogCleanupService;