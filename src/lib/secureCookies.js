// src/lib/secureCookies.js
import crypto from 'crypto';

export class SecureCookies {
  static getSigningSecret() {
    const secret = process.env.COOKIE_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('COOKIE_SECRET must be at least 32 characters');
    }
    return secret;
  }

  static sign(value, secret) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(value)
      .digest('base64url');
    return `${value}--${signature}`; // Utiliser -- comme séparateur plus unique
  }

  static unsign(signedValue, secret) {
    // Séparer avec notre séparateur unique --
    const separatorIndex = signedValue.lastIndexOf('--');
    if (separatorIndex === -1) return false;
    
    const value = signedValue.substring(0, separatorIndex);
    const signature = signedValue.substring(separatorIndex + 2);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(value)
      .digest('base64url');
    
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'base64url'),
        Buffer.from(expectedSignature, 'base64url')
      );
      return isValid ? value : false;
    } catch (error) {
      return false;
    }
  }

  static createSecureCookie(name, value, options = {}) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secret = this.getSigningSecret();
    
    // Signer la valeur
    const signedValue = this.sign(value, secret);
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      ...options
    };
    
    // Construire le cookie
    const cookieParts = [`${name}=${signedValue}`];
    
    if (cookieOptions.httpOnly) cookieParts.push('HttpOnly');
    if (cookieOptions.secure) cookieParts.push('Secure');
    if (cookieOptions.sameSite) cookieParts.push(`SameSite=${cookieOptions.sameSite}`);
    if (cookieOptions.path) cookieParts.push(`Path=${cookieOptions.path}`);
    if (cookieOptions.maxAge) cookieParts.push(`Max-Age=${cookieOptions.maxAge}`);
    if (cookieOptions.expires) cookieParts.push(`Expires=${cookieOptions.expires.toUTCString()}`);
    
    return cookieParts.join('; ');
  }

  static parseSecureCookie(req, cookieName) {
    try {
      const cookies = this.parseCookies(req);
      const signedValue = cookies[cookieName];
      
      if (!signedValue) {
        return null;
      }
      
      const secret = this.getSigningSecret();
      const unsigned = this.unsign(signedValue, secret);
      
      if (unsigned === false) {
        console.warn(`Cookie ${cookieName} signature invalide`);
        return null;
      }
      
      return unsigned;
    } catch (error) {
      console.error(`Erreur parsing cookie ${cookieName}:`, error);
      return null;
    }
  }

  static parseCookies(req) {
    const cookies = {};
    const cookieHeader = req.headers.cookie;
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
    }
    
    return cookies;
  }

  static createCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static validateCSRFToken(token, expectedToken) {
    if (!token || !expectedToken) {
      return false;
    }
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(expectedToken, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  static clearCookie(name, options = {}) {
    return this.createSecureCookie(name, '', {
      ...options,
      maxAge: 0,
      expires: new Date(0)
    });
  }
}

export default SecureCookies;