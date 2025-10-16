// src/components/admin/NewsAnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRealTimeStats, useNewsAnalytics } from '@/hooks/useNewsAnalytics';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Share2, 
  Clock, 
  Users,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function NewsAnalyticsDashboard() {
  const permissions = usePermission();
  const { stats, loading, error, refresh } = useRealTimeStats(60000); // Refresh toutes les minutes
  const { getNewsStats } = useNewsAnalytics();
  
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [topArticles, setTopArticles] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données détaillées
  useEffect(() => {
    if (stats?.data) {
      setTopArticles(stats.data.topArticles || []);
      setCategoryStats(stats.data.categoryStats || []);
      setTrends(stats.data.trends || []);
    }
  }, [stats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Le hook useRealTimeStats se rechargera automatiquement
  };

  if (!permissions.canManageSystem) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Restreint</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions pour accéder aux analytics.</p>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-xl"></div>
            <div className="bg-gray-200 h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de Chargement</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const globalStats = stats?.data?.global || {};

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
            Analytics des Actualités
          </h1>
          <p className="text-readable-muted dark:text-muted-foreground">
            Statistiques et métriques de performance des articles
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-niger-orange/20 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
            <option value={365}>1 an</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total des vues */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {globalStats.totalViews?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Vues totales
              </div>
            </div>
          </div>
        </div>

        {/* Vues uniques */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {globalStats.totalUniqueViews?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Visiteurs uniques
              </div>
            </div>
          </div>
        </div>

        {/* Total des partages */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {globalStats.totalShares?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Partages totaux
              </div>
            </div>
          </div>
        </div>

        {/* Articles publiés */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {globalStats.totalArticles || '0'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Articles actifs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Articles les Plus Populaires
            </h2>
            <TrendingUp className="w-5 h-5 text-niger-orange" />
          </div>
          
          <div className="space-y-4">
            {topArticles.slice(0, 5).map((article, index) => (
              <div key={article.newsId} className="flex items-center justify-between p-3 bg-niger-cream/50 dark:bg-secondary-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-niger-orange text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-niger-green dark:text-niger-green-light line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-readable-muted dark:text-muted-foreground">
                        {article.category}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-niger-orange">
                    {article.totalViews?.toLocaleString()}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    vues
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats par Catégorie */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Performance par Catégorie
            </h2>
            <Filter className="w-5 h-5 text-niger-orange" />
          </div>
          
          <div className="space-y-4">
            {categoryStats.slice(0, 5).map((category, index) => (
              <div key={category._id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-niger-green dark:text-niger-green-light">
                    {category._id || 'Non catégorisé'}
                  </span>
                  <span className="text-sm text-readable-muted dark:text-muted-foreground">
                    {category.articleCount} articles
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 dark:bg-secondary-600 rounded-full h-2">
                    <div 
                      className="bg-niger-orange h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((category.totalViews / Math.max(...categoryStats.map(c => c.totalViews))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-niger-orange">
                    {category.totalViews?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-6">
          Métriques Détaillées
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-niger-orange mb-2">
              {globalStats.avgViewsPerArticle?.toFixed(1) || '0'}
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Vues moyennes par article
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-niger-green dark:text-niger-green-light mb-2">
              {globalStats.avgSharesPerArticle?.toFixed(1) || '0'}
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Partages moyens par article
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {globalStats.totalShares && globalStats.totalViews 
                ? ((globalStats.totalShares / globalStats.totalViews) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Taux d'engagement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}