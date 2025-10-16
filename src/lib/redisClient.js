// src/lib/redisClient.js
import Redis from 'ioredis';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return this.client;

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Configuration de sécurité
        password: process.env.REDIS_PASSWORD,
        tls: process.env.NODE_ENV === 'production' ? {} : null,
        // Timeouts
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connecté');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Erreur Redis:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Connexion Redis fermée');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Impossible de se connecter à Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  getClient() {
    if (!this.isConnected) {
      throw new Error('Redis client not connected. Call connect() first.');
    }
    return this.client;
  }
}

const redisClient = new RedisClient();
export default redisClient;