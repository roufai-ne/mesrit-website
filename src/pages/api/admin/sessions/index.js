// pages/api/admin/sessions/index.js
import { verifyToken } from '@/lib/auth';
import SessionManager from '@/lib/sessionManager';
import { connectDB } from '@/lib/mongodb';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Verify admin authentication
    const user = await verifyToken(req);
    if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.SECURITY, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  // Get session statistics
    const stats = SessionManager.getSessionStats();
    
    // Get detailed session information (for admin view)
    const allSessions = Array.from(SessionManager.activeSessions || new Map()).map(([sessionId, session]) => ({
      sessionId,
      userId: session.userId,
      user: {
        username: session.user?.username || 'Unknown',
        email: session.user?.email || 'Unknown'
      },
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: session.isActive,
      metadata: session.metadata || {}
    }));

    // Filter only active sessions for the response
    const activeSessions = allSessions.filter(session => session.isActive);

    return res.status(200).json({
      success: true,
      sessions: activeSessions,
      stats,
      total: allSessions.length,
      active: activeSessions.length
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

