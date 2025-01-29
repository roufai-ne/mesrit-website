import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import HomeNewsCarousel from './NewsCarousel';

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
        const publishedNews = data
          .filter(item => item.status === 'published')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(publishedNews);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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