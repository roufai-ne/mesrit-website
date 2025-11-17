/**
 * Composant de statistiques d'engagement pour les articles
 * Affiche les vues, temps de lecture moyen, profondeur de scroll
 */
import React, { useState, useEffect } from 'react';
import { Eye, Clock, TrendingUp } from 'lucide-react';
import { useNewsAnalyticsV2 } from '@/hooks/useNewsV2';
import clsx from 'clsx';

export default function EngagementStats({ newsId }) {
  const { getViewStats } = useNewsAnalyticsV2();
  const [stats, setStats] = useState({
    viewsCount: 0,
    totalViews: 0,
    avgReadingTime: 0,
    avgScrollDepth: 0,
    uniqueVisitors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!newsId) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getViewStats(newsId);
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [newsId, getViewStats]);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-pulse flex gap-4">
          <div className="h-8 w-20 bg-gray-200 dark:bg-secondary-700 rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-secondary-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-niger-orange/10 to-niger-green/10 dark:from-secondary-800 dark:to-secondary-700 rounded-lg p-4 border border-niger-orange/20 dark:border-secondary-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Vues totales */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Vues</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.viewsCount > 999 ? `${(stats.viewsCount / 1000).toFixed(1)}k` : stats.viewsCount}
            </div>
          </div>
        </div>

        {/* Temps de lecture moyen */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Lecture</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatTime(stats.avgReadingTime)}
            </div>
          </div>
        </div>

        {/* Profondeur de scroll moyenne */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Scroll</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(stats.avgScrollDepth)}%
            </div>
          </div>
        </div>

        {/* Visiteurs uniques */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Uniques</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.uniqueVisitors > 999 ? `${(stats.uniqueVisitors / 1000).toFixed(1)}k` : stats.uniqueVisitors}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
