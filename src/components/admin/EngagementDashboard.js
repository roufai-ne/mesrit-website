/**
 * Tableau de bord d'engagement pour les articles de news
 * Affiche les articles avec les plus vues et likes
 */
import React, { useState, useEffect } from 'react';
import { Eye, Heart, TrendingUp, BarChart3 } from 'lucide-react';
import { secureApi } from '@/lib/secureApi';
import { toast } from 'react-hot-toast';

export default function EngagementDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('views'); // views | likes
  const [timeRange, setTimeRange] = useState('all'); // all | week | month

  useEffect(() => {
    loadEngagementData();
  }, [sortBy, timeRange]);

  const loadEngagementData = async () => {
    try {
      setLoading(true);
      // Récupérer tous les articles avec leurs stats
      const response = await secureApi.get('/api/news?limit=50&status=published', false);
      
      if (response.news) {
        // Trier les articles selon le critère
        const sorted = response.news.sort((a, b) => {
          if (sortBy === 'views') {
            return (b.viewsCount || 0) - (a.viewsCount || 0);
          } else if (sortBy === 'likes') {
            return (b.likesCount || 0) - (a.likesCount || 0);
          }
          return 0;
        });

        setArticles(sorted);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'engagement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getEngagementRate = (article) => {
    const views = article.viewsCount || 0;
    const likes = article.likesCount || 0;
    if (views === 0) return 0;
    return ((likes / views) * 100).toFixed(1);
  };

  const getTrendIndicator = (article) => {
    const engagementRate = getEngagementRate(article);
    if (engagementRate > 5) return { color: 'text-green-600', label: 'Excellente' };
    if (engagementRate > 2) return { color: 'text-blue-600', label: 'Bonne' };
    if (engagementRate > 0.5) return { color: 'text-orange-600', label: 'Moyenne' };
    return { color: 'text-gray-600', label: 'Faible' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-secondary-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-niger-orange/10 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="text-sm text-readable-muted dark:text-muted-foreground mb-2 block">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20"
            >
              <option value="views">Vues (décroissant)</option>
              <option value="likes">Likes (décroissant)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-readable-muted dark:text-muted-foreground mb-2 block">
              Période
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20"
            >
              <option value="all">Tous les temps</option>
              <option value="month">Ce mois</option>
              <option value="week">Cette semaine</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadEngagementData}
          className="px-4 py-2 bg-niger-orange hover:bg-niger-orange-dark text-white rounded-lg transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-niger-orange/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                  Article
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    Vues
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-red-600 dark:text-red-400">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4" />
                    Likes
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-niger-green dark:text-niger-green-light">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Engagement
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niger-orange/10">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-readable-muted dark:text-muted-foreground">
                    Aucun article trouvé
                  </td>
                </tr>
              ) : (
                articles.map((article, index) => {
                  const engagementTrend = getTrendIndicator(article);
                  const engagementRate = getEngagementRate(article);

                  return (
                    <tr
                      key={article._id}
                      className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-niger-green dark:text-niger-green-light">
                            #{index + 1} - {article.title}
                          </div>
                          <div className="text-xs text-readable-muted dark:text-muted-foreground mt-1">
                            {article.category} • Publié le {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-readable dark:text-foreground">
                            {formatNumber(article.viewsCount || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4 text-red-600 dark:text-red-400 fill-current" />
                          <span className="font-semibold text-readable dark:text-foreground">
                            {formatNumber(article.likesCount || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-sm font-semibold ${engagementTrend.color}`}>
                            {engagementRate}%
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            engagementRate > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            engagementRate > 2 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            engagementRate > 0.5 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {engagementTrend.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total des vues</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                  {formatNumber(articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0))}
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total des likes</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
                  {formatNumber(articles.reduce((sum, a) => sum + (a.likesCount || 0), 0))}
                </div>
              </div>
              <Heart className="w-8 h-8 text-red-500 opacity-20 fill-current" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Taux d'engagement moyen</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                  {(articles.reduce((sum, a) => sum + getEngagementRate(a), 0) / articles.length).toFixed(2)}%
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
