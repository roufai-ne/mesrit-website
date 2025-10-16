// src/lib/twoFactorAuth.js - Système d'authentification à deux facteurs
import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Gestionnaire d'authentification à deux facteurs (2FA)
 */
class TwoFactorAuth {
  static APP_NAME = 'MESRIT Niger';
  static ISSUER = 'mesrit.ne';
  
  /**
   * Générer un secret 2FA pour un utilisateur
   */
  static generateSecret(username) {
    const secret = authenticator.generateSecret();
    
    return {
      secret,
      keyuri: authenticator.keyuri(username, this.ISSUER, secret),
      manual_entry_key: secret,
      qr_code_ascii: secret,
      google_auth_qr: authenticator.keyuri(username, this.ISSUER, secret)
    };
  }
  
  /**
   * Générer un QR code pour l'activation 2FA
   */
  static async generateQRCode(username, secret) {
    try {
      const keyuri = authenticator.keyuri(username, this.ISSUER, secret);
      const qrCodeDataURL = await QRCode.toDataURL(keyuri, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return {
        qrCode: qrCodeDataURL,
        keyuri,
        manualEntryKey: secret
      };
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      throw new Error('Impossible de générer le QR code');
    }
  }
  
  /**
   * Vérifier un token 2FA
   */
  static verifyToken(token, secret, window = 1) {
    try {
      // Nettoyer le token (supprimer espaces, tirets, etc.)
      const cleanToken = token.replace(/\s|-/g, '');
      
      // Vérifier que le token fait 6 chiffres
      if (!/^\d{6}$/.test(cleanToken)) {
        return false;
      }
      
      // Vérifier le token avec une fenêtre de tolérance
      return authenticator.verify({
        token: cleanToken,
        secret: secret,
        window: window // Permet une tolérance de ±30 secondes par défaut
      });
    } catch (error) {
      console.error('Erreur vérification token 2FA:', error);
      return false;
    }
  }
  
  /**
   * Activer le 2FA pour un utilisateur
   */
  static async enable2FA(userId, secret, verificationToken) {
    try {
      // Vérifier d'abord le token de vérification
      if (!this.verifyToken(verificationToken, secret)) {
        throw new Error('Token de vérification invalide');
      }
      
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      // Mettre à jour l'utilisateur
      const result = await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorActivatedAt: new Date(),
            twoFactorBackupCodes: this.generateBackupCodes()
          }
        }
      );
      
      await client.close();
      
      if (result.matchedCount === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Logger l'activation
      await logger.success(
        LOG_TYPES.USER_UPDATED,
        `2FA activé pour l'utilisateur ${userId}`,
        { userId, activatedAt: new Date().toISOString() }
      );
      
      return {
        success: true,
        message: '2FA activé avec succès',
        backupCodes: await this.getBackupCodes(userId)
      };
    } catch (error) {
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur activation 2FA pour ${userId}: ${error.message}`,
        { userId, error: error.stack }
      );
      
      throw error;
    }
  }
  
  /**
   * Désactiver le 2FA pour un utilisateur
   */
  static async disable2FA(userId, currentPassword, verificationToken = null) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      // Récupérer l'utilisateur
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Vérifier le mot de passe actuel
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
      }
      
      // Si 2FA est activé, vérifier le token
      if (user.twoFactorEnabled && verificationToken) {
        if (!this.verifyToken(verificationToken, user.twoFactorSecret)) {
          throw new Error('Token 2FA invalide');
        }
      }
      
      // Désactiver le 2FA
      const result = await usersCollection.updateOne(
        { _id: userId },
        {
          $unset: {
            twoFactorSecret: '',
            twoFactorBackupCodes: ''
          },
          $set: {
            twoFactorEnabled: false,
            twoFactorDisabledAt: new Date()
          }
        }
      );
      
      await client.close();
      
      // Logger la désactivation
      await logger.warning(
        LOG_TYPES.USER_UPDATED,
        `2FA désactivé pour l'utilisateur ${userId}`,
        { userId, disabledAt: new Date().toISOString() }
      );
      
