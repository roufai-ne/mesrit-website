// src/lib/anomalyDetection.js - Système de détection d'anomalies
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Système de détection d'anomalies comportementales
 */
class AnomalyDetection {
  // Seuils de détection
  static THRESHOLDS = {
    // Connexions
    MAX_FAILED_LOGINS_PER_HOUR: 5,
    MAX_FAILED_LOGINS_PER_DAY: 20,
    UNUSUAL_LOGIN_TIME_HOURS: [0, 1, 2, 3, 4, 5], // 00h-05h
    
    // Activité
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,
    UNUSUAL_ENDPOINT_ACCESS_COUNT: 10, // Accès à des endpoints inhabituels
    
    // Géolocalisation (simulation)
    MAX_DISTANCE_KM: 1000, // Distance max entre deux connexions
    MIN_TIME_BETWEEN_DISTANT_LOGINS: 3600, // 1 heure
    
    // Comportement
    RAPID_PERMISSION_CHANGES: 5, // Changements de permissions rapides
    BULK_DATA_ACCESS_THRESHOLD: 100, // Accès à beaucoup de données
    
    // Scores de risque
    LOW_RISK_THRESHOLD: 30,
    MEDIUM_RISK_THRESHOLD: 60,
    HIGH_RISK_THRESHOLD: 80
  };
  
  /**
   * Analyser une tentative de connexion
   */
  static async analyzeLoginAttempt(userId, ip, userAgent, success, metadata = {}) {
    try {
      const anomalies = [];
      let riskScore = 0;
      
      // Analyser les tentatives de connexion échouées
      const failedLoginAnomaly = await this.checkFailedLogins(userId, ip);
      if (failedLoginAnomaly.isAnomalous) {
        anomalies.push(failedLoginAnomaly);
        riskScore += failedLoginAnomaly.riskScore;
      }
      
      // Analyser l'heure de connexion
      const timeAnomaly = this.checkUnusualLoginTime();
      if (timeAnomaly.isAnomalous) {
        anomalies.push(timeAnomaly);
        riskScore += timeAnomaly.riskScore;
      }
      
      // Analyser la géolocalisation (simulation)
      const locationAnomaly = await this.checkUnusualLocation(userId, ip);
      if (locationAnomaly.isAnomalous) {
        anomalies.push(locationAnomaly);
        riskScore += locationAnomaly.riskScore;
      }
      
      // Analyser le User-Agent
      const deviceAnomaly = await this.checkUnusualDevice(userId, userAgent);
      if (deviceAnomaly.isAnomalous) {
        anomalies.push(deviceAnomaly);
        riskScore += deviceAnomaly.riskScore;
      }
      
      // Déterminer le niveau de risque
      const riskLevel = this.calculateRiskLevel(riskScore);
      
      // Enregistrer l'analyse
      await this.recordAnalysis({
        type: 'login_attempt',
        userId,
        ip,
        userAgent,
        success,
        anomalies,
        riskScore,
        riskLevel,
        metadata,
        timestamp: new Date()
      });
      
      // Logger si risque élevé
      if (riskLevel === 'HIGH') {
        await logger.warning(
          LOG_TYPES.SUSPICIOUS_ACTIVITY,
          `Tentative de connexion à haut risque détectée`,
          {
            userId,
            ip,
            riskScore,
            anomalies: anomalies.map(a => a.type),
            success
          }
        );
      }
      
      return {
        isAnomalous: anomalies.length > 0,
        riskScore,
        riskLevel,
        anomalies,
        shouldBlock: riskLevel === 'HIGH' && !success,
        shouldRequire2FA: riskLevel === 'MEDIUM' || riskLevel === 'HIGH'
      };
    } catch (error) {
      console.error('Erreur analyse anomalie connexion:', error);
      return {
        isAnomalous: false,
        riskScore: 0,
        riskLevel: 'LOW',
        anomalies: [],
        shouldBlock: false,
        shouldRequire2FA: false
      };
    }
  }
  
