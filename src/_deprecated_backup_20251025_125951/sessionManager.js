// lib/sessionManager.js
import { connectDB } from './mongodb';
import { User } from '@/models/User';

/**
 * Enhanced Session Management Utility
 * Provides advanced session tracking, security, and management capabilities
 */

// Session storage for active sessions (in production, use Redis)
const activeSessions = new Map();

export class SessionManager {
  /**
   * Create a new session record
   */
  static async createSession(userId, sessionData = {}) {
    try {
      await connectDB();
      
      const sessionId = this.generateSessionId();
      const session = {
        sessionId,
        userId,
        createdAt: new Date(),
        lastActivity: new Date(),
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        isActive: true,
        metadata: sessionData.metadata || {}
      };

      // Store session (in production, use Redis for better performance)
      activeSessions.set(sessionId, session);
      
      // Update user's last login
      await User.findByIdAndUpdate(userId, {
        lastLogin: new Date(),
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent
          }
        }
      });

      return sessionId;
    } catch (error) {
      console.error('Session creation error:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate and update session activity
   */
  static async validateSession(sessionId, requestData = {}) {
    try {
      const session = activeSessions.get(sessionId);
      
      if (!session || !session.isActive) {
        return null;
      }

      // Check session timeout (24 hours max)
      const sessionAge = Date.now() - session.createdAt.getTime();
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > MAX_SESSION_AGE) {
        this.invalidateSession(sessionId);
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      
      // Security checks
      if (requestData.ipAddress && session.ipAddress !== requestData.ipAddress) {
        console.warn(`IP address mismatch for session ${sessionId}`);
        // In production, you might want to invalidate the session or require re-authentication
      }

      activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Invalidate a specific session
   */
  static invalidateSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.invalidatedAt = new Date();
      activeSessions.set(sessionId, session);
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  static invalidateUserSessions(userId) {
    const userSessions = Array.from(activeSessions.entries())
      .filter(([_, session]) => session.userId === userId);
    
    userSessions.forEach(([sessionId, _]) => {
      this.invalidateSession(sessionId);
    });
  }

  /**
   * Get active sessions for a user
   */
  static getUserSessions(userId) {
    return Array.from(activeSessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  static cleanupExpiredSessions() {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const [sessionId, session] of activeSessions.entries()) {
      const sessionAge = now - session.createdAt.getTime();
      if (sessionAge > CLEANUP_THRESHOLD || !session.isActive) {
        activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `sess_${timestamp}_${randomPart}`;
  }

  /**
   * Get session statistics
   */
  static getSessionStats() {
    const sessions = Array.from(activeSessions.values());
    const activeSessions = sessions.filter(s => s.isActive);
    
    return {
      total: sessions.length,
      active: activeSessions.length,
      inactive: sessions.length - activeSessions.length,
      byUser: activeSessions.reduce((acc, session) => {
        acc[session.userId] = (acc[session.userId] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Cleanup expired sessions every hour
setInterval(() => {
  SessionManager.cleanupExpiredSessions();
}, 60 * 60 * 1000);

export default SessionManager;