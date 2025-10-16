// src/services/logCleanupService.js
// Service de nettoyage automatique des logs avec cron jobs
import cron from 'node-cron';
import { runAutoCleanup } from '@/scripts/autoCleanupLogs';
import logger, { LOG_TYPES } from '@/lib/logger';

class LogCleanupService {
  constructor() {
    this.cronJob = null;
    this.isEnabled = false;
    this.config = {
      schedule: '0 2 * * *', // Run daily at 2 AM
      daysToArchive: 30,
      daysToKeep: 90
    };
  }

  /**
   * Initialize the cleanup service
   */
  async init() {
    try {
      // Load configuration from database or file in production
      await this.loadConfig();
      
      if (this.config.enabled) {
        this.start();
      }
      
      console.log('Log cleanup service initialized');
    } catch (error) {
      console.error('Error initializing log cleanup service:', error);
      await logger.error(
        LOG_TYPES.SYSTEM_STARTUP,
        'Error initializing log cleanup service',
        { error: error.message }
      );
    }
  }

  /**
   * Load configuration (in production, this would load from database)
   */
  async loadConfig() {
    // For now, use default configuration
    // In production, load from database or config file
    this.config = {
      enabled: process.env.LOG_CLEANUP_ENABLED === 'true' || false,
      schedule: process.env.LOG_CLEANUP_SCHEDULE || '0 2 * * *',
      daysToArchive: parseInt(process.env.LOG_DAYS_TO_ARCHIVE) || 30,
      daysToKeep: parseInt(process.env.LOG_DAYS_TO_KEEP) || 90
    };
  }

  /**
   * Start the cron job
   */
  async start() {
    if (this.cronJob) {
      this.stop();
    }

    try {
      this.cronJob = cron.schedule(this.config.schedule, async () => {
        await this.runCleanup();
      });

      this.isEnabled = true;
      
      console.log(`Log cleanup service started with schedule: ${this.config.schedule}`);
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        'Log cleanup service started',
        { schedule: this.config.schedule }
      );
    } catch (error) {
      console.error('Error starting log cleanup service:', error);
      await logger.error(
        LOG_TYPES.SYSTEM_STARTUP,
        'Error starting log cleanup service',
        { error: error.message }
      );
    }
  }

  /**
   * Stop the cron job
   */
  async stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isEnabled = false;
      
      console.log('Log cleanup service stopped');
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        'Log cleanup service stopped'
      );
    }
  }

  /**
   * Run cleanup manually
   */
  async runCleanup() {
    try {
      console.log('Starting automatic log cleanup...');
      
      const result = await runAutoCleanup({
        daysToArchive: this.config.daysToArchive,
        daysToKeep: this.config.daysToKeep
      });

      console.log(`Automatic log cleanup completed: ${result.archived} archived, ${result.deleted} deleted`);
      
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        'Automatic log cleanup completed',
        { ...result }
      );

      return result;
    } catch (error) {
      console.error('Error during automatic log cleanup:', error);
      await logger.error(
        LOG_TYPES.DATABASE_ERROR,
        'Error during automatic log cleanup',
        { error: error.message, stack: error.stack }
      );
      throw error;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cron job if enabled and schedule changed
    if (this.isEnabled && newConfig.schedule) {
      this.start();
    }
    
    // Save configuration in production
    await this.saveConfig();
  }

  /**
   * Save configuration (in production, this would save to database)
   */
  async saveConfig() {
    // For now, just log the config
    console.log('Log cleanup config updated:', this.config);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      schedule: this.config.schedule,
      daysToArchive: this.config.daysToArchive,
      daysToKeep: this.config.daysToKeep,
      nextRun: this.cronJob ? this.cronJob.nextDate() : null
    };
  }
}

// Export singleton instance
const logCleanupService = new LogCleanupService();
export default logCleanupService;