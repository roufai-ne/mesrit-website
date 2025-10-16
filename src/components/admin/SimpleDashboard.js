// src/components/admin/SimpleDashboard.js
import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  FileText, 
  Newspaper, 
  Building2, 
  TrendingUp, 
  Activity,
  Shield,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Settings,
  Bell
} from 'lucide-react';
import Link from 'next/link';

// Dashboard pour les administrateurs
function AdminDashboard() {
  const permissions = usePermission();
  const { user } = useAuth();

  // Statistiques simulées pour l'admin
  const adminStats = [
    {
      title: 'Utilisateurs',
      value: 4,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      link: '/admin/users',
      description: 'Gestion complète des comptes'
    },
    {
      title: 'Actualités',
      value: 12,
      icon: <Newspaper className="w-8 h-8" />,
      color: 'bg-niger-orange',
      link: '/admin/news',
      description: 'Articles et communiqués'
    },
    {
      title: 'Documents',
      value: 8,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-niger-green',
      link: '/admin/documents',
      description: 'Bibliothèque documentaire'
    },
    {
      title: 'Établissements',
      value: 15,
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-purple-500',
      link: '/admin/establishments',
      description: 'Réseau d\'établissements'
    },
    {
      title: 'Services',
      value: 6,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-emerald-500',
      link: '/admin/services',
      description: 'Services numériques'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl dark:bg-secondary-800">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Tableau de bord Administrateur</h2>
            <p className="text-white/80">Bienvenue {user?.username} - Contrôle complet du système MESRIT</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {adminStats.map((card, index) => (
          <Link key={index} href={card.link}>
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 group p-6 cursor-pointer dark:bg-secondary-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl text-white ${card.color} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
                    {card.value}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-readable-muted dark:text-muted-foreground mt-1">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions rapides Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Users className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Gérer utilisateurs</div>
            </Link>
            <Link href="/admin/settings" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Settings className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Paramètres système</div>
            </Link>
            <Link href="/admin/Statistiques" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <BarChart3 className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Stats avancées</div>
            </Link>
            <Link href="/admin/logs" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Activity className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Journaux système</div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">État du système</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-800 dark:text-green-300">Système opérationnel</div>
                <div className="text-green-600 dark:text-green-400">Tous les services fonctionnent normalement</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <Bell className="w-5 h-5 text-blue-600 text-niger-orange dark:text-niger-orange" />
              <div className="text-sm">
                <div className="font-medium text-blue-800 dark:text-blue-300">Notifications actives</div>
                <div className="text-blue-600 dark:text-blue-400 text-niger-orange dark:text-niger-orange">3 nouvelles notifications système</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-300">Sauvegarde programmée</div>
                <div className="text-yellow-600 dark:text-yellow-400">Prochaine sauvegarde dans 2h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard pour les éditeurs
function EditorDashboard() {
  const { user } = useAuth();

  // Statistiques simulées pour l'éditeur
  const editorStats = [
    {
      title: 'Mes actualités',
      value: 3,
      total: 12,
      icon: <Newspaper className="w-8 h-8" />,
      color: 'bg-niger-orange',
      link: '/admin/news',
      action: 'Créer une actualité'
    },
    {
      title: 'Mes documents',
      value: 2,
      total: 8,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-niger-green',
      link: '/admin/documents',
      action: 'Ajouter un document'
    },
    {
      title: 'En attente',
      value: 1,
      icon: <Clock className="w-8 h-8" />,
      color: 'bg-yellow-500',
      link: '/admin/news?status=draft',
      action: 'Voir les brouillons'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Editor */}
      <div className="bg-gradient-to-r from-niger-green to-niger-orange text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl dark:bg-secondary-800">
            <Edit className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Tableau de bord Éditeur</h2>
            <p className="text-white/80">Bienvenue {user?.username} - Gestion du contenu et des communications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {editorStats.map((card, index) => (
          <div key={index} className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl text-white ${card.color}`}>
                {card.icon}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
                  {card.value}
                </div>
                {card.total && (
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    sur {card.total} total
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
              {card.title}
            </h3>
            <Link 
              href={card.link}
              className="inline-flex items-center text-niger-orange hover:text-niger-orange-dark text-sm font-medium transition-colors"
            >
              {card.action} →
            </Link>
          </div>
        ))}
      </div>

      {/* Actions rapides Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Créer du contenu</h3>
          </div>
          <div className="space-y-4">
            <Link href="/admin/news" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Newspaper className="w-6 h-6 text-niger-orange" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Nouvelle actualité</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Publier une actualité ou un communiqué</div>
              </div>
            </Link>
            <Link href="/admin/documents" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <FileText className="w-6 h-6 text-niger-green" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Nouveau document</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Ajouter un document officiel</div>
              </div>
            </Link>
            <Link href="/admin/communications" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Calendar className="w-6 h-6 text-niger-orange" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Communication</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Gérer les communications</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Consultation</h3>
          </div>
          <div className="space-y-4">
            <Link href="/admin/establishments" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <Building2 className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Établissements</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Consulter les établissements (lecture seule)</div>
              </div>
              <div className="ml-auto">
                <Eye className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/services" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Services</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Consulter les services (lecture seule)</div>
              </div>
              <div className="ml-auto">
                <Eye className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-niger-orange" />
          <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Activité récente</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
            <div className="w-2 h-2 bg-niger-orange rounded-full"></div>
            <div className="text-sm">
              <span className="font-medium text-niger-green dark:text-niger-green-light">Actualité publiée</span>
              <span className="text-readable-muted dark:text-muted-foreground ml-2">il y a 2 heures</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
            <div className="w-2 h-2 bg-niger-green rounded-full"></div>
            <div className="text-sm">
              <span className="font-medium text-niger-green dark:text-niger-green-light">Document ajouté</span>
              <span className="text-readable-muted dark:text-muted-foreground ml-2">il y a 1 jour</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="text-sm">
              <span className="font-medium text-niger-green dark:text-niger-green-light">Brouillon sauvegardé</span>
              <span className="text-readable-muted dark:text-muted-foreground ml-2">il y a 2 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal qui choisit le bon dashboard
export default function SimpleDashboard() {
  const permissions = usePermission();
  
  if (permissions.isAdmin) {
    return <AdminDashboard />;
  } else {
    return <EditorDashboard />;
  }
}