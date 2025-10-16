// lib/auth.js
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { SecretsValidator } from './secretsValidator';
import { SecureCookies } from './secureCookies';

// Valider les secrets au démarrage - L'application s'arrêtera si invalides
const JWT_SECRET = SecretsValidator.validateJWTSecret();
const REFRESH_SECRET = SecretsValidator.validateRefreshSecret();

export async function verifyToken(req) {
  try {
    // First try to get token from secure signed cookies
    let token = SecureCookies.parseSecureCookie(req, 'accessToken');
    
    // Enhanced fallback: try both signed and unsigned cookies
    if (!token) {
      const cookies = {};
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) cookies[name] = decodeURIComponent(value);
        });
      }
      
      // Try unsigned token (for backward compatibility)
      token = cookies.accessToken;
      if (token && process.env.NODE_ENV === 'development') {
        console.log('⚠️  Using unsigned cookie for compatibility');
      }
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== TOKEN VERIFICATION DEBUG ===');
      console.log('Raw cookie header:', req.headers.cookie);
      console.log('Secure access token found:', !!token);
      console.log('Token length:', token ? token.length : 0);
    }
    
    // Fallback to Authorization header for backward compatibility during migration
    if (!token) {
      token = req.headers.authorization?.replace('Bearer ', '');
      if (process.env.NODE_ENV === 'development' && token) {
        console.log('Using Authorization header token instead');
      }
    }
    
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No access token found in cookies or Authorization header');
      }
      throw new Error('Token not provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (process.env.NODE_ENV === 'development') {
      console.log('Token decoded successfully, userId:', decoded.userId);
    }
    
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('User found and active:', user.username);
      console.log('===============================');
    }
    
    return user;
  } catch (error) {
    console.log('Token verification failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('===============================');
    }
    return null;
  }
}

// New function to verify refresh token
export async function verifyRefreshToken(req) {
  try {
    const refreshToken = SecureCookies.parseSecureCookie(req, 'refreshToken');
    
    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }

    return user;
  } catch (error) {
    console.log('Refresh token verification failed:', error.message);
    return null;
  }
}

// Helper function to check if user has specific role
export function hasRole(user, role) {
  if (!user) return false;
  return user.role === role;
}

// Helper function to check if user is admin
export function isAdmin(user) {
  return hasRole(user, 'admin');
}

// Helper function to check if user is editor or admin
export function canEdit(user) {
  return hasRole(user, 'admin') || hasRole(user, 'editor');
}