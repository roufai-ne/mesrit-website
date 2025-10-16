// pages/api/admin/sessions/[sessionId].js
import { verifyToken } from '@/lib/auth';
import SessionManager from '@/lib/sessionManager';
import { connectDB } from '@/lib/mongodb';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID required' });
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

  );
    }

    switch (req.method) {
      case 'GET':
        // Get specific session details
        const session = SessionManager.activeSessions?.get(sessionId);
        if (!session) {
          return res.status(404).json({ message: 'Session not found' });
        }

        return res.status(200).json({
          success: true,
          session: {
            sessionId,
            userId: session.userId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: session.isActive,
            metadata: session.metadata || {}
          }
        });

      case 'DELETE':
        // Terminate specific session
        SessionManager.invalidateSession(sessionId);
        
        return res.status(200).json({
          success: true,
          message: 'Session terminated successfully'
        });

      case 'PUT':
        // Update session metadata (for admin notes, security flags, etc.)
        const { metadata } = req.body;
        
        const existingSession = SessionManager.activeSessions?.get(sessionId);
        if (!existingSession) {
          return res.status(404).json({ message: 'Session not found' });
        }

        existingSession.metadata = { ...existingSession.metadata, ...metadata };
        SessionManager.activeSessions?.set(sessionId, existingSession);

        return res.status(200).json({
          success: true,
          message: 'Session updated successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error managing session:', error);
    return res.status(500).json({ 
      message: 'Failed to manage session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}