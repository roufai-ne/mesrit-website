// pages/api/auth/login.js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { withErrorHandler, AppError, ERROR_TYPES, validators } from '@/lib/errorHandler';
import { SecretsValidator } from '@/lib/secretsValidator';
import { SecureCookies } from '@/lib/secureCookies';
import logger, { LOG_TYPES } from '@/lib/logger';
import AnomalyDetection from '@/lib/anomalyDetection';
import TwoFactorAuth from '@/lib/twoFactorAuth';
import { rateLimiters } from '@/lib/rateLimit';

// Valider les secrets au démarrage
const JWT_SECRET = SecretsValidator.validateJWTSecret();
const REFRESH_SECRET = SecretsValidator.validateRefreshSecret();

async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    throw new AppError('Méthode non autorisée', ERROR_TYPES.VALIDATION, 405);
  }

  await connectDB();
  console.log('Tentative de connexion');

  const { username, password, twoFactorToken, useBackupCode } = req.body;

  // Validation des entrées
  try {
    validators.required(username, 'Nom d\'utilisateur');
    validators.required(password, 'Mot de passe');
  } catch (validationError) {
    throw validationError;
  }

  // Recherche de l'utilisateur
  const user = await User.findOne({ username });
  if (!user) {
    console.log('Utilisateur non trouvé:', username);
    
    // Logger la tentative de connexion échouée
    await logger.warning(
      LOG_TYPES.LOGIN_FAILED,
      `Tentative de connexion avec utilisateur inexistant: ${username}`,
      { username, reason: 'user_not_found' },
      req
    );
    
    throw new AppError(
      'Nom d\'utilisateur ou mot de passe incorrect',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }

  // Vérification du statut du compte
  if (user.status !== 'active') {
    console.log('Compte inactif:', username);
    throw new AppError(
      'Votre compte a été désactivé. Contactez l\'administrateur.',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }

  // Validation du mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('Validation mot de passe:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('Mot de passe incorrect pour:', username);
    
    // Analyser l'anomalie de connexion échouée
    const anomalyAnalysis = await AnomalyDetection.analyzeLoginAttempt(
      user._id,
      req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
      req.headers['user-agent'],
      false, // échec de connexion
      { username, reason: 'invalid_password' }
    );
    
    // Logger la tentative de connexion échouée
    await logger.warning(
      LOG_TYPES.LOGIN_FAILED,
      `Tentative de connexion avec mot de passe incorrect: ${username}`,
      { 
        username, 
        reason: 'invalid_password',
        riskScore: anomalyAnalysis.riskScore,
        riskLevel: anomalyAnalysis.riskLevel
      },
      req
    );
    
    // Bloquer si risque très élevé
    if (anomalyAnalysis.shouldBlock) {
      throw new AppError(
        'Compte temporairement bloqué en raison d\'activité suspecte',
        ERROR_TYPES.AUTHENTICATION,
        429
      );
    }
    
    throw new AppError(
      'Nom d\'utilisateur ou mot de passe incorrect',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }

  // Analyser l'anomalie de connexion réussie
  const anomalyAnalysis = await AnomalyDetection.analyzeLoginAttempt(
    user._id,
    req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    req.headers['user-agent'],
    true, // connexion réussie
    { username }
  );

  // Vérifier le 2FA si activé
  const twoFactorResult = await TwoFactorAuth.verify2FAForLogin(
    user._id, 
    twoFactorToken, 
    useBackupCode
  );

  if (twoFactorResult.required && !twoFactorResult.success) {
    return res.status(200).json({
      success: false,
      requiresTwoFactor: true,
      message: twoFactorResult.message,
      riskLevel: anomalyAnalysis.riskLevel,
      shouldRequire2FA: anomalyAnalysis.shouldRequire2FA
    });
  }

  // Forcer le 2FA si risque élevé (même si pas activé)
  if (anomalyAnalysis.shouldRequire2FA && !twoFactorResult.required && !twoFactorToken) {
    await logger.warning(
      LOG_TYPES.SUSPICIOUS_ACTIVITY,
      `Connexion à risque élevé détectée pour ${username}, 2FA recommandé`,
      { 
        username, 
        riskScore: anomalyAnalysis.riskScore,
        riskLevel: anomalyAnalysis.riskLevel,
        anomalies: anomalyAnalysis.anomalies.map(a => a.type)
      },
      req
    );

    return res.status(200).json({
      success: false,
      requiresAdditionalAuth: true,
      message: 'Activité inhabituelle détectée. Veuillez activer l\'authentification à deux facteurs.',
      riskLevel: anomalyAnalysis.riskLevel,
      setupUrl: '/admin/security/2fa'
    });
  }

  console.log('Connexion réussie pour:', username);

  // Logger la connexion réussie
  await logger.success(
    LOG_TYPES.LOGIN,
    `Connexion réussie pour ${username}`,
    { 
      username,
      userId: user._id,
      riskScore: anomalyAnalysis.riskScore,
      riskLevel: anomalyAnalysis.riskLevel,
      twoFactorUsed: twoFactorResult.required
    },
    req
  );

  // Mise à jour de la dernière connexion
  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $inc: { loginCount: 1 }
  });

  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      type: 'refresh'
    },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Créer des cookies sécurisés avec signature
  const accessTokenCookie = SecureCookies.createSecureCookie(
    'accessToken', 
    accessToken, 
    { maxAge: 15 * 60 } // 15 minutes
  );

  const refreshTokenCookie = SecureCookies.createSecureCookie(
    'refreshToken', 
    refreshToken, 
    { maxAge: 7 * 24 * 60 * 60 } // 7 jours
  );

  // Créer un token CSRF pour la sécurité
  const csrfToken = SecureCookies.createCSRFToken();
  const csrfCookie = SecureCookies.createSecureCookie(
    'csrfToken', 
    csrfToken, 
    { maxAge: 24 * 60 * 60 } // 24 heures
  );

  res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie, csrfCookie]);

  return res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin
    },
    csrfToken: csrfToken // Pour les requêtes AJAX côté client
  });
}

// Appliquer rate limiting: 5 tentatives max par 15 minutes
export default function handler(req, res) {
  return rateLimiters.authLogin(req, res, () => {
    return withErrorHandler(loginHandler)(req, res);
  });
}