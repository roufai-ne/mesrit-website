// src/components/admin/SEODashboard.js
import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { 
  Target, 
  TrendingUp, 
  Search, 
  Link, 
  FileText, 
  Eye, 
  Image,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function SEODashboard() {
  const { loading, getSEOStats } = useSEO();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    try {
      const data = await getSEOStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement statistiques SEO:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPercentageIcon = (percentage) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (loading && !stats) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-niger-orange mx-auto mb-4" />
        <p className="text-readable-muted dark:text-muted-foreground">
          Chargement des statistiques SEO...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
            Dashboard SEO
          </h1>
          <p className="text-readable-muted dark:text-muted-foreground">
            Optimisation et performance SEO des actualités
          </p>
        </div>
        
        <button
          onClick={loadStats}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {stats && (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total articles */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Total Articles
                  </p>
                  <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {stats.totalArticles}
                  </p>
                </div>
              </div>
            </div>

            {/* Articles avec slug */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <Link className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Avec Slug
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                      {stats.withSlug}
                    </p>
                    <span className={`text-sm font-medium ${getPercentageColor(stats.slugPercentage)}`}>
                      {stats.slugPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta titles */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Meta Titles
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                      {stats.withMetaTitle}
                    </p>
                    <span className={`text-sm font-medium ${getPercentageColor(stats.metaTitlePercentage)}`}>
                      {stats.metaTitlePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta descriptions */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Meta Descriptions
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                      {stats.withMetaDescription}
                    </p>
                    <span className={`text-sm font-medium ${getPercentageColor(stats.metaDescriptionPercentage)}`}>
                      {stats.metaDescriptionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques de progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimisation SEO */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
                Optimisation SEO
              </h3>
              
              <div className="space-y-4">
                {/* Slugs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPercentageIcon(stats.slugPercentage)}
                      <span className="text-sm font-medium">Slugs URL</span>
                    </div>
                    <span className={`text-sm font-bold ${getPercentageColor(stats.slugPercentage)}`}>
                      {stats.slugPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-niger-orange to-niger-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.slugPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Meta Titles */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPercentageIcon(stats.metaTitlePercentage)}
                      <span className="text-sm font-medium">Meta Titles</span>
                    </div>
                    <span className={`text-sm font-bold ${getPercentageColor(stats.metaTitlePercentage)}`}>
                      {stats.metaTitlePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-niger-orange to-niger-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.metaTitlePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Meta Descriptions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPercentageIcon(stats.metaDescriptionPercentage)}
                      <span className="text-sm font-medium">Meta Descriptions</span>
                    </div>
                    <span className={`text-sm font-bold ${getPercentageColor(stats.metaDescriptionPercentage)}`}>
                      {stats.metaDescriptionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-niger-orange to-niger-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.metaDescriptionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPercentageIcon(stats.imagePercentage)}
                      <span className="text-sm font-medium">Images</span>
                    </div>
                    <span className={`text-sm font-bold ${getPercentageColor(stats.imagePercentage)}`}>
                      {stats.imagePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-niger-orange to-niger-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.imagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
                Recommandations
              </h3>
              
              <div className="space-y-4">
                {stats.slugPercentage < 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Optimiser les slugs URL
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-300">
                        {stats.totalArticles - stats.withSlug} articles sans slug optimisé
                      </p>
                    </div>
                  </div>
                )}

                {stats.metaTitlePercentage < 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Ajouter des meta titles
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-300">
                        {stats.totalArticles - stats.withMetaTitle} articles sans meta title
                      </p>
                    </div>
                  </div>
                )}

                {stats.metaDescriptionPercentage < 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Ajouter des meta descriptions
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        {stats.totalArticles - stats.withMetaDescription} articles sans meta description
                      </p>
                    </div>
                  </div>
                )}

                {stats.imagePercentage < 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Image className="w-5 h-5 text-blue-600 mt-0.5" alt="Icône d'image" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Ajouter des images
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        {stats.totalArticles - stats.withImage} articles sans image
                      </p>
                    </div>
                  </div>
                )}

                {stats.slugPercentage >= 80 && stats.metaTitlePercentage >= 80 && 
                 stats.metaDescriptionPercentage >= 80 && stats.imagePercentage >= 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Excellent travail !
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Votre SEO est bien optimisé
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outils SEO */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
              Outils SEO
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sitemap */}
              <a
                href="/api/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-niger-orange/20 rounded-lg hover:bg-niger-cream/30 dark:hover:bg-secondary-700 transition-colors"
              >
                <div className="p-2 bg-niger-orange/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-niger-orange" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-niger-green dark:text-niger-green-light">
                    Sitemap XML
                  </p>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Généré automatiquement
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              {/* Google Search Console */}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-niger-orange/20 rounded-lg hover:bg-niger-cream/30 dark:hover:bg-secondary-700 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-niger-green dark:text-niger-green-light">
                    Search Console
                  </p>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Analyser les performances
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              {/* PageSpeed Insights */}
              <a
                href="https://pagespeed.web.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-niger-orange/20 rounded-lg hover:bg-niger-cream/30 dark:hover:bg-secondary-700 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-niger-green dark:text-niger-green-light">
                    PageSpeed
                  </p>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    Tester la vitesse
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}