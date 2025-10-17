// src/components/admin/NewsAnalyticsDashboardV2.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNewsAnalyticsV2 } from '@/hooks/useNewsV2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Dashboard Analytics V2 - Interface moderne pour les nouvelles analytics
 */
export default function NewsAnalyticsDashboardV2() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedNews, setSelectedNews] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { getGlobalStats, getNewsStats } = useNewsAnalyticsV2();

  const [globalStats, setGlobalStats] = useState(null);
  const [newsStats, setNewsStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les statistiques globales
  useEffect(() => {
    loadGlobalStats();
  }, [selectedPeriod]);

  // Charger les statistiques spécifiques quand un article est sélectionné
  useEffect(() => {
    if (selectedNews && dateRange.startDate && dateRange.endDate) {
      loadNewsStats();
    }
  }, [selectedNews, dateRange]);

  const loadGlobalStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getGlobalStats(selectedPeriod);
      setGlobalStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement stats globales:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNewsStats = async () => {
    try {
      setLoading(true);
      const stats = await getNewsStats(
        selectedNews,
        new Date(dateRange.startDate),
        new Date(dateRange.endDate)
      );
      setNewsStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement stats article:', err);
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique de tendance des vues
  const viewsTrendData = useMemo(() => {
    if (!globalStats?.overview?.dailyBreakdown) return null;

    const labels = globalStats.overview.dailyBreakdown.map(day =>
      new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    );

    const viewsData = globalStats.overview.dailyBreakdown.map(day => day.views);
    const sharesData = globalStats.overview.dailyBreakdown.map(day => day.shares);

    return {
      labels,
      datasets: [
        {
          label: 'Vues',
          data: viewsData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Partages',
          data: sharesData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: false
        }
      ]
    };
  }, [globalStats]);

  // Données pour le graphique des articles populaires
  const topArticlesData = useMemo(() => {
    if (!globalStats?.topArticles) return null;

    const labels = globalStats.topArticles.slice(0, 10).map(article =>
      article.title.length > 30 ? article.title.substring(0, 30) + '...' : article.title
    );

    const viewsData = globalStats.topArticles.slice(0, 10).map(article => article.totalViews);

    return {
      labels,
      datasets: [
        {
          label: 'Vues totales',
          data: viewsData,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(244, 63, 94, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [globalStats]);

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const barChartOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de vues'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Articles'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard V2
            </h1>
            <p className="text-gray-600">
              Tableau de bord avancé avec analytics en temps réel
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
            {/* Sélecteur de période */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
              <option value={365}>Année complète</option>
            </select>

            {/* Bouton de rechargement */}
            <button
              onClick={loadGlobalStats}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? '⏳' : '🔄'} Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Métriques principales */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vues totales"
            value={globalStats.overview.totalViews?.toLocaleString()}
            trend={globalStats.trends.viewsGrowth}
            icon="👁️"
            color="blue"
          />
          <MetricCard
            title="Vues uniques"
            value={globalStats.overview.totalUniqueViews?.toLocaleString()}
            icon="👤"
            color="green"
          />
          <MetricCard
            title="Partages"
            value={globalStats.overview.totalShares?.toLocaleString()}
            trend={globalStats.trends.sharesGrowth}
            icon="📤"
            color="orange"
          />
          <MetricCard
            title="Articles actifs"
            value={globalStats.overview.activeArticles?.toLocaleString()}
            icon="📰"
            color="purple"
          />
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tendance des vues */}
        {viewsTrendData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tendance des vues et partages</h3>
            <div className="h-80">
              <Line data={viewsTrendData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Articles populaires */}
        {topArticlesData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 des articles</h3>
            <div className="h-80">
              <Bar data={topArticlesData} options={barChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Métriques détaillées */}
      {globalStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temps de lecture moyen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Temps de lecture moyen</span>
                <span className="font-medium">
                  {Math.round(globalStats.overview.avgReadingTime)} sec
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profondeur de scroll moyenne</span>
                <span className="font-medium">
                  {Math.round(globalStats.overview.avgScrollDepth)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux d'engagement</span>
                <span className="font-medium">
                  {globalStats.overview.totalShares > 0
                    ? Math.round((globalStats.overview.totalShares / globalStats.overview.totalViews) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance système */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Performance système</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Croissance des vues</span>
                <span className={`font-medium ${
                  globalStats.trends.viewsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {globalStats.trends.viewsGrowth > 0 ? '+' : ''}{globalStats.trends.viewsGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Croissance des partages</span>
                <span className={`font-medium ${
                  globalStats.trends.sharesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {globalStats.trends.sharesGrowth > 0 ? '+' : ''}{globalStats.trends.sharesGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Période analysée</span>
                <span className="font-medium">{selectedPeriod} jours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des top articles avec détails */}
      {globalStats?.topArticles && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Articles les plus performants</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps moyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {globalStats.topArticles.slice(0, 5).map((article, index) => (
                  <tr key={article._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{article.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.totalViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.totalShares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(article.avgReadingTime)}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedNews(article._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Composant pour afficher une métrique avec tendance
 */
function MetricCard({ title, value, trend, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm flex items-center mt-1 ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️'}
              {Math.abs(trend)}% vs période précédente
            </p>
          )}
        </div>
        <div className="text-3xl opacity-75">
          {icon}
        </div>
      </div>
    </div>
  );
}