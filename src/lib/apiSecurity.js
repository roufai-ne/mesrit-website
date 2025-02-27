import crypto from 'crypto';
import NodeCache from 'node-cache';

class ApiSecurity {
  static cache = new NodeCache({ stdTTL: 300 }); // Cache de 5 minutes

  static async validateApiKey(providedKey) {
    try {
      const validApiKey = process.env.API_KEY;
      if (!validApiKey) {
        console.error('API_KEY non défini dans les variables d’environnement');
        return false;
      }
      if (!providedKey) {
        console.error('Clé API non fournie dans la requête');
        return false;
      }

      const isValid = crypto.timingSafeEqual(
        Buffer.from(providedKey),
        Buffer.from(validApiKey)
      );
      if (!isValid) {
        console.warn('Clé API invalide fournie:', providedKey);
      }
      return isValid;
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