import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import HomeNewsCarousel from './NewsCarousel';
import { secureApi, useApiAction } from '@/lib/secureApi';

export default function News() {
  const [news, setNews] = useState([]);
  const { execute, loading, error } = useApiAction();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      await execute(async () => {
        // Utiliser secureApi.get avec false pour indiquer que c'est un endpoint public
        const data = await secureApi.get('/api/news', false);

        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }

        const publishedNews = data
          .filter(item => item.status === 'published')
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setNews(publishedNews);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-[400px] bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-red-500">Erreur: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Actualités
            </h2>
            <p className="text-gray-600">
              Restez informé des dernières nouvelles du ministère
            </p>
          </div>
          <Link
            href="/actualites"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
          >
            Toutes les actualités
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {news.length > 0 && (
          <HomeNewsCarousel
            news={news}
            autoplay={5000}
            indicators
            navigation
            onSlideChange={(index) => console.log(`Slide ${index}`)}
          />
        )}
      </div>
    </section>
  );
}