import crypto from 'crypto';
import NodeCache from 'node-cache';
import { SecretsValidator } from './secretsValidator';

class ApiSecurity {
  static cache = new NodeCache({ stdTTL: 300 }); // Cache de 5 minutes

  static async validateApiKey(providedKey) {
    try {
      const validApiKey = SecretsValidator.validateAPIKey();
      
      if (!providedKey) {
        console.error('Clé API non fournie dans la requête');
        return false;
      }

      // ✅ CORRECTION: Comparaison temporellement sûre
      try {
        // Normaliser les longueurs pour éviter les fuites timing
        const maxLength = Math.max(providedKey.length, validApiKey.length);
        const normalizedProvided = providedKey.padEnd(maxLength, '\0');
        const normalizedValid = validApiKey.padEnd(maxLength, '\0');
        
        const providedBuffer = Buffer.from(normalizedProvided, 'utf8');
        const validBuffer = Buffer.from(normalizedValid, 'utf8');
        
        const isValid = crypto.timingSafeEqual(providedBuffer, validBuffer);
        
        if (!isValid) {
          console.warn('Clé API invalide fournie - longueur:', providedKey?.length || 0);
        }
        
        return isValid;
      } catch (error) {
        // En cas d'erreur dans timingSafeEqual, rejeter
        console.error('Erreur dans la comparaison sécurisée:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la clé API:', error);
      return false;
    }
  }

  static async validateOrigin(origin) {
    try {
      if (!origin) {
        console.warn('Aucune origine fournie dans la requête');
        return false;
      }

      const cacheKey = `origin:${origin}`;
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult !== undefined) {
        console.log(`Origine ${origin} validée via cache: ${cachedResult}`);
        return cachedResult;
      }

      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (allowedOrigins.length === 0) {
        console.warn('ALLOWED_ORIGINS non défini, aucune origine autorisée');
      }

      const isValid = allowedOrigins.some((allowed) => {
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          return origin.endsWith(domain);
        }
        return origin === allowed;
      });

      this.cache.set(cacheKey, isValid);
      console.log(`Origine ${origin} validée: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Erreur lors de la validation de l’origine:', error);
      return false;
    }
  }

  static async getRequestMetadata(req) {
    return {
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: req.url,
      method: req.method,
      correlationId: crypto.randomUUID(),
    };
  }

  static isKeyExpired(keyMetadata) {
    const rotationPeriod = 90 * 24 * 60 * 60 * 1000; // 90 jours
    return Date.now() - keyMetadata.createdAt > rotationPeriod;
  }
}

export default ApiSecurity;