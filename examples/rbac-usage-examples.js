// Exemples d'utilisation du nouveau système RBAC dans les APIs

// ========================================
// 1. API NEWS avec permissions granulaires
// ========================================

// src/pages/api/news/index.js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import { requireNewsAccess } from '@/middleware/rbacMiddleware';
import { ACTIONS } from '@/lib/rbac';

async function newsHandler(req, res) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      // Lecture publique des actualités
      return handleGetNews(req, res);

    case 'POST':
      // Création d'actualité - nécessite permission create
      return requireNewsAccess(ACTIONS.CREATE)(req, res, () => handleCreateNews(req, res));

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// ========================================
// 2. API NEWS spécifique avec contexte
// ========================================

// src/pages/api/news/[id].js
import { requireNewsAccess } from '@/middleware/rbacMiddleware';
import { ACTIONS } from '@/lib/rbac';

async function newsDetailHandler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      // Lecture spécifique - vérification du statut de publication
      return requireNewsAccess(ACTIONS.READ)(req, res, () => handleGetNewsById(req, res));

    case 'PUT':
      // Modification - vérification propriétaire + permissions
      return requireNewsAccess(ACTIONS.UPDATE)(req, res, () => handleUpdateNews(req, res));

    case 'DELETE':
      // Suppression - niveau admin requis
      return requireNewsAccess(ACTIONS.DELETE)(req, res, () => handleDeleteNews(req, res));

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// ========================================
// 3. API Utilisateurs avec hiérarchie
// ========================================

// src/pages/api/users/index.js
import { requireUserManagement } from '@/middleware/rbacMiddleware';
import { ACTIONS } from '@/lib/rbac';