  /**
   * Analyser l'activité d'un utilisateur
   */
  static async analyzeUserActivity(userId, action, endpoint, metadata = {}) {
    try {
      const anomalies = [];
      let riskScore = 0;
      
      // Analyser la fréquence des requêtes
      const frequencyAnomaly = await this.checkRequestFrequency(userId, endpoint);
      if (frequencyAnomaly.isAnomalous) {
        anomalies.push(frequencyAnomaly);
        riskScore += frequencyAnomaly.riskScore;
      }
      
      // Analyser l'accès à des endpoints inhabituels
      const endpointAnomaly = await this.checkUnusualEndpointAccess(userId, endpoint);
      if (endpointAnomaly.isAnomalous) {
        anomalies.push(endpointAnomaly);
        riskScore += endpointAnomaly.riskScore;
      }
      
      // Analyser les changements de permissions
      if (action.includes('permission') || action.includes('role')) {
        const permissionAnomaly = await this.checkRapidPermissionChanges(userId);
        if (permissionAnomaly.isAnomalous) {
          anomalies.push(permissionAnomaly);
          riskScore += permissionAnomaly.riskScore;
        }
      }
      
      // Analyser l'accès massif aux données
      const dataAccessAnomaly = await this.checkBulkDataAccess(userId, action, metadata);
      if (dataAccessAnomaly.isAnomalous) {
        anomalies.push(dataAccessAnomaly);
        riskScore += dataAccessAnomaly.riskScore;
      }
      
      const riskLevel = this.calculateRiskLevel(riskScore);
      
      // Enregistrer l'analyse
      await this.recordAnalysis({
        type: 'user_activity',
        userId,
        action,
        endpoint,
        anomalies,
        riskScore,
        riskLevel,
        metadata,
        timestamp: new Date()
      });
      
      // Logger si risque élevé
      if (riskLevel === 'HIGH') {
        await logger.warning(
          LOG_TYPES.SUSPICIOUS_ACTIVITY,
          `Activité utilisateur à haut risque détectée`,
          {
            userId,
            action,
            endpoint,
            riskScore,
            anomalies: anomalies.map(a => a.type)
          }
        );
      }
      
      return {
        isAnomalous: anomalies.length > 0,
        riskScore,
        riskLevel,
        anomalies,
        shouldAlert: riskLevel === 'HIGH',
        shouldThrottle: riskLevel === 'MEDIUM' || riskLevel === 'HIGH'
      };
    } catch (error) {
      console.error('Erreur analyse anomalie activité:', error);
      return {
        isAnomalous: false,
        riskScore: 0,
        riskLevel: 'LOW',
        anomalies: [],
        shouldAlert: false,
        shouldThrottle: false
      };
    }
  }
  
  /**
   * Vérifier les tentatives de connexion échouées
   */
  static async checkFailedLogins(userId, ip) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Compter les échecs par heure
      const failedLoginsHour = await collection.countDocuments({
        type: LOG_TYPES.LOGIN_FAILED,
        timestamp: { $gte: oneHourAgo },
        $or: [
          { userId },
          { ip }
        ]
      });
      
      // Compter les échecs par jour
      const failedLoginsDay = await collection.countDocuments({
        type: LOG_TYPES.LOGIN_FAILED,
        timestamp: { $gte: oneDayAgo },
        $or: [
          { userId },
          { ip }
        ]
      });
      
      await client.close();
      
      const isAnomalous = failedLoginsHour > this.THRESHOLDS.MAX_FAILED_LOGINS_PER_HOUR ||
                         failedLoginsDay > this.THRESHOLDS.MAX_FAILED_LOGINS_PER_DAY;
      
