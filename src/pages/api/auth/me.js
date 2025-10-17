// pages/api/auth/me.js
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import cookieDebug from '@/lib/cookieDebug';
import { withErrorHandler, AppError, ERROR_TYPES } from '@/lib/errorHandler';
import logger, { LOG_TYPES } from '@/lib/logger';

async function meHandler(req, res) {
  if (req.method !== 'GET') {
    throw new AppError('Méthode non autorisée', ERROR_TYPES.VALIDATION, 405);
  }

  // Debug cookie information in development
  if (process.env.NODE_ENV === 'development') {
    cookieDebug.logServerCookies(req);
  }
  
  await connectDB();
  
  const user = await verifyToken(req);
  
  if (!user) {
    // Pour l'endpoint /me, ne pas logger comme avertissement car c'est normal
    // Cet endpoint est utilisé pour vérifier l'état de connexion
    if (process.env.NODE_ENV === 'development') {
      console.log('No user found from token verification - normal for auth check');
    }

    // Ne pas logger comme tentative d'intrusion, c'est juste une vérification d'état
    // await logger.info(
    //   LOG_TYPES.USER_ACTION,
    //   'Vérification d\'authentification',
    //   { endpoint: '/api/auth/me', authenticated: false },
    //   req
    // );

    throw new AppError(
      'Non authentifié',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }

  console.log('User authenticated successfully:', user.username);
  
  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin
    }
  });
}

export default withErrorHandler(meHandler);