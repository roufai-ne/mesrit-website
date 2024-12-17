// src/components/home/News.js
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        // Filtrer uniquement les actualités publiées et les 3 plus récentes
        const publishedNews = data
          .filter(item => item.status === 'published')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        setNews(publishedNews);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-t-2xl"></div>
                <div className="p-6 bg-white rounded-b-2xl shadow-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
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

        {news.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune actualité disponible pour le moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article
                key={item._id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image || '/images/news/default.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {item.summary}
                  </p>

                  <Link
                    href={`/actualites/${item._id}`}
                    className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700"
                  >
                    Lire la suite
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}