      return {
        type: 'failed_logins',
        isAnomalous,
        riskScore: isAnomalous ? Math.min(failedLoginsHour * 5 + failedLoginsDay * 2, 50) : 0,
        details: {
          failedLoginsHour,
          failedLoginsDay,
          thresholdHour: this.THRESHOLDS.MAX_FAILED_LOGINS_PER_HOUR,
          thresholdDay: this.THRESHOLDS.MAX_FAILED_LOGINS_PER_DAY
        }
      };
    } catch (error) {
      console.error('Erreur vérification échecs connexion:', error);
      return { type: 'failed_logins', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier l'heure de connexion inhabituelle
   */
  static checkUnusualLoginTime() {
    const currentHour = new Date().getHours();
    const isUnusual = this.THRESHOLDS.UNUSUAL_LOGIN_TIME_HOURS.includes(currentHour);
    
    return {
      type: 'unusual_time',
      isAnomalous: isUnusual,
      riskScore: isUnusual ? 15 : 0,
      details: {
        currentHour,
        unusualHours: this.THRESHOLDS.UNUSUAL_LOGIN_TIME_HOURS
      }
    };
  }
  
  /**
   * Vérifier la localisation inhabituelle (simulation)
   */
  static async checkUnusualLocation(userId, ip) {
    try {
      // Simulation de géolocalisation basée sur l'IP
      const currentLocation = this.simulateGeolocation(ip);
      
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      // Récupérer les dernières connexions
      const recentLogins = await collection.find({
        type: LOG_TYPES.LOGIN,
        userId,
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: -1 }).limit(10).toArray();
      
      await client.close();
      
      let isAnomalous = false;
      let maxDistance = 0;
      
      for (const login of recentLogins) {
        if (login.ip && login.ip !== ip) {
          const previousLocation = this.simulateGeolocation(login.ip);
          const distance = this.calculateDistance(currentLocation, previousLocation);
          const timeDiff = (Date.now() - new Date(login.timestamp).getTime()) / 1000;
          
          if (distance > this.THRESHOLDS.MAX_DISTANCE_KM && 
              timeDiff < this.THRESHOLDS.MIN_TIME_BETWEEN_DISTANT_LOGINS) {
            isAnomalous = true;
            maxDistance = Math.max(maxDistance, distance);
          }
        }
      }
      
      return {
        type: 'unusual_location',
        isAnomalous,
        riskScore: isAnomalous ? Math.min(maxDistance / 100, 40) : 0,
        details: {
          currentLocation,
          maxDistance,
          threshold: this.THRESHOLDS.MAX_DISTANCE_KM
        }
      };
    } catch (error) {
      console.error('Erreur vérification localisation:', error);
      return { type: 'unusual_location', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier l'appareil inhabituel
   */
  static async checkUnusualDevice(userId, userAgent) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      // Vérifier si ce User-Agent a déjà été utilisé
      const existingLogin = await collection.findOne({
        type: LOG_TYPES.LOGIN,
        userId,
        userAgent,
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      
      await client.close();
      
      const isNewDevice = !existingLogin;
      
      return {
        type: 'unusual_device',
        isAnomalous: isNewDevice,
        riskScore: isNewDevice ? 20 : 0,
        details: {
          userAgent,
          isNewDevice
        }
      };
    } catch (error) {
      console.error('Erreur vérification appareil:', error);
      return { type: 'unusual_device', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier la fréquence des requêtes
   */
  static async checkRequestFrequency(userId, endpoint) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const requestsPerMinute = await collection.countDocuments({
        userId,
        timestamp: { $gte: oneMinuteAgo }
      });
      
      const requestsPerHour = await collection.countDocuments({
        userId,
        timestamp: { $gte: oneHourAgo }
      });
      
      await client.close();
      
      const isAnomalous = requestsPerMinute > this.THRESHOLDS.MAX_REQUESTS_PER_MINUTE ||
                         requestsPerHour > this.THRESHOLDS.MAX_REQUESTS_PER_HOUR;
      
      return {
        type: 'high_frequency',
        isAnomalous,
        riskScore: isAnomalous ? Math.min(requestsPerMinute * 2 + requestsPerHour / 10, 30) : 0,
        details: {
          requestsPerMinute,
          requestsPerHour,
          thresholdMinute: this.THRESHOLDS.MAX_REQUESTS_PER_MINUTE,
          thresholdHour: this.THRESHOLDS.MAX_REQUESTS_PER_HOUR
        }
      };
    } catch (error) {
      console.error('Erreur vérification fréquence:', error);
      return { type: 'high_frequency', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier l'accès à des endpoints inhabituels
   */
  static async checkUnusualEndpointAccess(userId, endpoint) {
    // Simulation - à adapter selon vos endpoints
    const adminEndpoints = ['/api/admin', '/api/users', '/api/system'];
    const isAdminEndpoint = adminEndpoints.some(ep => endpoint.startsWith(ep));
    
    if (!isAdminEndpoint) {
      return { type: 'unusual_endpoint', isAnomalous: false, riskScore: 0 };
    }
    
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      // Vérifier l'historique d'accès à ce type d'endpoint
      const recentAccess = await collection.countDocuments({
        userId,
        'details.endpoint': { $regex: endpoint.split('/')[2] },
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      await client.close();
      
      const isUnusual = recentAccess === 0; // Premier accès à ce type d'endpoint
      
      return {
        type: 'unusual_endpoint',
        isAnomalous: isUnusual,
        riskScore: isUnusual ? 25 : 0,
        details: {
          endpoint,
          recentAccess,
          isAdminEndpoint
        }
      };
    } catch (error) {
      console.error('Erreur vérification endpoint:', error);
      return { type: 'unusual_endpoint', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier les changements rapides de permissions
   */
  static async checkRapidPermissionChanges(userId) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('system_logs');
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const permissionChanges = await collection.countDocuments({
        userId,
        type: { $in: [LOG_TYPES.ROLE_CHANGED, LOG_TYPES.USER_UPDATED] },
        timestamp: { $gte: oneHourAgo }
      });
      
      await client.close();
      
      const isAnomalous = permissionChanges > this.THRESHOLDS.RAPID_PERMISSION_CHANGES;
      
      return {
        type: 'rapid_permission_changes',
        isAnomalous,
        riskScore: isAnomalous ? permissionChanges * 8 : 0,
        details: {
          permissionChanges,
          threshold: this.THRESHOLDS.RAPID_PERMISSION_CHANGES
        }
      };
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return { type: 'rapid_permission_changes', isAnomalous: false, riskScore: 0 };
    }
  }
  
  /**
   * Vérifier l'accès massif aux données
   */
  static async checkBulkDataAccess(userId, action, metadata) {
    const bulkActions = ['export', 'download', 'bulk', 'mass'];
    const isBulkAction = bulkActions.some(bulk => action.toLowerCase().includes(bulk));
    
    if (!isBulkAction) {
      return { type: 'bulk_data_access', isAnomalous: false, riskScore: 0 };
    }
    
    const dataCount = metadata.count || metadata.records || metadata.items || 0;
    const isAnomalous = dataCount > this.THRESHOLDS.BULK_DATA_ACCESS_THRESHOLD;
    
    return {
      type: 'bulk_data_access',
      isAnomalous,
      riskScore: isAnomalous ? Math.min(dataCount / 10, 35) : 0,
      details: {
        action,
        dataCount,
        threshold: this.THRESHOLDS.BULK_DATA_ACCESS_THRESHOLD
      }
    };
  }
  
  /**
   * Calculer le niveau de risque
   */
  static calculateRiskLevel(riskScore) {
    if (riskScore >= this.THRESHOLDS.HIGH_RISK_THRESHOLD) return 'HIGH';
    if (riskScore >= this.THRESHOLDS.MEDIUM_RISK_THRESHOLD) return 'MEDIUM';
    if (riskScore >= this.THRESHOLDS.LOW_RISK_THRESHOLD) return 'LOW';
    return 'MINIMAL';
  }
  
  /**
   * Enregistrer une analyse d'anomalie
   */
  static async recordAnalysis(analysis) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('anomaly_analyses');
      
      await collection.insertOne(analysis);
      await client.close();
    } catch (error) {
      console.error('Erreur enregistrement analyse:', error);
    }
  }
  
  /**
   * Obtenir les statistiques d'anomalies
   */
  static async getAnomalyStats(timeRange = 24 * 60 * 60 * 1000) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('anomaly_analyses');
      
      const since = new Date(Date.now() - timeRange);
      
      const stats = await collection.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: '$riskLevel',
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$riskScore' }
          }
        }
      ]).toArray();
      
      const topAnomalies = await collection.aggregate([
        { $match: { timestamp: { $gte: since }, isAnomalous: true } },
        { $unwind: '$anomalies' },
        {
          $group: {
            _id: '$anomalies.type',
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$anomalies.riskScore' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      await client.close();
      
      return {
        timeRange,
        riskLevelStats: stats,
        topAnomalies,
        totalAnalyses: stats.reduce((sum, stat) => sum + stat.count, 0)
      };
    } catch (error) {
      console.error('Erreur statistiques anomalies:', error);
      return {
        timeRange,
        riskLevelStats: [],
        topAnomalies: [],
        totalAnalyses: 0
      };
    }
  }
  
  /**
   * Simuler la géolocalisation (à remplacer par un vrai service)
   */
  static async simulateGeolocation(ip) {
    // Simulation basique - à remplacer par un vrai service de géolocalisation
    const crypto = await import('crypto');
    const hash = crypto.createHash('md5').update(ip).digest('hex');
    const lat = (parseInt(hash.substr(0, 8), 16) % 180) - 90;
    const lng = (parseInt(hash.substr(8, 8), 16) % 360) - 180;
    
    return { lat, lng, ip };
  }
  
  /**
   * Calculer la distance entre deux points
   */
  static calculateDistance(point1, point2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default AnomalyDetection;

// Utilitaires d'export
export const analyzeLoginAttempt = AnomalyDetection.analyzeLoginAttempt.bind(AnomalyDetection);
export const analyzeUserActivity = AnomalyDetection.analyzeUserActivity.bind(AnomalyDetection);
export const getAnomalyStats = AnomalyDetection.getAnomalyStats.bind(AnomalyDetection);