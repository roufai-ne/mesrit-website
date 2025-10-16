// src/lib/secretsValidator.js
import crypto from 'crypto';

export class SecretsValidator {
  static validateJWTSecret() {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is required in environment variables');
    }
    
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    
    if (secret === 'secret_key_development' || secret.includes('development')) {
      throw new Error('Development secrets are not allowed in production');
    }
    
    return secret;
  }
  
  static validateRefreshSecret() {
    const secret = process.env.REFRESH_SECRET;
    
    if (!secret) {
      throw new Error('REFRESH_SECRET is required in environment variables');
    }
    
    if (secret.length < 32) {
      throw new Error('REFRESH_SECRET must be at least 32 characters long');
    }
    
    if (secret === 'refresh_secret_development' || secret.includes('development')) {
      throw new Error('Development refresh secrets are not allowed in production');
    }
    
    return secret;
  }
  
  static validateAPIKey() {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error('API_KEY is required in environment variables');
    }
    
    if (apiKey.length < 32) {
      throw new Error('API_KEY must be at least 32 characters long');
    }
    
    return apiKey;
  }
  
  static generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  static validateAllSecrets() {
    try {
      this.validateJWTSecret();
      this.validateRefreshSecret();
      this.validateAPIKey();
      
      console.log('✅ All secrets validated successfully');
      return true;
    } catch (error) {
      console.error('❌ Secret validation failed:', error.message);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('🚨 CRITICAL: Application cannot start with invalid secrets in production');
        process.exit(1); // Arrêter l'application en production
      }
      
      throw error;
    }
  }
}

export default SecretsValidator;