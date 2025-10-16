// pages/api/users/index.js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { requirePermission } from '@/middleware/rbacMiddleware';
import { RESOURCES, ACTIONS } from '@/lib/rbac';
import { AppError, ERROR_TYPES, validators } from '@/lib/errorHandler';
import logger, { LOG_TYPES } from '@/lib/logger';
import bcrypt from 'bcryptjs';

// GET Handler - Liste des utilisateurs
async function getUsersHandler(req, res) {
  await connectDB();
  
  const { rbac, user } = req;
  
  // Filtrer les utilisateurs selon les rôles gérables
  let query = {};
  if (rbac?.manageableRoles && rbac.manageableRoles.length > 0) {
    query.role = { $in: rbac.manageableRoles };
  }

  const users = await User.find(query, '-password -twoFactorSecret -twoFactorBackupCodes')
    .sort({ createdAt: -1 });
  
  // Logger l'accès (sans await pour éviter de bloquer la réponse)
  logger.info(
    LOG_TYPES.ACCESS,
    `Users list accessed by ${user.username}`,
    {
      userId: user._id,
      userRole: user.role,
      resultCount: users.length
    },
    req
  ).catch(err => console.error('Logger error:', err));

  return res.status(200).json(users);
}

// POST Handler - Créer un utilisateur
async function createUserHandler(req, res) {
  await connectDB();
  
  const { rbac, user, body } = req;
  
  // Validation des champs requis
  validators.required(body.username, 'Nom d\'utilisateur');
  validators.required(body.email, 'Email');
  validators.required(body.password, 'Mot de passe');
  validators.required(body.role, 'Rôle');
  validators.email(body.email);
  validators.password(body.password);
  validators.role(body.role);
  
  // Vérifier que le rôle assigné est gérable par l'utilisateur
  if (rbac?.canManageRole && !rbac.canManageRole(body.role)) {
    throw new AppError(
      'Vous ne pouvez pas créer un utilisateur avec ce rôle',
      ERROR_TYPES.AUTHORIZATION,
      403
    );
  }

  // Vérifier l'unicité
  const existingUser = await User.findOne({
    $or: [
      { username: body.username },
      { email: body.email }
    ]
  });

  if (existingUser) {
    if (existingUser.username === body.username) {
      throw new AppError(
        'Ce nom d\'utilisateur est déjà utilisé',
        ERROR_TYPES.CONFLICT,
        409
      );
    }
    if (existingUser.email === body.email) {
      throw new AppError(
        'Cette adresse email est déjà utilisée',
        ERROR_TYPES.CONFLICT,
        409
      );
    }
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(body.password, 10);

  // Créer l'utilisateur avec les nouveaux champs RBAC
  const userData = {
    username: body.username.trim(),
    email: body.email.trim().toLowerCase(),
    password: hashedPassword,
    role: body.role,
    status: body.status || 'active',
    isFirstLogin: true,
    assignedDomains: body.assignedDomains || getDefaultDomains(body.role),
    assignedEstablishments: body.assignedEstablishments || [],
    lastRoleChange: {
      previousRole: null,
      newRole: body.role,
      changedBy: user._id,
      changedAt: new Date()
    }
  };

  const newUser = await User.create(userData);

  // Logger la création (sans await pour éviter de bloquer)
  logger.success(
    LOG_TYPES.USER_CREATED,
    `New user created: ${newUser.username}`,
    {
      createdBy: user._id,
      createdByRole: user.role,
      newUserId: newUser._id,
      newUserRole: newUser.role,
      username: newUser.username,
      email: newUser.email
    },
    req
  ).catch(err => console.error('Logger error:', err));

  return res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      isFirstLogin: newUser.isFirstLogin,
      assignedDomains: newUser.assignedDomains,
      createdAt: newUser.createdAt
    }
  });
}

// Fonction utilitaire pour assigner les domaines par défaut selon le rôle
function getDefaultDomains(role) {
  switch (role) {
    case 'super-admin':
    case 'system-admin':
    case 'content-admin':
      return ['news', 'documents', 'communications', 'establishments', 'services', 'directors'];
    case 'editor':
      return ['news', 'documents'];
    default:
      return [];
  }
}

// Wrapper pour exécuter les middlewares style Express avec Next.js
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Export principal avec gestion d'erreur intégrée
export default async function handler(req, res) {
  try {
    // Vérifier la méthode HTTP
    if (!['GET', 'POST'].includes(req.method)) {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} Not Allowed` 
      });
    }

    // Déterminer l'action RBAC selon la méthode
    const action = req.method === 'GET' ? ACTIONS.READ : ACTIONS.CREATE;
    
    // Appliquer le middleware RBAC
    await runMiddleware(req, res, requirePermission(RESOURCES.USERS, action));
    
    // Si le middleware n'a pas renvoyé de réponse, continuer
    if (res.headersSent) {
      return;
    }

    // Router vers le bon handler
    if (req.method === 'GET') {
      return await getUsersHandler(req, res);
    } else if (req.method === 'POST') {
      return await createUserHandler(req, res);
    }

  } catch (error) {
    console.error('API Error:', error);
    
    // Ne rien faire si la réponse a déjà été envoyée
    if (res.headersSent) {
      return;
    }
    
    // Gestion des erreurs
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        type: error.type,
        details: error.details,
        timestamp: error.timestamp
      });
    }
    
    // Erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        type: ERROR_TYPES.VALIDATION,
        details: error.errors
      });
    }
    
    // Erreur de duplication (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec ce nom ou email existe déjà',
        type: ERROR_TYPES.CONFLICT
      });
    }
    
    // Erreur générique
    return res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue',
      type: ERROR_TYPES.SERVER,
      timestamp: new Date().toISOString()
    });
  }
}