async function usersHandler(req, res) {
  switch (req.method) {
    case 'GET':
      // Liste des utilisateurs - filtrage selon les rôles gérables
      return requireUserManagement(ACTIONS.READ)(req, res, () => handleGetUsers(req, res));

    case 'POST':
      // Création utilisateur - vérification hiérarchie des rôles
      return requireUserManagement(ACTIONS.CREATE)(req, res, () => handleCreateUser(req, res));

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetUsers(req, res) {
  try {
    const { rbac } = req; // Informations RBAC injectées par le middleware
    
    // Filtrer les utilisateurs selon les rôles gérables
    const query = {};
    if (rbac.manageableRoles && rbac.manageableRoles.length > 0) {
      query.role = { $in: rbac.manageableRoles };
    }

    const users = await User.find(query, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

async function handleCreateUser(req, res) {
  try {
    const { rbac, body } = req;
    
    // Vérifier que le rôle assigné est gérable par l'utilisateur
    if (!rbac.manageableRoles.includes(body.role)) {
      return res.status(403).json({
        message: 'Vous ne pouvez pas créer un utilisateur avec ce rôle',
        code: 'ROLE_NOT_MANAGEABLE',
        manageableRoles: rbac.manageableRoles
      });
    }

    const newUser = await User.create(body);
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

// ========================================
// 4. API avec permissions multiples
// ========================================

// src/pages/api/admin/dashboard.js
import { requireAnyPermission } from '@/middleware/rbacMiddleware';
import { RESOURCES, ACTIONS } from '@/lib/rbac';

const dashboardPermissions = [
  { resource: RESOURCES.STATS, action: ACTIONS.READ },
  { resource: RESOURCES.USERS, action: ACTIONS.READ },
  { resource: RESOURCES.SETTINGS, action: ACTIONS.READ }
];

const dashboardHandler = requireAnyPermission(dashboardPermissions)(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { rbac } = req;
    const dashboardData = {};

    // Ajouter les données selon les permissions
    if (rbac.hasPermission(RESOURCES.STATS, ACTIONS.READ)) {
      dashboardData.stats = await getBasicStats();
    }

    if (rbac.hasPermission(RESOURCES.USERS, ACTIONS.READ)) {
      dashboardData.userCount = await User.countDocuments();
    }

    if (rbac.hasPermission(RESOURCES.SETTINGS, ACTIONS.READ)) {
      dashboardData.systemInfo = await getSystemInfo();
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ========================================
// 5. API de publication avec workflow
// ========================================

// src/pages/api/news/[id]/publish.js
import { requireNewsAccess } from '@/middleware/rbacMiddleware';
import { ACTIONS, CONTENT_STATES } from '@/lib/rbac';

const publishHandler = requireNewsAccess(ACTIONS.PUBLISH)(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    const { rbac, user } = req;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Vérifier le workflow selon l'état actuel
    const canPublish = rbac.hasPermission(RESOURCES.NEWS, ACTIONS.PUBLISH, {
      contentState: news.status,
      ownerId: news.author
    });

    if (!canPublish) {
      return res.status(403).json({
        message: 'Publication non autorisée pour cet état de contenu',
        currentState: news.status,
        userRole: user.role
      });
    }

    // Mettre à jour l'état
    news.status = CONTENT_STATES.PUBLISHED;
    news.publishedAt = new Date();
    news.publishedBy = user._id;
    await news.save();

    res.status(200).json({
      message: 'Article publié avec succès',
      article: news
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ========================================
// 6. API avec permissions temporaires
// ========================================

// src/pages/api/users/[id]/grant-permission.js
import { requireUserManagement } from '@/middleware/rbacMiddleware';
import { ACTIONS } from '@/lib/rbac';

const grantPermissionHandler = requireUserManagement(ACTIONS.MANAGE)(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    const { permissions, domains, startDate, endDate } = req.body;
    const { user: grantingUser } = req;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier que l'utilisateur peut gérer ce rôle
    if (!RBAC.isRoleHigher(grantingUser.role, targetUser.role)) {
      return res.status(403).json({
        message: 'Impossible d\'accorder des permissions à ce niveau'
      });
    }

    // Ajouter les permissions temporaires
    if (!targetUser.temporaryPermissions) {
      targetUser.temporaryPermissions = [];
    }

    targetUser.temporaryPermissions.push({
      permissions,
      domains,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      grantedBy: grantingUser._id,
      grantedAt: new Date()
    });

    await targetUser.save();

    res.status(200).json({
      message: 'Permissions temporaires accordées',
      user: targetUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ========================================
// 7. Exemple d'utilisation côté client
// ========================================

// src/components/admin/NewsManager.js
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/hooks/useRBAC';
import { RESOURCES, ACTIONS } from '@/lib/rbac';

function NewsManager() {
  const { user } = useAuth();
  const { hasPermission, canManageContent } = useRBAC();

  // Vérifications de permissions côté client
  const canCreateNews = hasPermission(RESOURCES.NEWS, ACTIONS.CREATE);
  const canDeleteNews = hasPermission(RESOURCES.NEWS, ACTIONS.DELETE);
  const canPublishNews = hasPermission(RESOURCES.NEWS, ACTIONS.PUBLISH);

  return (
    <div>
      <h2>Gestion des Actualités</h2>
      
      {canCreateNews && (
        <button onClick={handleCreateNews}>
          Créer une actualité
        </button>
      )}

      <div className="news-list">
        {news.map(article => (
          <div key={article._id} className="news-item">
            <h3>{article.title}</h3>
            <p>État: {article.status}</p>
            <p>Auteur: {article.author}</p>
            
            <div className="actions">
              {hasPermission(RESOURCES.NEWS, ACTIONS.UPDATE, {
                ownerId: article.author,
                contentState: article.status
              }) && (
                <button onClick={() => handleEdit(article._id)}>
                  Modifier
                </button>
              )}

              {hasPermission(RESOURCES.NEWS, ACTIONS.PUBLISH, {
                contentState: article.status
              }) && article.status !== 'published' && (
                <button onClick={() => handlePublish(article._id)}>
                  Publier
                </button>
              )}

              {canDeleteNews && (
                <button 
                  onClick={() => handleDelete(article._id)}
                  className="danger"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// 8. Hook personnalisé pour RBAC côté client
// ========================================

// src/hooks/useRBAC.js
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import RBAC, { RESOURCES, ACTIONS } from '@/lib/rbac';

export function useRBAC() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        hasPermission: () => false,
        getUserPermissions: () => ({}),
        canManageUsers: false,
        canManageContent: false,
        canAccessStats: false
      };
    }

    return {
      hasPermission: (resource, action, context = {}) => 
        RBAC.hasPermission(user, resource, action, context),
      
      getUserPermissions: () => RBAC.getUserPermissions(user),
      
      getManageableRoles: () => RBAC.getManageableRoles(user.role),
      
      canManageUsers: RBAC.hasPermission(user, RESOURCES.USERS, ACTIONS.MANAGE),
      
      canManageContent: [RESOURCES.NEWS, RESOURCES.DOCUMENTS, RESOURCES.COMMUNICATIONS]
        .some(resource => RBAC.hasPermission(user, resource, ACTIONS.CREATE)),
      
      canAccessStats: RBAC.hasPermission(user, RESOURCES.STATS, ACTIONS.READ),
      
      isRoleHigher: (targetRole) => RBAC.isRoleHigher(user.role, targetRole)
    };
  }, [user]);
}