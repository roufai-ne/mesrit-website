/* eslint-disable @typescript-eslint/no-unused-vars */
// middleware/auth.js
export function requireRole(role) {
    return async (req, res, next) => {
      try {
        const user = await verifyToken(req);
        
        if (!user) {
          return res.status(401).json({ message: 'Non authentifié' });
        }
  
        if (role === 'admin' && user.role !== 'admin') {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
  
        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
      }
    };
  }