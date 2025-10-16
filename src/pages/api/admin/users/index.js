// src/pages/api/admin/users/index.js
import { withErrorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import logger, { LOG_TYPES } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/securityHeaders';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

async function adminUsersHandler(req, res) {
  // Vérifier l'authentification admin
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier les permissions RBAC
  if (!RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.READ)) {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.'
    });
  }

  );
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      // Récupérer tous les utilisateurs avec les informations de base
      const users = await User.find({}, {
        password: 0, // Exclure le mot de passe
        twoFactorSecret: 0 // Exclure le secret 2FA
      }).sort({ createdAt: -1 });

      // Formater les données pour l'interface
      const formattedUsers = users.map(user => ({
        _id: user._id,
        id: user._id, // Alias pour compatibilité
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isFirstLogin: user.isFirstLogin || false,
        loginCount: user.loginCount || 0
      }));

      await logger.info(
        LOG_TYPES.USER_UPDATED,
        `Liste des utilisateurs consultée par l'admin ${user.username}`,
        { adminId: user._id, usersCount: formattedUsers.length },
        req
      );

      return res.status(200).json({
        success: true,
        data: formattedUsers
      });
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur récupération utilisateurs: ${error.message}`,
        { adminId: user._id, error: error.stack },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { username, email, password, role = 'editor' } = req.body;

      // Validation des données
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nom d\'utilisateur, email et mot de passe requis'
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà'
        });
      }

      // Créer le nouvel utilisateur
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        status: 'active',
        isFirstLogin: true,
        createdAt: new Date()
      });

      await newUser.save();

      await logger.success(
        LOG_TYPES.USER_CREATED,
        `Nouvel utilisateur créé: ${username} (${role}) par l'admin ${user.username}`,
        { 
          newUserId: newUser._id,
          newUsername: username,
          newUserRole: role,
          adminId: user._id 
        },
        req
      );

      // Retourner l'utilisateur créé (sans le mot de passe)
      const userResponse = {
        _id: newUser._id,
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        isFirstLogin: newUser.isFirstLogin,
        createdAt: newUser.createdAt
      };

      return res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: userResponse
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      
      await logger.error(
        LOG_TYPES.API_ERROR,
        `Erreur création utilisateur: ${error.message}`,
        { adminId: user._id, error: error.stack },
        req
      );

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}

export default withSecurityHeaders(withErrorHandler(adminUsersHandler));