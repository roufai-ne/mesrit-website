// src/lib/secretRotation.js - Système de rotation automatique des secrets
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';
import { SecretsValidator } from '@/lib/secretsValidator';

/**
 * Gestionnaire de rotation des secrets
 */
class SecretRotation {
  static ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000; // 90 jours en millisecondes
  static GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 jours de grâce
  
  /**
   * Vérifier si les secrets doivent être rotés
   */
  static async checkRotationNeeded() {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('secret_metadata');
      
      // Récupérer les métadonnées des secrets actuels
      const metadata = await collection.findOne({ type: 'current_secrets' });
      
      await client.close();
      
      if (!metadata) {
        // Première fois, créer les métadonnées
        await this.initializeSecretMetadata();
        return false;
      }
      
      const now = Date.now();
      const lastRotation = metadata.lastRotation || metadata.createdAt;
      const timeSinceRotation = now - lastRotation;
      
      return {
        needsRotation: timeSinceRotation > this.ROTATION_INTERVAL,
        timeSinceRotation,
        daysUntilRotation: Math.max(0, Math.ceil((this.ROTATION_INTERVAL - timeSinceRotation) / (24 * 60 * 60 * 1000))),
        isInGracePeriod: timeSinceRotation > this.ROTATION_INTERVAL && timeSinceRotation < (this.ROTATION_INTERVAL + this.GRACE_PERIOD)
      };
    } catch (error) {
      console.error('Erreur vérification rotation:', error);
      return { needsRotation: false, error: error.message };
    }
  }
  
  /**
   * Initialiser les métadonnées des secrets
   */
  static async initializeSecretMetadata() {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('secret_metadata');
      
      const metadata = {
        type: 'current_secrets',
        createdAt: Date.now(),
        lastRotation: null,
        version: 1,
        secrets: {
          JWT_SECRET: {
            created: Date.now(),
            rotated: null,
            version: 1
          },
          REFRESH_SECRET: {
            created: Date.now(),
            rotated: null,
            version: 1
          },
          API_KEY: {
            created: Date.now(),
            rotated: null,
            version: 1
          },
          COOKIE_SECRET: {
            created: Date.now(),
            rotated: null,
            version: 1
          }
        }
      };
      
      await collection.insertOne(metadata);
      await client.close();
      
      await logger.info(
        LOG_TYPES.SYSTEM_STARTUP,
        'Métadonnées des secrets initialisées'
      );
      
      return metadata;
    } catch (error) {
      console.error('Erreur initialisation métadonnées:', error);
      throw error;
    }
  }
  
  /**
   * Générer de nouveaux secrets
   */
  static generateNewSecrets() {
    return {
      JWT_SECRET: crypto.randomBytes(64).toString('hex'),
      REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
      API_KEY: crypto.randomBytes(32).toString('base64url'),
      COOKIE_SECRET: crypto.randomBytes(32).toString('hex')
    };
  }
  
  /**
   * Effectuer la rotation des secrets
   */
  static async rotateSecrets(force = false) {
    try {
      const rotationCheck = await this.checkRotationNeeded();
      
      if (!force && !rotationCheck.needsRotation) {
        return {
          success: false,
          message: `Rotation non nécessaire. Prochaine rotation dans ${rotationCheck.daysUntilRotation} jours.`,
          daysUntilRotation: rotationCheck.daysUntilRotation
        };
      }
      
      // Générer les nouveaux secrets
      const newSecrets = this.generateNewSecrets();
      
      // Valider les nouveaux secrets
      const tempEnv = { ...process.env, ...newSecrets };
      const originalEnv = process.env;
      process.env = tempEnv;
      
      try {
        SecretsValidator.validateAllSecrets();
      } catch (validationError) {
        process.env = originalEnv;
        throw new Error(`Validation des nouveaux secrets échouée: ${validationError.message}`);
      }
      
      process.env = originalEnv;
      
      // Sauvegarder les anciens secrets (pour la période de grâce)
      await this.backupCurrentSecrets();
      
      // Mettre à jour le fichier .env
      await this.updateEnvFile(newSecrets);
      
      // Mettre à jour les métadonnées
      await this.updateSecretMetadata(newSecrets);
      
      // Logger la rotation
      await logger.success(
        LOG_TYPES.SYSTEM_STARTUP,
        'Rotation des secrets effectuée avec succès',
        {
          rotatedSecrets: Object.keys(newSecrets),
          forced: force,
          timestamp: new Date().toISOString()
        }
      );
      
      return {
        success: true,
        message: 'Rotation des secrets effectuée avec succès',
        rotatedSecrets: Object.keys(newSecrets),
        nextRotation: new Date(Date.now() + this.ROTATION_INTERVAL).toISOString()
      };
    } catch (error) {
      await logger.error(
        LOG_TYPES.SYSTEM_STARTUP,
        `Erreur lors de la rotation des secrets: ${error.message}`,
        { error: error.stack }
      );
      
      return {
        success: false,
        message: `Erreur lors de la rotation: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Sauvegarder les secrets actuels
   */
  static async backupCurrentSecrets() {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('secret_backups');
      
      const backup = {
        type: 'secret_backup',
        createdAt: Date.now(),
        secrets: {
          JWT_SECRET: process.env.JWT_SECRET,
          REFRESH_SECRET: process.env.REFRESH_SECRET,
          API_KEY: process.env.API_KEY,
          COOKIE_SECRET: process.env.COOKIE_SECRET
        },
        expiresAt: Date.now() + this.GRACE_PERIOD
      };
      
      await collection.insertOne(backup);
      
      // Nettoyer les anciens backups
      await collection.deleteMany({
        expiresAt: { $lt: Date.now() }
      });
      
      await client.close();
    } catch (error) {
      console.error('Erreur sauvegarde secrets:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour le fichier .env
   */
  static async updateEnvFile(newSecrets) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      
      // Lire le fichier .env actuel
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf8');
      } catch (error) {
        // Fichier n'existe pas, créer un nouveau
        envContent = '';
      }
      
      // Mettre à jour chaque secret
      Object.entries(newSecrets).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}=${value}`;
        
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, newLine);
        } else {
          envContent += `\n${newLine}`;
        }
      });
      
      // Sauvegarder le fichier
      await fs.writeFile(envPath, envContent.trim() + '\n');
      
      // Créer une sauvegarde avec timestamp
      const backupPath = path.join(process.cwd(), `.env.backup.${Date.now()}`);
      await fs.writeFile(backupPath, envContent);
      
    } catch (error) {
      console.error('Erreur mise à jour .env:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour les métadonnées des secrets
   */
  static async updateSecretMetadata(newSecrets) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('secret_metadata');
      
      const now = Date.now();
      const secretsMetadata = {};
      
      Object.keys(newSecrets).forEach(key => {
        secretsMetadata[key] = {
          created: now,
          rotated: now,
          version: 1 // Incrémenter si on garde l'historique
        };
      });
      
      await collection.updateOne(
        { type: 'current_secrets' },
        {
          $set: {
            lastRotation: now,
            secrets: secretsMetadata
          },
          $inc: { version: 1 }
        },
        { upsert: true }
      );
      
      await client.close();
    } catch (error) {
      console.error('Erreur mise à jour métadonnées:', error);
      throw error;
    }
  }
  
  /**
   * Obtenir le statut de rotation
   */
  static async getRotationStatus() {
    try {
      const rotationCheck = await this.checkRotationNeeded();
      
      return {
        ...rotationCheck,
        rotationInterval: this.ROTATION_INTERVAL,
        gracePeriod: this.GRACE_PERIOD,
        nextRotationDate: new Date(Date.now() + (rotationCheck.daysUntilRotation * 24 * 60 * 60 * 1000)).toISOString()
      };
    } catch (error) {
      return {
        error: error.message,
        needsRotation: false
      };
    }
  }
  
  /**
   * Planifier la rotation automatique
   */
  static scheduleRotation() {
    // Vérifier toutes les 24 heures
    setInterval(async () => {
      try {
        const status = await this.getRotationStatus();
        
        if (status.needsRotation) {
          await logger.warning(
            LOG_TYPES.SYSTEM_STARTUP,
            'Rotation des secrets nécessaire',
            status
          );
          
          // En production, on pourrait déclencher la rotation automatiquement
          // ou envoyer une notification aux administrateurs
          if (process.env.AUTO_ROTATE_SECRETS === 'true') {
            await this.rotateSecrets();
          }
        }
      } catch (error) {
        console.error('Erreur vérification rotation planifiée:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
  }
  
  /**
   * Nettoyer les anciens backups
   */
  static async cleanupOldBackups() {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection('secret_backups');
      
      const result = await collection.deleteMany({
        expiresAt: { $lt: Date.now() }
      });
      
      await client.close();
      
      if (result.deletedCount > 0) {
        await logger.info(
          LOG_TYPES.SYSTEM_STARTUP,
          `Nettoyage des backups de secrets: ${result.deletedCount} supprimés`
        );
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Erreur nettoyage backups:', error);
      return 0;
    }
  }
}

export default SecretRotation;

// Utilitaires d'export
export const checkRotationNeeded = SecretRotation.checkRotationNeeded.bind(SecretRotation);
export const rotateSecrets = SecretRotation.rotateSecrets.bind(SecretRotation);
export const getRotationStatus = SecretRotation.getRotationStatus.bind(SecretRotation);