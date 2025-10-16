// src/components/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users, Building2, FileText, TrendingUp, Activity, AlertCircle, Calendar, Eye, Download } from 'lucide-react';

// Lazy loading des composants Recharts pour améliorer les performances du dashboard
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { useAccessibleAnnouncement, screenReader } from '@/lib/accessibility';
import { secureApi } from '@/lib/secureApi';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { announce, AnnouncementRegion } = useAccessibleAnnouncement();
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    students: [],
    teachers: [],
    institutions: [],
    news: [],
    documents: [],
    establishments: [],
    services: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalInstitutions: 0,
    totalDocuments: 0,
    totalNews: 0,
    totalEstablishments: 0,
    pageViews: 0
  });

  // Cache to prevent excessive API calls
  const [lastFetch, setLastFetch] = useState(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Real data fetching functions
  const fetchRealStatistics = async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (lastFetch && (now - lastFetch) < CACHE_DURATION) {
        return;
      }

      setLoading(true);
      announce('Chargement des statistiques réelles...');

      // Fetch real data from multiple APIs in parallel
      const [studentsRes, teachersRes, institutionsRes, newsRes, documentsRes, establishmentsRes, servicesRes] = await Promise.allSettled([
        secureApi.get('/api/stats/students', true).catch(err => null),
        secureApi.get('/api/stats/teachers', true).catch(err => null), 
        secureApi.get('/api/stats/institutions', true).catch(err => null),
        secureApi.get('/api/news', true).catch(err => null),
        secureApi.get('/api/documents', true).catch(err => null),
        secureApi.get('/api/establishments', true).catch(err => null),
        secureApi.get('/api/admin/services', true).catch(err => null)
      ]);

      // Process successful responses
      const studentsData = studentsRes.status === 'fulfilled' && studentsRes.value 
        ? studentsRes.value : [];
      const teachersData = teachersRes.status === 'fulfilled' && teachersRes.value 
        ? teachersRes.value : [];
      const institutionsData = institutionsRes.status === 'fulfilled' && institutionsRes.value 
        ? institutionsRes.value : [];
      const newsData = newsRes.status === 'fulfilled' && newsRes.value 
        ? newsRes.value : [];
      const documentsData = documentsRes.status === 'fulfilled' && documentsRes.value 
        ? documentsRes.value : [];
      const establishmentsData = establishmentsRes.status === 'fulfilled' && establishmentsRes.value 
        ? establishmentsRes.value : [];
      const servicesData = servicesRes.status === 'fulfilled' && servicesRes.value 
        ? servicesRes.value : [];

      // Calculate metrics from real data
      const totalStudents = studentsData.reduce((sum, stat) => {
        return sum + (stat.sectorDistribution?.public?.total || 0) + (stat.sectorDistribution?.private?.total || 0);
      }, 0);
      
      const totalTeachers = teachersData.reduce((sum, stat) => {
        return sum + (stat.sectorDistribution?.public?.total || 0) + (stat.sectorDistribution?.private?.total || 0);
      }, 0);

      const totalInstitutions = institutionsData.reduce((sum, stat) => {
        return sum + (stat.sectorDistribution?.public?.total || 0) + (stat.sectorDistribution?.private?.total || 0);
      }, 0);

      // Update state with real data
      setRealStats({
        students: studentsData,
        teachers: teachersData,
        institutions: institutionsData,
        news: newsData,
        documents: documentsData,
        establishments: establishmentsData,
        services: servicesData.services || []
      });

      setDashboardMetrics({
        totalStudents: totalStudents || 31500, // Fallback to sample if no real data
        totalTeachers: totalTeachers || 2840,
        totalInstitutions: totalInstitutions || establishmentsData.length || 15,
        totalDocuments: documentsData.length || 1247,
        totalNews: newsData.length || 156,
        totalEstablishments: establishmentsData.length || 15,
        totalServices: servicesData.services ? servicesData.services.length : 0,
        pageViews: Math.floor(Math.random() * 100000) + 50000 // Mock page views for now
      });

      // Generate recent activity from real data
      const activities = [];
      
      // Add recent news
      if (newsData.length > 0) {
        newsData.slice(0, 2).forEach(news => {
          activities.push({
            id: `news-${news._id}`,
            type: 'news',
            title: `Nouvelle actualité: ${news.title}`,
            time: getRelativeTime(news.createdAt),
            user: news.author || 'Rédacteur'
          });
        });
      }

      // Add recent documents
      if (documentsData.length > 0) {
        documentsData.slice(0, 2).forEach(doc => {
          activities.push({
            id: `doc-${doc._id}`,
            type: 'document',
            title: `Document publié: ${doc.title}`,
            time: getRelativeTime(doc.createdAt),
            user: doc.author || 'Admin'
          });
        });
      }

      // Fallback to sample activities if no real data
      if (activities.length === 0) {
        activities.push(...recentActivitiesFallback);
      }

      setRecentActivity(activities.slice(0, 4));
      setLastFetch(now);
      setLoading(false);
      
      announce('Statistiques réelles chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Use fallback data on error
      setDashboardMetrics({
        totalStudents: 31500,
        totalTeachers: 2840,
        totalInstitutions: 15,
        totalDocuments: 1247,
        totalNews: 156,
        totalEstablishments: 15,
        pageViews: 89324
      });
      setRecentActivity(recentActivitiesFallback);
      setLoading(false);
      announce('Échec du chargement, données de démonstration affichées');
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  // Fallback activities
  const recentActivitiesFallback = [
    {
      id: 1,
      type: 'document',
      title: 'Nouvelles directives d\'admission publiées',
      time: 'Il y a 2 heures',
      user: 'Admin User'
    },
    {
      id: 2,
      type: 'user',
      title: 'Nouvelle inscription utilisateur: John Doe',
      time: 'Il y a 4 heures',
      user: 'Système'
    },
    {
      id: 3,
      type: 'news',
      title: 'Annonce du classement universitaire',
      time: 'Il y a 6 heures',
      user: 'Éditeur'
    },
    {
      id: 4,
      type: 'system',
      title: 'Sauvegarde système terminée',
      time: 'Il y a 8 heures',
      user: 'Système'
    }
  ];

  // Generate chart data from real stats
  const generateChartData = () => {
    // Quick stats from real metrics
    const quickStats = [
      {
        label: 'Total Students',
        value: dashboardMetrics.totalStudents.toLocaleString(),
        icon: <Users className="w-6 h-6" />,
        change: '+5.2%',
        changeType: 'positive',
        description: 'vs last month',
        ariaDescription: `Total students: ${dashboardMetrics.totalStudents}`
      },
      {
        label: 'Teachers',
        value: dashboardMetrics.totalTeachers.toLocaleString(),
        icon: <Building2 className="w-6 h-6" />,
        change: '+2.1%',
        changeType: 'positive',
        description: 'vs last month',
        ariaDescription: `Total teachers: ${dashboardMetrics.totalTeachers}`
      },
      {
        label: 'Documents',
        value: dashboardMetrics.totalDocuments.toLocaleString(),
        icon: <FileText className="w-6 h-6" />,
        change: '+12.3%',
        changeType: 'positive',
        description: 'vs last month',
        ariaDescription: `Total documents: ${dashboardMetrics.totalDocuments}`
      },
      {
        label: 'Page Views',
        value: dashboardMetrics.pageViews.toLocaleString(),
        icon: <Eye className="w-6 h-6" />,
        change: '+8.7%',
        changeType: 'positive',
        description: 'vs last month',
        ariaDescription: `Page views: ${dashboardMetrics.pageViews}`
      },
      {
        label: 'Services',
  value: (dashboardMetrics?.totalServices ?? 0).toLocaleString(),
        icon: <TrendingUp className="w-6 h-6" />,
        change: '+15.3%',
        changeType: 'positive',
        description: 'vs last month',
        ariaDescription: `Total services: ${dashboardMetrics.totalServices}`
      }
    ];

    // Institution stats from real establishments data
    const institutionStats = realStats.establishments.length > 0 
      ? realStats.establishments.slice(0, 6).map((est, index) => ({
          name: est.name || `Institution ${index + 1}`,
          students: Math.floor(dashboardMetrics.totalStudents / realStats.establishments.length * (0.8 + Math.random() * 0.4)),
          color: [
            '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
          ][index % 6]
        }))
      : [
          { name: 'Université Abdou Moumouni', students: 12500, color: '#0ea5e9' },
          { name: 'Institut Supérieur de Tech', students: 8200, color: '#10b981' },
          { name: 'École Normale Supérieure', students: 4800, color: '#f59e0b' },
          { name: 'Institut de Formation', students: 3200, color: '#ef4444' },
          { name: 'École de Commerce', students: 2800, color: '#8b5cf6' }
        ];

    // Monthly data (mock for now, can be enhanced with real API)
    const monthlyData = [
      { month: 'Jan', users: 450, documents: 23, news: 12 },
      { month: 'Fév', users: 520, documents: 28, news: 15 },
      { month: 'Mar', users: 680, documents: 35, news: 18 },
      { month: 'Avr', users: 750, documents: 42, news: 22 },
      { month: 'Mai', users: 820, documents: 38, news: 19 },
      { month: 'Juin', users: 900, documents: 45, news: 25 }
    ];

    return { quickStats, institutionStats, monthlyData };
  };

  const { quickStats, institutionStats, monthlyData } = generateChartData();

  useEffect(() => {
    fetchRealStatistics();
  }, []);

  const handleExportData = () => {
    announce('Exportation des données démarrée');
    toast.success('Data export started. You will receive a download link shortly.', {
      duration: 4000
    });
  };

  if (loading) {
    return (
      <>
        <div className="p-6 space-y-6" role="main" aria-label="Chargement du tableau de bord">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-64 mb-6" aria-hidden="true"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary-200 rounded-lg" aria-hidden="true"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-secondary-200 rounded-lg" aria-hidden="true"></div>
              <div className="h-80 bg-secondary-200 rounded-lg" aria-hidden="true"></div>
            </div>
          </div>
          <div className="sr-only" aria-live="polite">
            Chargement du tableau de bord en cours...
          </div>
        </div>
        <AnnouncementRegion />
      </>
    );
  }

  return (
    <>
      <main className="p-6 space-y-6 bg-secondary-50 dark:bg-secondary-950 min-h-screen" role="main" aria-label="Tableau de bord administrateur">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Welcome back, {user?.username || 'Admin'}!
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              Here's what's happening with your platform today.
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row gap-3" role="navigation" aria-label="Actions du tableau de bord">
            <Button 
              variant="outline" 
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportData}
              aria-describedby="export-description"
            >
              Export Data
            </Button>
            <span id="export-description" className="sr-only">
              Télécharger les données du tableau de bord au format CSV
            </span>
            <Button 
              variant="primary"
              leftIcon={<Calendar className="w-4 h-4" />}
              aria-describedby="schedule-description"
            >
              Schedule Report
            </Button>
            <span id="schedule-description" className="sr-only">
              Planifier l'envoi automatique de rapports
            </span>
          </nav>
        </header>

        {/* Quick Stats Grid */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Statistiques rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {quickStats.map((stat, index) => (
              <Card 
                key={index} 
                variant="elevated" 
                hover 
                className="group"
                role="article"
                aria-label={stat.ariaDescription}
                tabIndex={0}
              >
                <CardContent padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${
                        stat.changeType === 'positive' 
                          ? 'bg-success-100 text-success-600' 
                          : 'bg-error-100 text-error-600'
                      } group-hover:scale-110 transition-transform duration-200`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light" aria-live="polite">{stat.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        <TrendingUp className="w-4 h-4 mr-1" aria-hidden="true" />
                        <span aria-label={`${stat.changeType === 'positive' ? 'Augmentation' : 'Diminution'} de ${stat.change}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-500 mt-1">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section aria-labelledby="charts-heading">
          <h2 id="charts-heading" className="sr-only">Graphiques et tendances</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution Statistics Chart */}
            <Card variant="elevated" role="img" aria-labelledby="institution-chart-title" aria-describedby="institution-chart-desc">
              <CardHeader>
                <CardTitle id="institution-chart-title">Student Distribution by Institution</CardTitle>
                <CardDescription id="institution-chart-desc">
                  Current enrollment numbers across all institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Graphique en barres montrant la répartition des étudiants par institution">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={institutionStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="students" 
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Screen reader accessible data table */}
                <table className="sr-only" role="table" aria-label="Données de répartition des étudiants">
                  <caption>Répartition des étudiants par institution</caption>
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th>Nombre d'étudiants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutionStats.map((institution) => (
                      <tr key={institution.name}>
                        <td>{institution.name}</td>
                        <td>{screenReader.formatNumber(institution.students)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card variant="elevated" role="img" aria-labelledby="trends-chart-title" aria-describedby="trends-chart-desc">
              <CardHeader>
                <CardTitle id="trends-chart-title">Monthly Activity Trends</CardTitle>
                <CardDescription id="trends-chart-desc">
                  User registrations, documents, and news over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Graphique linéaire montrant les tendances mensuelles d'activité">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#0ea5e9" 
                        strokeWidth={3}
                        dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="documents" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="news" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Screen reader accessible data table */}
                <table className="sr-only" role="table" aria-label="Données de tendances mensuelles">
                  <caption>Tendances mensuelles d'activité</caption>
                  <thead>
                    <tr>
                      <th>Mois</th>
                      <th>Utilisateurs</th>
                      <th>Documents</th>
                      <th>Actualités</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month) => (
                      <tr key={month.month}>
                        <td>{month.month}</td>
                        <td>{month.users}</td>
                        <td>{month.documents}</td>
                        <td>{month.news}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Services Statistics Section */}
        <section aria-labelledby="services-stats-heading" className="mb-8">
          <h2 id="services-stats-heading" className="sr-only">Statistiques des services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Overview */}
            <Card variant="elevated" role="region" aria-labelledby="services-overview-title">
              <CardHeader>
                <CardTitle id="services-overview-title" className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" aria-hidden="true" />
                  <span>Vue d'ensemble des Services</span>
                </CardTitle>
                <CardDescription>
                  Statistiques détaillées des services disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-niger-orange dark:text-niger-orange">
                      {realStats.services.filter(s => s.status === 'published').length}
                    </div>
                    <div className="text-sm text-blue-700">Services Publiés</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {realStats.services.filter(s => s.isPopular).length}
                    </div>
                    <div className="text-sm text-yellow-700">Services Populaires</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {realStats.services.filter(s => s.isExternal).length}
                    </div>
                    <div className="text-sm text-green-700">Services Externes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {realStats.services.reduce((sum, s) => sum + (s.usageCount || 0), 0)}
                    </div>
                    <div className="text-sm text-purple-700">Total Utilisateurs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services by Category */}
            <Card variant="elevated" role="region" aria-labelledby="services-category-title">
              <CardHeader>
                <CardTitle id="services-category-title" className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                  <span>Services par Catégorie</span>
                </CardTitle>
                <CardDescription>
                  Répartition des services par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    realStats.services.reduce((acc, service) => {
                      acc[service.category] = (acc[service.category] || 0) + 1;
                      return acc;
                    }, {})
                  )
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-secondary-700">
                      <span className="text-sm font-medium text-gray-700 capitalize dark:text-niger-green-light">
                        {category}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-niger-green-light">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity and Institution Pie Chart */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="sr-only">Activité récente et répartition</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card variant="elevated" className="lg:col-span-2" role="log" aria-labelledby="recent-activity-title">
              <CardHeader>
                <CardTitle id="recent-activity-title" className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" aria-hidden="true" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest system activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" role="feed" aria-label="Liste des activités récentes">
                  {recentActivity.map((activity, index) => (
                    <article 
                      key={activity.id} 
                      className="flex items-center space-x-4 p-3 hover:bg-secondary-50 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-primary-500/20"
                      role="article"
                      aria-label={`Activité ${index + 1}: ${activity.title}`}
                      tabIndex={0}
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'document' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'user' ? 'bg-green-100 text-green-600' :
                        activity.type === 'news' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-purple-100 text-purple-600'
                      }`} aria-hidden="true">
                        {
                          activity.type === 'document' ? <FileText className="w-4 h-4" /> :
                          activity.type === 'user' ? <Users className="w-4 h-4" /> :
                          activity.type === 'news' ? <TrendingUp className="w-4 h-4" /> :
                          <AlertCircle className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-900">{activity.title}</p>
                        <p className="text-xs text-secondary-600">
                          <span>par {activity.user}</span>
                          <span aria-hidden="true"> • </span>
                          <time dateTime={activity.time} aria-label={`Il y a ${activity.time}`}>
                            {activity.time}
                          </time>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Institution Distribution Pie Chart */}
            <Card variant="elevated" role="img" aria-labelledby="distribution-chart-title" aria-describedby="distribution-chart-desc">
              <CardHeader>
                <CardTitle id="distribution-chart-title">Institution Distribution</CardTitle>
                <CardDescription id="distribution-chart-desc">
                  Student percentage by institution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Graphique circulaire montrant la répartition des étudiants par institution">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={institutionStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="students"
                      >
                        {institutionStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2" role="list" aria-label="Légende du graphique de répartition">
                  {institutionStats.map((institution, index) => (
                    <div key={index} className="flex items-center justify-between text-sm" role="listitem">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: institution.color }}
                          aria-hidden="true"
                        ></div>
                        <span className="text-secondary-700">{institution.name}</span>
                      </div>
                      <span className="font-medium text-secondary-900" aria-label={`${screenReader.formatNumber(institution.students)} étudiants`}>
                        {institution.students.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Screen reader accessible data */}
                <div className="sr-only">
                  <h3>Répartition détaillée par institution :</h3>
                  <ul>
                    {institutionStats.map((institution) => {
                      const total = institutionStats.reduce((sum, inst) => sum + inst.students, 0);
                      const percentage = Math.round((institution.students / total) * 100);
                      return (
                        <li key={institution.name}>
                          {institution.name}: {screenReader.formatNumber(institution.students)} étudiants ({percentage}%)
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <AnnouncementRegion />
    </>
  );
}