      return {
        success: true,
        message: '2FA désactivé avec succès'
      };
    } catch (error) {
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur désactivation 2FA pour ${userId}: ${error.message}`,
        { userId, error: error.stack }
      );
      
      throw error;
    }
  }
  
  /**
   * Générer des codes de sauvegarde
   */
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Générer un code de 8 caractères alphanumériques
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  
  /**
   * Vérifier un code de sauvegarde
   */
  static async verifyBackupCode(userId, backupCode) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne({ _id: userId });
      if (!user || !user.twoFactorBackupCodes) {
        await client.close();
        return false;
      }
      
      const cleanCode = backupCode.replace(/\s|-/g, '').toUpperCase();
      const codeIndex = user.twoFactorBackupCodes.indexOf(cleanCode);
      
      if (codeIndex === -1) {
        await client.close();
        return false;
      }
      
      // Supprimer le code utilisé
      const updatedCodes = user.twoFactorBackupCodes.filter((_, index) => index !== codeIndex);
      
      await usersCollection.updateOne(
        { _id: userId },
        { $set: { twoFactorBackupCodes: updatedCodes } }
      );
      
      await client.close();
      
      // Logger l'utilisation du code de sauvegarde
      await logger.warning(
        LOG_TYPES.LOGIN,
        `Code de sauvegarde 2FA utilisé par ${userId}`,
        { userId, remainingCodes: updatedCodes.length }
      );
      
      return true;
    } catch (error) {
      console.error('Erreur vérification code de sauvegarde:', error);
      return false;
    }
  }
  
  /**
   * Obtenir les codes de sauvegarde d'un utilisateur
   */
  static async getBackupCodes(userId) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne(
        { _id: userId },
        { projection: { twoFactorBackupCodes: 1 } }
      );
      
      await client.close();
      
      return user?.twoFactorBackupCodes || [];
    } catch (error) {
      console.error('Erreur récupération codes de sauvegarde:', error);
      return [];
    }
  }
  
  /**
   * Régénérer les codes de sauvegarde
   */
  static async regenerateBackupCodes(userId, currentPassword, verificationToken) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Vérifier le mot de passe
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
      }
      
      // Vérifier le token 2FA
      if (!this.verifyToken(verificationToken, user.twoFactorSecret)) {
        throw new Error('Token 2FA invalide');
      }
      
      // Générer de nouveaux codes
      const newBackupCodes = this.generateBackupCodes();
      
      await usersCollection.updateOne(
        { _id: userId },
        { $set: { twoFactorBackupCodes: newBackupCodes } }
      );
      
      await client.close();
      
      // Logger la régénération
      await logger.info(
        LOG_TYPES.USER_UPDATED,
        `Codes de sauvegarde 2FA régénérés pour ${userId}`,
        { userId, codesCount: newBackupCodes.length }
      );
      
      return {
        success: true,
        backupCodes: newBackupCodes
      };
    } catch (error) {
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur régénération codes sauvegarde pour ${userId}: ${error.message}`,
        { userId, error: error.stack }
      );
      
      throw error;
    }
  }
  
  /**
   * Obtenir le statut 2FA d'un utilisateur
   */
  static async get2FAStatus(userId) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne(
        { _id: userId },
        { 
          projection: { 
            twoFactorEnabled: 1,
            twoFactorActivatedAt: 1,
            twoFactorBackupCodes: 1
          } 
        }
      );
      
      await client.close();
      
      if (!user) {
        return {
          enabled: false,
          activatedAt: null,
          backupCodesCount: 0
        };
      }
      
      return {
        enabled: user.twoFactorEnabled || false,
        activatedAt: user.twoFactorActivatedAt,
        backupCodesCount: user.twoFactorBackupCodes?.length || 0
      };
    } catch (error) {
      console.error('Erreur récupération statut 2FA:', error);
      return {
        enabled: false,
        activatedAt: null,
        backupCodesCount: 0
      };
    }
  }
  
  /**
   * Middleware pour vérifier le 2FA lors de la connexion
   */
  static async verify2FAForLogin(userId, token, useBackupCode = false) {
    try {
      await connectDB();
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne({ _id: userId });
      await client.close();
      
      if (!user || !user.twoFactorEnabled) {
        return { success: true, required: false };
      }
      
      if (!token) {
        return { 
          success: false, 
          required: true, 
          message: 'Token 2FA requis' 
        };
      }
      
      let isValid = false;
      
      if (useBackupCode) {
        isValid = await this.verifyBackupCode(userId, token);
        if (isValid) {
          await logger.warning(
            LOG_TYPES.LOGIN,
            `Connexion avec code de sauvegarde 2FA pour ${userId}`,
            { userId }
          );
        }
      } else {
        isValid = this.verifyToken(token, user.twoFactorSecret);
        if (isValid) {
          await logger.success(
            LOG_TYPES.LOGIN,
            `Connexion avec 2FA réussie pour ${userId}`,
            { userId }
          );
        }
      }
      
      if (!isValid) {
        await logger.warning(
          LOG_TYPES.LOGIN_FAILED,
          `Échec vérification 2FA pour ${userId}`,
          { userId, useBackupCode }
        );
      }
      
      return {
        success: isValid,
        required: true,
        message: isValid ? 'Token 2FA valide' : 'Token 2FA invalide'
      };
    } catch (error) {
      console.error('Erreur vérification 2FA login:', error);
      return {
        success: false,
        required: true,
        message: 'Erreur lors de la vérification 2FA'
      };
    }
  }
}

export default TwoFactorAuth;

// Utilitaires d'export
export const generateSecret = TwoFactorAuth.generateSecret.bind(TwoFactorAuth);
export const generateQRCode = TwoFactorAuth.generateQRCode.bind(TwoFactorAuth);
export const verifyToken = TwoFactorAuth.verifyToken.bind(TwoFactorAuth);
export const verify2FAForLogin = TwoFactorAuth.verify2FAForLogin.bind(TwoFactorAuth);