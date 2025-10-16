// middleware/sessionSecurity.js
import { verifyToken } from '@/lib/auth';
import SessionManager from '@/lib/sessionManager';
import crypto from 'crypto';

/**
 * Advanced Session Security Middleware
 * Provides enhanced security features for session management
 */

// Threat detection patterns
const THREAT_PATTERNS = {
  // Common attack patterns in user agents
  SUSPICIOUS_USER_AGENTS: [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /burp/i,
    /wget/i,
    /curl/i
  ],
  
  // Suspicious request patterns
  SUSPICIOUS_PATHS: [
    /\.php$/,
    /\.asp$/,
    /admin\/config/,
    /wp-admin/,
    /phpmyadmin/
  ]
};

export class SessionSecurity {
  /**
   * Enhanced session validation with security checks
   */
  static async validateSecureSession(req, res) {
    try {
      // Get basic request information
      const requestInfo = {
        ipAddress: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || '',
        path: req.url || '',
        method: req.method || '',
        timestamp: new Date()
      };

      // Run security checks
      const securityCheckResult = await this.runSecurityChecks(requestInfo);
      
      if (!securityCheckResult.passed) {
        console.warn('Security check failed:', securityCheckResult.reason);
        return {
          valid: false,
          error: 'Security validation failed',
          blocked: securityCheckResult.shouldBlock
        };
      }

      // Verify JWT token
      const user = await verifyToken(req);
      if (!user) {
        return {
          valid: false,
          error: 'Invalid authentication token'
        };
      }

      // Extract session ID from custom header or generate one
      let sessionId = req.headers['x-session-id'];
      
      if (!sessionId) {
        // Create new session if none exists
        sessionId = await SessionManager.createSession(user._id, requestInfo);
      } else {
        // Validate existing session
        const session = await SessionManager.validateSession(sessionId, requestInfo);
        if (!session) {
          return {
            valid: false,
            error: 'Session expired or invalid'
          };
        }
      }

      return {
        valid: true,
        user,
        sessionId,
        requestInfo
      };

    } catch (error) {
      console.error('Session validation error:', error);
      return {
        valid: false,
        error: 'Session validation failed'
      };
    }
  }

  /**
   * Run comprehensive security checks
   */
  static async runSecurityChecks(requestInfo) {
    const checks = [
      this.checkUserAgent(requestInfo.userAgent),
      this.checkRequestPath(requestInfo.path),
      this.checkRateLimit(requestInfo.ipAddress),
      this.checkGeolocation(requestInfo.ipAddress)
    ];

    for (const check of checks) {
      const result = await check;
      if (!result.passed) {
        return result;
      }
    }

    return { passed: true };
  }

  /**
   * Check for suspicious user agents
   */
  static async checkUserAgent(userAgent) {
    if (!userAgent) {
      return { passed: false, reason: 'Missing user agent', shouldBlock: true };
    }

    for (const pattern of THREAT_PATTERNS.SUSPICIOUS_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        return { 
          passed: false, 
          reason: `Suspicious user agent: ${userAgent}`, 
          shouldBlock: true 
        };
      }
    }

    return { passed: true };
  }

  /**
   * Check for suspicious request paths
   */
  static async checkRequestPath(path) {
    for (const pattern of THREAT_PATTERNS.SUSPICIOUS_PATHS) {
      if (pattern.test(path)) {
        return { 
          passed: false, 
          reason: `Suspicious path: ${path}`, 
          shouldBlock: true 
        };
      }
    }

    return { passed: true };
  }

  /**
   * Advanced rate limiting check
   */
  static async checkRateLimit(ipAddress) {
    // This is a simplified version - in production, use Redis
    const rateLimitKey = `rate_limit:${ipAddress}`;
    // Implementation would check against Redis or similar store
    
    return { passed: true }; // Simplified for demo
  }

  /**
   * Geolocation-based security check
   */
  static async checkGeolocation(ipAddress) {
    // In production, you might want to:
    // 1. Check against known malicious IP ranges
    // 2. Verify geographic consistency with user's profile
    // 3. Check against threat intelligence feeds
    
    return { passed: true }; // Simplified for demo
  }

  /**
   * Get real client IP address
   */
  static getClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Generate security token for additional verification
   */
  static generateSecurityToken(sessionId, userAgent, ipAddress) {
    const data = `${sessionId}:${userAgent}:${ipAddress}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify security token
   */
  static verifySecurityToken(token, sessionId, userAgent, ipAddress, maxAge = 3600000) {
    try {
      // In production, you'd store token metadata and verify against it
      return true; // Simplified for demo
    } catch (error) {
      return false;
    }
  }
}

/**
 * Middleware wrapper for enhanced session security
 */
export const withSessionSecurity = (handler) => {
  return async (req, res) => {
    try {
      // Skip security checks for certain paths
      const skipPaths = ['/api/auth/login', '/api/auth/refresh', '/api/health'];
      if (skipPaths.some(path => req.url?.startsWith(path))) {
        return handler(req, res);
      }

      const sessionValidation = await SessionSecurity.validateSecureSession(req, res);
      
      if (!sessionValidation.valid) {
        if (sessionValidation.blocked) {
          return res.status(403).json({
            error: 'Access blocked for security reasons',
            code: 'SECURITY_BLOCK'
          });
        } else {
          return res.status(401).json({
            error: sessionValidation.error,
            code: 'SESSION_INVALID'
          });
        }
      }

      // Add session info to request
      req.user = sessionValidation.user;
      req.sessionId = sessionValidation.sessionId;
      req.requestInfo = sessionValidation.requestInfo;

      // Add security headers
      res.setHeader('X-Session-ID', sessionValidation.sessionId);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return handler(req, res);

    } catch (error) {
      console.error('Session security middleware error:', error);
      return res.status(500).json({
        error: 'Internal security error',
        code: 'SECURITY_ERROR'
      });
    }
  };
};

export default SessionSecurity;