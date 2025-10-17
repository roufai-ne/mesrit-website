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

      // ✅ CORRECTION: Autoriser le réseau local en développement
      if (process.env.NODE_ENV === 'development') {
        const isLocalNetwork = origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+$/);
        if (isLocalNetwork) {
          console.log(`Origine ${origin} autorisée (réseau local en développement)`);
          this.cache.set(cacheKey, true);
          return true;
        }
      }

      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
      
      // ✅ CORRECTION: Ajouter des origines par défaut si aucune n'est définie
      const defaultOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.NEXT_PUBLIC_BASE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
      ].filter(Boolean);

      const allAllowedOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

      if (allAllowedOrigins.length === 0) {
        console.warn('⚠️ ALLOWED_ORIGINS non défini, aucune origine autorisée');
        return false;
      }

      const isValid = allAllowedOrigins.some((allowed) => {
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          return origin.endsWith(domain);
        }
        return origin === allowed;
      });

      this.cache.set(cacheKey, isValid);
      
      if (!isValid) {
        console.warn(`❌ Origine ${origin} refusée. Origines autorisées:`, allAllowedOrigins);
      } else {
        console.log(`✅ Origine ${origin} validée`);
      }
      
      return isValid;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'origine:', error);
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