// pages/api/users/[id].js
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import { withErrorHandler, AppError, ERROR_TYPES, validators } from '@/lib/errorHandler';
import logger, { LOG_TYPES } from '@/lib/logger';
import bcrypt from 'bcryptjs';

async function userByIdHandler(req, res) {
  await connectDB();
  
  const user = await verifyToken(req);
  if (!user) {
    throw new AppError(
      'Authentification requise',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }
  
  // Vérifier les permissions RBAC pour la gestion des utilisateurs
  if (!RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.READ)) {
    throw new AppError(
      'Vous n\'avez pas les permissions nécessaires pour cette action.',
      ERROR_TYPES.AUTHORIZATION,
      403
    );
  }

  const { id } = req.query;

  // Vérifier que l'ID est valide
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError(
      'ID utilisateur invalide',
      ERROR_TYPES.VALIDATION,
      400
    );
  }

  switch (req.method) {
    case 'PUT':
      const updateData = { ...req.body };
      
      // Validation des données si présentes
      if (updateData.email) {
        validators.email(updateData.email);
        
        // Vérifier l'unicité de l'email
        const existingUser = await User.findOne({
          email: updateData.email,
          _id: { $ne: id }
        });
        
        if (existingUser) {
          throw new AppError(
            'Cette adresse email est déjà utilisée',
            ERROR_TYPES.CONFLICT,
            409
          );
        }
      }
      
      if (updateData.role) {
        validators.role(updateData.role);
      }
      
      // Ne modifier le mot de passe que s'il est fourni et non vide
      if (typeof updateData.password === 'string' && updateData.password.trim() !== '') {
        validators.password(updateData.password);
        updateData.password = await bcrypt.hash(updateData.password, 12);
        updateData.isFirstLogin = true; // Forcer le changement de mot de passe
      } else {
        delete updateData.password;
      }

      // Empêcher la modification de certains champs
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        throw new AppError(
          'Utilisateur non trouvé',
          ERROR_TYPES.NOT_FOUND,
          404
        );
      }

      // Logger la modification d'utilisateur
      await logger.success(
        LOG_TYPES.USER_UPDATED,
        `Utilisateur modifié: ${updatedUser.username}`,
        { 
          targetUserId: id,
          targetUsername: updatedUser.username,
          modifiedFields: Object.keys(updateData),
          modifiedBy: user.username
        },
        req
      );
      
      // Logger spécifique pour changement de rôle
      if (updateData.role) {
        await logger.info(
          LOG_TYPES.ROLE_CHANGED,
          `Rôle modifié pour l'utilisateur ${updatedUser.username}: ${updateData.role}`,
          { 
            targetUserId: id,
            targetUsername: updatedUser.username,
            newRole: updateData.role,
            modifiedBy: user.username
          },
          req
        );
      }
      
      // Logger spécifique pour changement de mot de passe
      if (updateData.password) {
        await logger.warning(
          LOG_TYPES.PASSWORD_CHANGED,
          `Mot de passe réinitialisé pour l'utilisateur ${updatedUser.username}`,
          { 
            targetUserId: id,
            targetUsername: updatedUser.username,
            resetBy: user.username,
            isAdminReset: true
          },
          req
        );
      }

      console.log('Utilisateur modifié:', updatedUser.username, 'par', user.username);
      
      return res.status(200).json({
        success: true,
        message: 'Utilisateur modifié avec succès',
        user: updatedUser
      });

    case 'DELETE':
      // Empêcher la suppression de son propre compte
      if (id === user._id.toString()) {
        throw new AppError(
          'Vous ne pouvez pas supprimer votre propre compte',
          ERROR_TYPES.VALIDATION,
          400
        );
      }

      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        throw new AppError(
          'Utilisateur non trouvé',
          ERROR_TYPES.NOT_FOUND,
          404
        );
      }

      // Logger la suppression d'utilisateur
      await logger.warning(
        LOG_TYPES.USER_DELETED,
        `Utilisateur supprimé: ${deletedUser.username}`,
        { 
          deletedUserId: id,
          deletedUsername: deletedUser.username,
          deletedUserRole: deletedUser.role,
          deletedBy: user.username
        },
        req
      );

      console.log('Utilisateur supprimé:', deletedUser.username, 'par', user.username);
      
      return res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });

    default:
      throw new AppError(
        `Méthode ${req.method} non autorisée`,
        ERROR_TYPES.VALIDATION,
        405
      );
  }
}

export default withErrorHandler(userByIdHandler);