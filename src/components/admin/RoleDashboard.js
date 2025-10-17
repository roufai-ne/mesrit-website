// src/components/admin/RoleDashboard.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';
import { secureApi } from '@/lib/secureApi';
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
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import NewsAnalyticsDashboardV2 from './NewsAnalyticsDashboardV2';

// Dashboard pour les administrateurs
function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    news: 0,
    documents: 0,
    establishments: 0,
    services: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        
        // Charger les données depuis les API existantes
        const [newsRes, documentsRes, usersRes, establishmentsRes, servicesRes] = await Promise.allSettled([
          secureApi.get('/api/news', true).catch(err => null),
          secureApi.get('/api/documents', true).catch(err => null),
          secureApi.get('/api/users', true).catch(err => null),
          secureApi.get('/api/establishments', true).catch(err => null),
          secureApi.get('/api/admin/services', true).catch(err => null)
        ]);

        // Traiter les réponses
        const newsData = newsRes.status === 'fulfilled' && newsRes.value 
          ? newsRes.value : [];
        const documentsData = documentsRes.status === 'fulfilled' && documentsRes.value 
          ? documentsRes.value : [];
        const usersData = usersRes.status === 'fulfilled' && usersRes.value 
          ? usersRes.value : [];
        const establishmentsData = establishmentsRes.status === 'fulfilled' && establishmentsRes.value 
          ? establishmentsRes.value : [];
        const servicesData = servicesRes.status === 'fulfilled' && servicesRes.value 
          ? servicesRes.value : { services: [] };

        setStats({
          users: Array.isArray(usersData) ? usersData.length : 0,
          news: Array.isArray(newsData) ? newsData.length : 0,
          documents: Array.isArray(documentsData) ? documentsData.length : 0,
          establishments: Array.isArray(establishmentsData) ? establishmentsData.length : 0,
          services: servicesData.services ? servicesData.services.length : 0,
          recentActivity: []
        });
      } catch (error) {
        console.error('Erreur chargement stats admin:', error);
        // Utiliser des données par défaut en cas d'erreur
        setStats({
          users: 0,
          news: 0,
          documents: 0,
          establishments: 0,
          services: 0,
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const adminCards = [
    {
      title: 'Utilisateurs',
      value: stats.users,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      link: '/admin/users',
      description: 'Gestion complète des comptes'
    },
    {
      title: 'Actualités',
      value: stats.news,
      icon: <Newspaper className="w-8 h-8" />,
      color: 'bg-niger-orange',
      link: '/admin/news',
      description: 'Articles et communiqués'
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-niger-green',
      link: '/admin/documents',
      description: 'Bibliothèque documentaire'
    },
    {
      title: 'Établissements',
      value: stats.establishments,
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-purple-500',
      link: '/admin/establishments',
      description: 'Réseau d\'établissements'
    },
    {
      title: 'Services',
      value: stats.services,
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
            <p className="text-white/80">Contrôle complet du système MESRIT</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {adminCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 group p-6 dark:bg-secondary-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl text-white ${card.color} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
                    {loading ? '...' : card.value}
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

      {/* Dashboard Analytics V2 */}
      <div className="mt-8">
        <NewsAnalyticsDashboardV2 />
      </div>

      {/* Actions rapides Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10">
              <Users className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light">Gérer utilisateurs</div>
            </Link>
            <Link href="/admin/settings" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10">
              <Shield className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light">Paramètres système</div>
            </Link>
            <Link href="/admin/Statistiques" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10">
              <BarChart3 className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light">Stats avancées</div>
            </Link>
            <Link href="/admin/logs" className="p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10">
              <Activity className="w-6 h-6 text-niger-orange mb-2" />
              <div className="text-sm font-medium text-niger-green dark:text-niger-green-light">Journaux système</div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-niger-orange" />
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Alertes système</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-800 dark:text-green-300">Système opérationnel</div>
                <div className="text-green-600 dark:text-green-400">Tous les services fonctionnent</div>
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
  const [stats, setStats] = useState({
    myNews: 0,
    myDocuments: 0,
    pendingReviews: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEditorStats = async () => {
      try {
        setLoading(true);
        
        // Charger les données depuis les API existantes
        const [newsRes, documentsRes] = await Promise.allSettled([
          secureApi.get('/api/news', true).catch(err => null),
          secureApi.get('/api/documents', true).catch(err => null)
        ]);

        // Traiter les réponses
        const newsData = newsRes.status === 'fulfilled' && newsRes.value 
          ? newsRes.value : [];
        const documentsData = documentsRes.status === 'fulfilled' && documentsRes.value 
          ? documentsRes.value : [];

        // Calculer les statistiques
        const totalNews = Array.isArray(newsData) ? newsData.length : 0;
        const totalDocuments = Array.isArray(documentsData) ? documentsData.length : 0;
        
        // Filtrer par auteur si possible
        const myNews = user?.username 
          ? newsData.filter(n => n.createdBy === user.id || n.author === user.username).length 
          : 0;
        const myDocuments = user?.username 
          ? documentsData.filter(d => d.createdBy === user.id || d.author === user.username).length 
          : 0;
        const pendingReviews = newsData.filter(n => n.status === 'draft').length;

        setStats({
          myNews,
          myDocuments,
          pendingReviews,
          totalNews,
          totalDocuments
        });
      } catch (error) {
        console.error('Erreur chargement stats éditeur:', error);
        // Utiliser des données par défaut
        setStats({
          myNews: 0,
          myDocuments: 0,
          pendingReviews: 0,
          totalNews: 0,
          totalDocuments: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEditorStats();
  }, [user]);

  const editorCards = [
    {
      title: 'Mes actualités',
      value: stats.myNews,
      total: stats.totalNews,
      icon: <Newspaper className="w-8 h-8" />,
      color: 'bg-niger-orange',
      link: '/admin/news',
      action: 'Créer une actualité'
    },
    {
      title: 'Mes documents',
      value: stats.myDocuments,
      total: stats.totalDocuments,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-niger-green',
      link: '/admin/documents',
      action: 'Ajouter un document'
    },
    {
      title: 'En attente',
      value: stats.pendingReviews,
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
            <p className="text-white/80">Gestion du contenu et des communications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {editorCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6 dark:bg-secondary-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl text-white ${card.color}`}>
                {card.icon}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
                  {loading ? '...' : card.value}
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
              className="inline-flex items-center text-niger-orange hover:text-niger-orange-dark text-sm font-medium"
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
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Consulter les établissements</div>
              </div>
              <div className="ml-auto">
                <Eye className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/services" className="flex items-center space-x-3 p-4 bg-niger-cream dark:bg-secondary-700 rounded-xl hover:bg-niger-orange/10 transition-colors border border-niger-orange/10 group">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div>
                <div className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">Services</div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">Consulter les services</div>
              </div>
              <div className="ml-auto">
                <Eye className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal qui choisit le bon dashboard
export default function RoleDashboard() {
  const permissions = usePermission();
  
  if (permissions.isAdmin) {
    return <AdminDashboard />;
  } else {
    return <EditorDashboard />;
  }
}